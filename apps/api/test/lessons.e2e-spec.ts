import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { RedisService } from '../src/database/redis.service';
import { Role } from '@linguoup/database';
import cookieParser from 'cookie-parser';
import * as argon2 from 'argon2';

describe('LessonsController (e2e)', () => {
  let app: INestApplication<App>;

  // ── In-memory stores ──────────────────────────────────────────
  const mockUsers: any[] = [];
  const mockLessons: any[] = [];
  const mockCompletions: any[] = [];
  const mockProgress: any[] = [];
  const mockRedisStore = new Map<string, { value: string; expiresAt: number }>();

  let prismaFindAllCallCount = 0; // used to assert cache hit

  // ── Prisma mock ───────────────────────────────────────────────
  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        if (where.email) return mockUsers.find((u) => u.email === where.email) ?? null;
        if (where.id) return mockUsers.find((u) => u.id === where.id) ?? null;
        return null;
      }),
    },
    userPreferences: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    userProgress: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        return mockProgress.find((p) => p.userId === args.where.userId) ?? null;
      }),
      create: jest.fn().mockImplementation((args: any) => {
        const prog = { id: `prog-${Date.now()}`, ...args.data };
        mockProgress.push(prog);
        return prog;
      }),
      update: jest.fn().mockImplementation((args: any) => {
        const idx = mockProgress.findIndex((p) => p.userId === args.where.userId);
        if (idx === -1) return null;
        // Handle increment
        const updatedData: any = { ...args.data };
        if (updatedData.totalXP?.increment) {
          updatedData.totalXP = mockProgress[idx].totalXP + updatedData.totalXP.increment;
        }
        mockProgress[idx] = { ...mockProgress[idx], ...updatedData };
        return mockProgress[idx];
      }),
      upsert: jest.fn().mockImplementation((args: any) => {
        const idx = mockProgress.findIndex((p) => p.userId === args.where.userId);
        if (idx === -1) {
          const prog = { id: `prog-${Date.now()}`, ...args.create };
          mockProgress.push(prog);
          return prog;
        }
        const updatedData: any = { ...args.update };
        if (updatedData.totalXP?.increment) {
          updatedData.totalXP = mockProgress[idx].totalXP + updatedData.totalXP.increment;
        }
        mockProgress[idx] = { ...mockProgress[idx], ...updatedData };
        return mockProgress[idx];
      }),
    },
    lesson: {
      findMany: jest.fn().mockImplementation((args: any) => {
        prismaFindAllCallCount++;
        let result = [...mockLessons];
        if (args.where?.tenant_id) result = result.filter((l) => l.tenant_id === args.where.tenant_id);
        if (args.where?.theme) result = result.filter((l) => l.theme === args.where.theme);
        if (args.where?.level) result = result.filter((l) => l.level === args.where.level);
        if (args.where?.id) result = result.filter((l) => l.id === args.where.id);
        return result;
      }),
      findFirst: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        return mockLessons.find((l) => l.id === where.id && l.tenant_id === where.tenant_id) ?? null;
      }),
      count: jest.fn().mockImplementation((args: any) => {
        let result = [...mockLessons];
        if (args.where?.tenant_id) result = result.filter((l) => l.tenant_id === args.where.tenant_id);
        if (args.where?.theme) result = result.filter((l) => l.theme === args.where.theme);
        return result.length;
      }),
    },
    lessonCompletion: {
      create: jest.fn().mockImplementation((args: any) => {
        const completion = { id: `compl-${Date.now()}`, ...args.data };
        mockCompletions.push(completion);
        return completion;
      }),
    },
    $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrismaService)),
  };

  // ── Redis mock ────────────────────────────────────────────────
  const mockRedisService = {
    get: jest.fn().mockImplementation(async (key: string) => {
      const entry = mockRedisStore.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) { mockRedisStore.delete(key); return null; }
      return entry.value;
    }),
    set: jest.fn().mockImplementation(async (key: string, value: string, ttlSeconds: number) => {
      mockRedisStore.set(key, { value, expiresAt: Date.now() + (ttlSeconds || 3600) * 1000 });
    }),
    del: jest.fn(),
    exists: jest.fn().mockResolvedValue(false),
    ping: jest.fn(),
  };

  let accessToken: string;
  let seededLessonId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test?schema=public';
    process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-key-12345';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.REFRESH_TOKEN_EXPIRES_IN = '30d';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Seed a user
    const passwordHash = await argon2.hash('TestPass123!', { type: argon2.argon2id });
    const user: any = {
      id: 'user-lessons-1',
      email: 'lessons@example.com',
      name: 'Lessons User',
      passwordHash,
      role: Role.USER,
      tenant_id: 'tenant-test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.push(user);

    // Seed progress for the user
    mockProgress.push({
      id: 'prog-1',
      userId: 'user-lessons-1',
      tenant_id: 'tenant-test',
      totalXP: 100,
      currentLevel: 1,
      currentStreakDays: 3,
      longestStreak: 5,
      lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    });

    // Seed a regular lesson
    const lesson: any = {
      id: 'lesson-test-1',
      tenant_id: 'tenant-test',
      title: 'Test Lesson A1',
      description: 'A test lesson',
      level: 'A1',
      theme: 'greetings',
      durationMinutes: 10,
      content: { slides: [] },
      createdAt: new Date(),
    };
    mockLessons.push(lesson);
    seededLessonId = lesson.id;

    // Seed 10 assessment lessons
    for (let i = 0; i < 10; i++) {
      mockLessons.push({
        id: `assessment-${i}`,
        tenant_id: 'tenant-test',
        title: `Assessment Q${i}`,
        description: 'assessment question',
        level: 'A1',
        theme: 'assessment',
        durationMinutes: 1,
        content: {
          type: 'question',
          question: `Question ${i}?`,
          options: ['A', 'B', 'C', 'D'],
          answer: 'A',
        },
        createdAt: new Date(),
      });
    }

    // Login to get access token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'lessons@example.com', password: 'TestPass123!' });
    accessToken = loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── 10.1 Complete lesson flow ─────────────────────────────────
  describe('10.1 POST /lessons/:id/complete — full flow', () => {
    it('should create LessonCompletion, update XP, and update streak', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/lessons/${seededLessonId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ score: 80, timeSpentSeconds: 300 })
        .expect(200);

      expect(res.body.data).toMatchObject({
        xpEarned: expect.any(Number),
        newTotalXP: expect.any(Number),
        streakUpdated: expect.any(Boolean),
        streakDays: expect.any(Number),
      });

      // Verify LessonCompletion was created
      expect(mockPrismaService.lessonCompletion.create).toHaveBeenCalled();

      // Verify UserProgress was updated
      expect(mockPrismaService.userProgress.update).toHaveBeenCalled();
    });

    it('should return 404 for unknown lesson id', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/lessons/unknown-lesson-id/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ score: 80, timeSpentSeconds: 300 })
        .expect(404);
    });

    it('should return 400 for score > 100', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/lessons/${seededLessonId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ score: 150, timeSpentSeconds: 300 })
        .expect(400);
    });
  });

  // ── 10.2 Transaction rollback ─────────────────────────────────
  describe('10.2 Transaction rollback on failure', () => {
    it('should propagate error when $transaction throws', async () => {
      const originalTx = mockPrismaService.$transaction;
      mockPrismaService.$transaction = jest.fn().mockRejectedValueOnce(new Error('Simulated DB failure'));

      const res = await request(app.getHttpServer())
        .post(`/api/v1/lessons/${seededLessonId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ score: 50, timeSpentSeconds: 120 });

      // Should return a 5xx error because the transaction failed
      expect(res.status).toBeGreaterThanOrEqual(500);

      mockPrismaService.$transaction = originalTx;
    });
  });

  // ── 10.3 Redis cache: 2nd GET /lessons does not hit DB ────────
  describe('10.3 GET /lessons — Redis cache hit on 2nd call', () => {
    it('2nd call should use Redis cache (no extra DB query)', async () => {
      mockRedisStore.clear();
      prismaFindAllCallCount = 0;

      // First call — cache miss → DB is hit
      await request(app.getHttpServer())
        .get('/api/v1/lessons')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const dbCallsAfterFirst = prismaFindAllCallCount;

      // Second call — cache hit → DB should NOT be queried again
      await request(app.getHttpServer())
        .get('/api/v1/lessons')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(prismaFindAllCallCount).toBe(dbCallsAfterFirst); // no additional DB calls
    });
  });

  // ── Auth guard ─────────────────────────────────────────────────
  describe('Authentication', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/v1/lessons').expect(401);
    });
  });
});

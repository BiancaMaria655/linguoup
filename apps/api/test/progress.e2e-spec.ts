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

describe('ProgressController (e2e)', () => {
  let app: INestApplication<App>;

  // ── In-memory stores ──────────────────────────────────────────
  const mockUsers: any[] = [];
  const mockLessons: any[] = [];
  const mockCompletions: any[] = [];
  const mockProgress: any[] = [];
  const mockPreferences: any[] = [];
  const mockRedisStore = new Map<string, { value: string; expiresAt: number }>();

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
      findUnique: jest.fn().mockImplementation((args: any) =>
        mockPreferences.find((p) => p.userId === args.where.userId) ?? null,
      ),
      update: jest.fn().mockImplementation((args: any) => {
        const idx = mockPreferences.findIndex((p) => p.userId === args.where.userId);
        if (idx === -1) return null;
        mockPreferences[idx] = { ...mockPreferences[idx], ...args.data, updatedAt: new Date() };
        return mockPreferences[idx];
      }),
    },
    userProgress: {
      findUnique: jest.fn().mockImplementation((args: any) =>
        mockProgress.find((p) => p.userId === args.where.userId) ?? null,
      ),
      create: jest.fn().mockImplementation((args: any) => {
        const prog = { id: `prog-${Date.now()}`, ...args.data };
        mockProgress.push(prog);
        return prog;
      }),
      update: jest.fn().mockImplementation((args: any) => {
        const idx = mockProgress.findIndex((p) => p.userId === args.where.userId);
        if (idx === -1) return null;
        const updatedData: any = { ...args.data };
        if (updatedData.totalXP?.increment) {
          updatedData.totalXP = mockProgress[idx].totalXP + updatedData.totalXP.increment;
        }
        mockProgress[idx] = { ...mockProgress[idx], ...updatedData };
        return mockProgress[idx];
      }),
    },
    lesson: {
      findMany: jest.fn().mockImplementation(() => mockLessons),
      findFirst: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        return mockLessons.find((l) => l.id === where.id && l.tenant_id === where.tenant_id) ?? null;
      }),
      count: jest.fn().mockResolvedValue(0),
    },
    lessonCompletion: {
      create: jest.fn().mockImplementation((args: any) => {
        const completion = { id: `compl-${Date.now()}`, ...args.data, completedAt: new Date() };
        mockCompletions.push(completion);
        return completion;
      }),
      findMany: jest.fn().mockImplementation((args: any) => {
        let result = [...mockCompletions];
        if (args.where?.userId) result = result.filter((c) => c.userId === args.where.userId);
        if (args.where?.completedAt?.gte) {
          result = result.filter((c) => c.completedAt >= args.where.completedAt.gte);
        }
        // attach lesson if include.lesson requested
        if (args.include?.lesson) {
          result = result.map((c) => ({
            ...c,
            lesson: mockLessons.find((l) => l.id === c.lessonId) ?? { durationMinutes: 10 },
          }));
        }
        return result;
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
  let seededUserId: string;

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

    // Seed user
    const passwordHash = await argon2.hash('TestPass123!', { type: argon2.argon2id });
    seededUserId = 'user-progress-1';
    const user: any = {
      id: seededUserId,
      email: 'progress@example.com',
      name: 'Progress User',
      passwordHash,
      role: Role.USER,
      tenant_id: 'tenant-test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.push(user);

    // Seed UserPreferences
    mockPreferences.push({
      userId: seededUserId,
      targetLanguage: 'en',
      learningGoal: 'travel',
      dailyGoalMinutes: 15,
      dailyGoalLessons: 1,
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed UserProgress
    mockProgress.push({
      id: 'prog-progress-1',
      userId: seededUserId,
      tenant_id: 'tenant-test',
      totalXP: 100,
      currentLevel: 1,
      currentStreakDays: 3,
      longestStreak: 5,
      lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    });

    // Seed a lesson
    const lesson: any = {
      id: 'lesson-progress-1',
      tenant_id: 'tenant-test',
      title: 'Progress Test Lesson',
      description: 'A lesson for progress testing',
      level: 'A1',
      theme: 'greetings',
      durationMinutes: 12,
      content: { slides: [] },
      createdAt: new Date(),
    };
    mockLessons.push(lesson);
    seededLessonId = lesson.id;

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'progress@example.com', password: 'TestPass123!' });
    accessToken = loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── 8.1 GET /api/v1/progress after completing a lesson ────────
  describe('8.1 Complete lesson → GET /progress', () => {
    it('should reflect updated totalXP and lessonsCompleted after lesson completion', async () => {
      // Complete a lesson first
      await request(app.getHttpServer())
        .post(`/api/v1/lessons/${seededLessonId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ score: 80, timeSpentSeconds: 300 })
        .expect(200);

      // GET /progress and verify updated fields
      const res = await request(app.getHttpServer())
        .get('/api/v1/progress')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        totalXP: expect.any(Number),
        currentLevel: expect.any(Number),
        lessonsCompleted: expect.any(Number),
        minutesStudied: expect.any(Number),
        vocabularyLearned: expect.any(Number),
      });

      expect(res.body.data.lessonsCompleted).toBeGreaterThanOrEqual(1);
      expect(res.body.data.weeklyActivity).toHaveLength(7);
      expect(res.body.data.monthlyActivity).toHaveLength(4);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/v1/progress').expect(401);
    });
  });

  // ── 8.2 GET /api/v1/streak after completing a lesson ─────────
  describe('8.2 Complete lesson → GET /streak', () => {
    it('should include today as active in activityCalendar', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/streak')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        currentStreak: expect.any(Number),
        longestStreak: expect.any(Number),
        activityCalendar: expect.any(Array),
      });

      expect(res.body.data.activityCalendar).toHaveLength(30);

      const today = new Date().toISOString().slice(0, 10);
      const todayEntry = res.body.data.activityCalendar.find((e: any) => e.date === today);
      expect(todayEntry).toBeDefined();
      expect(todayEntry.active).toBe(true);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/v1/streak').expect(401);
    });
  });

  // ── 8.3 PATCH /api/v1/users/me/goals ─────────────────────────
  describe('8.3 PATCH /users/me/goals', () => {
    it('should update both dailyGoalMinutes and dailyGoalLessons and verify persistence', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me/goals')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dailyGoalMinutes: 30, dailyGoalLessons: 3 })
        .expect(200);

      expect(res.body.data).toMatchObject({
        dailyGoalMinutes: 30,
        dailyGoalLessons: 3,
        updatedAt: expect.any(String),
      });
    });

    it('should update only dailyGoalMinutes', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me/goals')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dailyGoalMinutes: 20 })
        .expect(200);

      expect(res.body.data.dailyGoalMinutes).toBe(20);
    });

    it('should return 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/goals')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when dailyGoalMinutes exceeds max (120)', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/goals')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dailyGoalMinutes: 200 })
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/goals')
        .send({ dailyGoalMinutes: 30 })
        .expect(401);
    });
  });
});

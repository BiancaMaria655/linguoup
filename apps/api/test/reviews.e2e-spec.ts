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

describe('ReviewsController (e2e)', () => {
  let app: INestApplication<App>;

  // ── In-memory stores ──────────────────────────────────────────
  const mockUsers: any[] = [];
  const mockLessons: any[] = [];
  const mockCompletions: any[] = [];
  const mockProgress: any[] = [];
  const mockPreferences: any[] = [];
  const mockSpacedReviewItems: any[] = [];
  const mockAchievements: any[] = [];
  const mockUserAchievements: any[] = [];
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
      updateMany: jest.fn().mockImplementation((args: any) => {
        const items = mockProgress.filter(
          (p) => p.userId === args.where.userId && p.tenant_id === args.where.tenant_id,
        );
        for (const item of items) {
          if (args.data.totalXP?.increment) {
            item.totalXP += args.data.totalXP.increment;
          }
        }
        return { count: items.length };
      }),
    },
    lesson: {
      findFirst: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        return (
          mockLessons.find((l) => l.id === where.id && l.tenant_id === where.tenant_id) ?? null
        );
      }),
      findMany: jest.fn().mockImplementation(() => mockLessons),
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
        if (args.include?.lesson) {
          result = result.map((c) => ({
            ...c,
            lesson: mockLessons.find((l) => l.id === c.lessonId) ?? { durationMinutes: 10 },
          }));
        }
        return result;
      }),
      count: jest.fn().mockImplementation((args: any) =>
        mockCompletions.filter((c) => c.userId === args.where?.userId).length,
      ),
    },
    spacedReviewItem: {
      findMany: jest.fn().mockImplementation((args: any) => {
        let result = [...mockSpacedReviewItems];
        if (args.where?.userId) result = result.filter((r) => r.userId === args.where.userId);
        if (args.where?.tenant_id) result = result.filter((r) => r.tenant_id === args.where.tenant_id);
        if (args.where?.lessonId) result = result.filter((r) => r.lessonId === args.where.lessonId);
        if (args.where?.nextReviewAt?.lte) {
          result = result.filter((r) => r.nextReviewAt <= args.where.nextReviewAt.lte);
        }
        if (args.orderBy?.nextReviewAt === 'asc') {
          result.sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());
        }
        if (args.take) result = result.slice(0, args.take);
        if (args.include?.lesson) {
          result = result.map((r) => ({
            ...r,
            lesson: mockLessons.find((l) => l.id === r.lessonId) ?? { title: 'Unknown' },
          }));
        }
        return result;
      }),
      findFirst: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        let result = [...mockSpacedReviewItems];
        if (where.id) result = result.filter((r) => r.id === where.id);
        if (where.userId) result = result.filter((r) => r.userId === where.userId);
        if (where.tenant_id) result = result.filter((r) => r.tenant_id === where.tenant_id);
        const item = result[0] ?? null;
        if (item && args.include?.lesson) {
          return {
            ...item,
            lesson: mockLessons.find((l) => l.id === item.lessonId) ?? { title: 'Unknown' },
          };
        }
        return item;
      }),
      count: jest.fn().mockImplementation((args: any) => {
        let result = [...mockSpacedReviewItems];
        if (args.where?.userId) result = result.filter((r) => r.userId === args.where.userId);
        if (args.where?.tenant_id) result = result.filter((r) => r.tenant_id === args.where.tenant_id);
        if (args.where?.nextReviewAt?.lte) {
          result = result.filter((r) => r.nextReviewAt <= args.where.nextReviewAt.lte);
        }
        return result.length;
      }),
      create: jest.fn().mockImplementation((args: any) => {
        const item = { id: `review-${Date.now()}-${Math.random()}`, ...args.data, createdAt: new Date(), updatedAt: new Date() };
        mockSpacedReviewItems.push(item);
        return item;
      }),
      upsert: jest.fn().mockImplementation((args: any) => {
        const { where, create, update } = args;
        const existing = mockSpacedReviewItems.find(
          (r) =>
            r.userId === where.userId_lessonId_itemContent?.userId &&
            r.lessonId === where.userId_lessonId_itemContent?.lessonId &&
            r.itemContent === where.userId_lessonId_itemContent?.itemContent,
        );
        if (existing) {
          // On conflict: update (empty in this case — preserve existing SM-2 state)
          Object.assign(existing, update, { updatedAt: new Date() });
          return existing;
        }
        const item = { id: `review-${Date.now()}-${Math.random()}`, ...create, createdAt: new Date(), updatedAt: new Date() };
        mockSpacedReviewItems.push(item);
        return item;
      }),
      update: jest.fn().mockImplementation((args: any) => {
        const idx = mockSpacedReviewItems.findIndex((r) => r.id === args.where.id);
        if (idx === -1) return null;
        mockSpacedReviewItems[idx] = { ...mockSpacedReviewItems[idx], ...args.data, updatedAt: new Date() };
        const item = mockSpacedReviewItems[idx];
        if (args.include?.lesson) {
          return { ...item, lesson: mockLessons.find((l) => l.id === item.lessonId) ?? { title: 'Unknown' } };
        }
        return item;
      }),
    },
    achievement: {
      findMany: jest.fn().mockResolvedValue(mockAchievements),
    },
    userAchievement: {
      findMany: jest.fn().mockResolvedValue(mockUserAchievements),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
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
  let accessTokenTenantB: string;
  let seededLessonId: string;
  let seededUserId: string;
  let seededUserIdTenantB: string;

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

    // Seed tenant-A user
    const passwordHash = await argon2.hash('TestPass123!', { type: argon2.argon2id });
    seededUserId = 'user-reviews-1';
    mockUsers.push({
      id: seededUserId,
      email: 'reviews@example.com',
      name: 'Reviews User',
      passwordHash,
      role: Role.USER,
      tenant_id: 'tenant-reviews',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
    mockProgress.push({
      id: 'prog-reviews-1',
      userId: seededUserId,
      tenant_id: 'tenant-reviews',
      totalXP: 100,
      currentLevel: 1,
      currentStreakDays: 0,
      longestStreak: 0,
      lastActivityDate: null,
    });

    // Seed tenant-B user
    seededUserIdTenantB = 'user-reviews-tenantB';
    mockUsers.push({
      id: seededUserIdTenantB,
      email: 'reviews-b@example.com',
      name: 'Reviews User B',
      passwordHash,
      role: Role.USER,
      tenant_id: 'tenant-reviews-B',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPreferences.push({
      userId: seededUserIdTenantB,
      targetLanguage: 'en',
      learningGoal: 'travel',
      dailyGoalMinutes: 15,
      dailyGoalLessons: 1,
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockProgress.push({
      id: 'prog-reviews-B-1',
      userId: seededUserIdTenantB,
      tenant_id: 'tenant-reviews-B',
      totalXP: 0,
      currentLevel: 1,
      currentStreakDays: 0,
      longestStreak: 0,
      lastActivityDate: null,
    });

    // Seed a lesson with vocab slides
    const lesson: any = {
      id: 'lesson-reviews-1',
      tenant_id: 'tenant-reviews',
      title: 'Greetings Review Test',
      description: 'A lesson for review testing',
      level: 'A1',
      theme: 'greetings',
      durationMinutes: 10,
      content: {
        slides: [
          { type: 'intro', text: 'Welcome' },
          { type: 'vocab', term: 'Hello', translation: 'Olá' },
          { type: 'vocab', term: 'Goodbye', translation: 'Tchau' },
          { type: 'quiz', question: 'Translate Hello', options: ['Olá', 'Tchau'], answer: 'Olá' },
        ],
      },
      createdAt: new Date(),
    };
    mockLessons.push(lesson);
    seededLessonId = lesson.id;

    // Login tenant-A user
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'reviews@example.com', password: 'TestPass123!' });
    accessToken = loginRes.body.data?.accessToken;

    // Login tenant-B user
    const loginResB = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'reviews-b@example.com', password: 'TestPass123!' });
    accessTokenTenantB = loginResB.body.data?.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── 8.1 Full flow: complete lesson → GET recommended → POST complete ──────
  describe('8.1 Full spaced repetition flow', () => {
    let createdReviewItemId: string;

    it('step 1: complete lesson → spaced review items created', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/lessons/${seededLessonId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ score: 80, timeSpentSeconds: 300 })
        .expect(200);

      expect(res.body.data).toBeDefined();

      // Items should now exist in the in-memory store
      const reviewItems = mockSpacedReviewItems.filter(
        (r) => r.userId === seededUserId && r.lessonId === seededLessonId,
      );
      // 2 vocab slides → 2 review items
      expect(reviewItems.length).toBeGreaterThanOrEqual(2);
    });

    it('step 2: GET /reviews/recommended returns items created from lesson', async () => {
      // Force nextReviewAt to be in the past so items are "due"
      mockSpacedReviewItems
        .filter((r) => r.userId === seededUserId)
        .forEach((r) => {
          r.nextReviewAt = new Date(Date.now() - 1000); // 1 second ago
        });

      const res = await request(app.getHttpServer())
        .get('/api/v1/reviews/recommended')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.metadata).toMatchObject({
        total: expect.any(Number),
        overdueCount: expect.any(Number),
      });

      createdReviewItemId = res.body.data[0].id;
    });

    it('step 3: POST /reviews/complete with quality=4 → next interval calculated', async () => {
      expect(createdReviewItemId).toBeDefined();

      const res = await request(app.getHttpServer())
        .post('/api/v1/reviews/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ reviewItemId: createdReviewItemId, quality: 4 })
        .expect(200);

      expect(res.body.data).toMatchObject({
        nextReviewAt: expect.any(String),
        interval: expect.any(Number),
        easeFactor: expect.any(Number),
        xpEarned: 5,
      });

      // interval should be at least 1 day (SM-2 minimum)
      expect(res.body.data.interval).toBeGreaterThanOrEqual(1);
      // easeFactor remains around 2.5 for quality=4
      expect(res.body.data.easeFactor).toBeCloseTo(2.5, 1);
    });
  });

  // ── 8.2 Multi-tenant isolation ─────────────────────────────────
  describe('8.2 Multi-tenant isolation', () => {
    it('user from tenant-B should NOT see items from tenant-A', async () => {
      // Tenant-A items already exist from previous test
      const tenantAItemsBefore = mockSpacedReviewItems.filter(
        (r) => r.userId === seededUserId && r.tenant_id === 'tenant-reviews',
      );
      expect(tenantAItemsBefore.length).toBeGreaterThan(0);

      // Tenant-B user should get empty list
      const res = await request(app.getHttpServer())
        .get('/api/v1/reviews/recommended')
        .set('Authorization', `Bearer ${accessTokenTenantB}`)
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.metadata.total).toBe(0);
    });

    it('should return 401 without authorization token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/reviews/recommended')
        .expect(401);
    });
  });

  // ── 8.3 No duplicates on re-completion ────────────────────────
  describe('8.3 Re-completing the same lesson does not create duplicate review items', () => {
    it('should upsert existing items (no duplicates) on second completion', async () => {
      const countBefore = mockSpacedReviewItems.filter(
        (r) => r.userId === seededUserId && r.lessonId === seededLessonId,
      ).length;

      // Complete the same lesson again
      await request(app.getHttpServer())
        .post(`/api/v1/lessons/${seededLessonId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ score: 90, timeSpentSeconds: 250 })
        .expect(200);

      const countAfter = mockSpacedReviewItems.filter(
        (r) => r.userId === seededUserId && r.lessonId === seededLessonId,
      ).length;

      // Count should not have increased (upsert prevented duplicates)
      expect(countAfter).toBe(countBefore);
    });
  });

  // ── Validation tests ──────────────────────────────────────────
  describe('validation', () => {
    it('should return 400 for quality above 5', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reviews/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ reviewItemId: 'some-uuid-123e4567-e89b-12d3-a456-426614174000', quality: 6 })
        .expect(400);
    });

    it('should return 400 for quality below 0', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reviews/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ reviewItemId: 'some-uuid-123e4567-e89b-12d3-a456-426614174000', quality: -1 })
        .expect(400);
    });

    it('should return 400 for limit above 100', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/reviews/recommended?limit=101')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});

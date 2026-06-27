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

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUsers: any[] = [];
  const mockPreferences: any[] = [];
  const mockRedisStore = new Map<string, { value: string; expiresAt: number }>();

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        const { where, include } = args;
        let user: any = null;
        if (where.email) {
          user = mockUsers.find((u) => u.email === where.email) || null;
        }
        if (where.id) {
          user = mockUsers.find((u) => u.id === where.id) || null;
        }
        if (user && include?.preferences) {
          const prefs = mockPreferences.find((p) => p.userId === user.id) || null;
          return { ...user, preferences: prefs };
        }
        return user;
      }),
      create: jest.fn().mockImplementation((args: any) => {
        const { data } = args;
        const newUser = {
          id: `user-${Date.now()}`,
          email: data.email,
          name: data.name,
          passwordHash: data.passwordHash,
          role: data.role || Role.USER,
          tenant_id: data.tenant_id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        return newUser;
      }),
      update: jest.fn().mockImplementation((args: any) => {
        const { where, data } = args;
        const idx = mockUsers.findIndex((u) => u.id === where.id);
        if (idx === -1) return null;
        mockUsers[idx] = { ...mockUsers[idx], ...data, updatedAt: new Date() };
        return mockUsers[idx];
      }),
    },
    userPreferences: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        return mockPreferences.find((p) => p.userId === where.userId) || null;
      }),
      upsert: jest.fn().mockImplementation((args: any) => {
        const { where, create, update } = args;
        const idx = mockPreferences.findIndex((p) => p.userId === where.userId);
        if (idx === -1) {
          const newPref = { ...create };
          mockPreferences.push(newPref);
          return newPref;
        }
        mockPreferences[idx] = { ...mockPreferences[idx], ...update };
        return mockPreferences[idx];
      }),
    },
    $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrismaService)),
  };

  const mockRedisService = {
    exists: jest.fn().mockImplementation(async (key: string) => {
      const entry = mockRedisStore.get(key);
      if (!entry) return false;
      if (entry.expiresAt < Date.now()) {
        mockRedisStore.delete(key);
        return false;
      }
      return true;
    }),
    get: jest.fn().mockImplementation(async (key: string) => {
      const entry = mockRedisStore.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        mockRedisStore.delete(key);
        return null;
      }
      return entry.value;
    }),
    set: jest.fn().mockImplementation(async (key: string, value: string, ttlSeconds: number) => {
      const expiresAt = Date.now() + (ttlSeconds || 3600) * 1000;
      mockRedisStore.set(key, { value, expiresAt });
    }),
  };

  let accessTokenUserA: string;
  let accessTokenUserB: string;

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

    // Pre-seed user A with known password hash
    const passwordHash = await argon2.hash('PasswordA123!', { type: argon2.argon2id });
    const userA: any = {
      id: 'user-a',
      email: 'usera@example.com',
      name: 'User A',
      passwordHash,
      role: Role.USER,
      tenant_id: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.push(userA);

    // Pre-seed user B
    const passwordHashB = await argon2.hash('PasswordB123!', { type: argon2.argon2id });
    mockUsers.push({
      id: 'user-b',
      email: 'userb@example.com',
      name: 'User B',
      passwordHash: passwordHashB,
      role: Role.USER,
      tenant_id: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Login user A
    const loginA = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'usera@example.com', password: 'PasswordA123!' });
    accessTokenUserA = loginA.body.data.accessToken;

    // Login user B
    const loginB = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'userb@example.com', password: 'PasswordB123!' });
    accessTokenUserB = loginB.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Full onboarding journey', () => {
    it('1. GET /users/me should return profile without preferences (no onboarding)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessTokenUserA}`)
        .expect(200);

      expect(res.body.data.id).toBe('user-a');
      expect(res.body.data.preferences).toBeNull();
    });

    it('2. POST /users/me/onboarding should save preferences', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users/me/onboarding')
        .set('Authorization', `Bearer ${accessTokenUserA}`)
        .send({
          learningGoal: 'TRAVEL',
          targetLanguage: 'en-US',
          dailyGoalMinutes: 15,
          preferredStudyTime: 'MORNING',
        })
        .expect(200);

      expect(res.body.data.onboardingCompleted).toBe(true);
    });

    it('3. GET /users/me/onboarding/plan should return plan after onboarding', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me/onboarding/plan')
        .set('Authorization', `Bearer ${accessTokenUserA}`)
        .expect(200);

      expect(res.body.data.dailyLessons).toBe(2);
      expect(res.body.data.weeklyGoal).toBe(10);
      expect(res.body.data.intensity).toBe('INTERMEDIATE');
    });
  });

  describe('Data isolation', () => {
    it('User A cannot access User B data — each user only sees their own profile', async () => {
      const resA = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessTokenUserA}`)
        .expect(200);

      const resB = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessTokenUserB}`)
        .expect(200);

      expect(resA.body.data.id).toBe('user-a');
      expect(resB.body.data.id).toBe('user-b');
      expect(resA.body.data.id).not.toBe(resB.body.data.id);
    });
  });

  describe('Idempotency', () => {
    it('POST /users/me/onboarding twice with different data should update and succeed', async () => {
      // First call
      await request(app.getHttpServer())
        .post('/api/v1/users/me/onboarding')
        .set('Authorization', `Bearer ${accessTokenUserA}`)
        .send({
          learningGoal: 'CAREER',
          targetLanguage: 'es-ES',
          dailyGoalMinutes: 30,
        })
        .expect(200);

      // Second call with different data
      const res = await request(app.getHttpServer())
        .post('/api/v1/users/me/onboarding')
        .set('Authorization', `Bearer ${accessTokenUserA}`)
        .send({
          learningGoal: 'CULTURE',
          targetLanguage: 'fr-FR',
          dailyGoalMinutes: 10,
        })
        .expect(200);

      expect(res.body.data.onboardingCompleted).toBe(true);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update name with valid value', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessTokenUserA}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should return 400 for name below minimum length', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessTokenUserA}`)
        .send({ name: 'A' })
        .expect(400);
    });
  });

  describe('GET /users/me/onboarding/plan before onboarding', () => {
    it('should return 422 for user B who has not done onboarding', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me/onboarding/plan')
        .set('Authorization', `Bearer ${accessTokenUserB}`)
        .expect(422);
    });
  });

  describe('Authentication guard', () => {
    it('should return 401 for request without token', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { RedisService } from '../src/database/redis.service';
import { Role } from '@linguoup/database';
import cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUsers: any[] = [];
  const mockRedisStore = new Map<string, { value: string; expiresAt: number }>();

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation((args) => {
        const { where } = args;
        if (where.email) {
          return mockUsers.find((u) => u.email === where.email) || null;
        }
        if (where.id) {
          return mockUsers.find((u) => u.id === where.id) || null;
        }
        return null;
      }),
      create: jest.fn().mockImplementation((args) => {
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
    },
  };

  const mockRedisService = {
    exists: jest.fn().mockImplementation(async (key) => {
      const entry = mockRedisStore.get(key);
      if (!entry) return false;
      if (entry.expiresAt < Date.now()) {
        mockRedisStore.delete(key);
        return false;
      }
      return true;
    }),
    get: jest.fn().mockImplementation(async (key) => {
      const entry = mockRedisStore.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        mockRedisStore.delete(key);
        return null;
      }
      return entry.value;
    }),
    set: jest.fn().mockImplementation(async (key, value, ttlSeconds) => {
      const expiresAt = Date.now() + (ttlSeconds || 3600) * 1000;
      mockRedisStore.set(key, { value, expiresAt });
    }),
  };

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
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication critical journey', () => {
    const userPayload = {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: 'SecurePassword123!',
      tenant_id: 'tenant-test',
    };

    let refreshTokenCookie = '';

    it('1. should register a new guest user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userPayload)
        .expect(201);

      expect(response.body).toEqual({
        data: {
          userId: expect.any(String),
          email: userPayload.email,
          name: userPayload.name,
        },
        metadata: {},
      });
      expect(mockUsers.length).toBe(1);
    });

    it('2. should reject duplicate email registration', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userPayload)
        .expect(400);
    });

    it('3. should authenticate with correct credentials (login)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userPayload.email,
          password: userPayload.password,
        })
        .expect(200);

      expect(response.body).toEqual({
        data: {
          accessToken: expect.any(String),
          expiresIn: 900,
        },
        metadata: {},
      });

      const cookies = response.headers['set-cookie'] as any;
      expect(cookies).toBeDefined();
      expect(cookies.length).toBeGreaterThan(0);
      const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      refreshTokenCookie = refreshCookie!;
    });

    it('4. should reject login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userPayload.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('5. should rotate the token using refresh endpoint', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [refreshTokenCookie])
        .expect(200);

      expect(response.body).toEqual({
        data: {
          accessToken: expect.any(String),
          expiresIn: 900,
        },
        metadata: {},
      });

      const cookies = response.headers['set-cookie'] as any;
      const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();

      const oldRefreshTokenCookie = refreshTokenCookie;
      refreshTokenCookie = refreshCookie!;

      // 6. Test token reuse detection
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [oldRefreshTokenCookie])
        .expect(401);
    });

    it('7. should successfully logout and invalidate refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [refreshTokenCookie])
        .expect(200);

      expect(response.body).toEqual({
        data: {
          message: 'Logged out successfully',
        },
        metadata: {},
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [refreshTokenCookie])
        .expect(401);
    });
  });
});

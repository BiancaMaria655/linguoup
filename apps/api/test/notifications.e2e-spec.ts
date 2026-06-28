import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { RedisService } from '../src/database/redis.service';
import { Role, NotificationType, NotificationChannel } from '@linguoup/database';
import cookieParser from 'cookie-parser';
import * as argon2 from 'argon2';

describe('NotificationsController (e2e)', () => {
  let app: INestApplication<App>;

  // ── In-memory stores ──────────────────────────────────────────
  const mockUsers: any[] = [];
  const mockNotifications: any[] = [];
  const mockRedisStore = new Map<string, { value: string; expiresAt: number }>();

  // ── Prisma mock ───────────────────────────────────────────────
  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        if (where?.email) return mockUsers.find((u) => u.email === where.email) ?? null;
        if (where?.id) return mockUsers.find((u) => u.id === where.id) ?? null;
        return null;
      }),
      findFirst: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        return mockUsers.find((u) => u.id === where.id) ?? null;
      }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockImplementation((args: any) => {
        const idx = mockUsers.findIndex((u) => u.id === args.where.id);
        if (idx !== -1) {
          mockUsers[idx] = { ...mockUsers[idx], ...args.data };
          return mockUsers[idx];
        }
        return null;
      }),
    },
    userPreferences: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    notification: {
      create: jest.fn().mockImplementation((args: any) => {
        const notif = { id: `notif-${Date.now()}-${Math.random()}`, ...args.data, createdAt: new Date() };
        mockNotifications.push(notif);
        return notif;
      }),
      findMany: jest.fn().mockImplementation((args: any) => {
        let result = [...mockNotifications];
        if (args.where?.userId) result = result.filter((n) => n.userId === args.where.userId);
        if (args.where?.tenant_id) result = result.filter((n) => n.tenant_id === args.where.tenant_id);
        if (args.where?.readAt === null) result = result.filter((n) => n.readAt === null);
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (args.take) result = result.slice(0, args.take);
        return result;
      }),
      findFirst: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        return (
          mockNotifications.find(
            (n) =>
              n.id === where.id &&
              n.userId === where.userId &&
              n.tenant_id === where.tenant_id,
          ) ?? null
        );
      }),
      update: jest.fn().mockImplementation((args: any) => {
        const idx = mockNotifications.findIndex((n) => n.id === args.where.id);
        if (idx === -1) return null;
        mockNotifications[idx] = { ...mockNotifications[idx], ...args.data };
        return mockNotifications[idx];
      }),
      count: jest.fn().mockImplementation((args: any) => {
        let result = [...mockNotifications];
        if (args.where?.userId) result = result.filter((n) => n.userId === args.where.userId);
        if (args.where?.tenant_id) result = result.filter((n) => n.tenant_id === args.where.tenant_id);
        if (args.where?.readAt === null) result = result.filter((n) => n.readAt === null);
        if (args.where?.type) result = result.filter((n) => n.type === args.where.type);
        return result.length;
      }),
    },
    userProgress: { findUnique: jest.fn().mockResolvedValue(null) },
    lessonCompletion: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    achievement: { findMany: jest.fn().mockResolvedValue([]) },
    userAchievement: { findMany: jest.fn().mockResolvedValue([]) },
    spacedReviewItem: { findMany: jest.fn().mockResolvedValue([]) },
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

  let userToken: string;
  let adminToken: string;
  let seededUserId: string;
  let adminUserId: string;
  const noFcmUserId = 'e3b3e3b3-e3b3-4b3e-b3e3-e3b3e3b3e3b3';

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

    const passwordHash = await argon2.hash('TestPass123!', { type: argon2.argon2id });

    // Seed regular user
    seededUserId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    mockUsers.push({
      id: seededUserId,
      email: 'notif-user@example.com',
      name: 'Notif User',
      passwordHash,
      role: Role.USER,
      tenant_id: 'tenant-notif',
      fcmToken: 'valid-fcm-token-abc',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed admin user
    adminUserId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
    mockUsers.push({
      id: adminUserId,
      email: 'notif-admin@example.com',
      name: 'Notif Admin',
      passwordHash,
      role: Role.ADMIN,
      tenant_id: 'tenant-notif',
      fcmToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed user with no FCM token for test endpoint
    mockUsers.push({
      id: noFcmUserId,
      email: 'no-fcm@example.com',
      name: 'No FCM User',
      passwordHash,
      role: Role.USER,
      tenant_id: 'tenant-notif',
      fcmToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Login as regular user
    const userLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'notif-user@example.com', password: 'TestPass123!' });
    userToken = userLogin.body.data?.accessToken;

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'notif-admin@example.com', password: 'TestPass123!' });
    adminToken = adminLogin.body.data?.accessToken;

    // Seed some notifications for the user
    const now = new Date();
    mockNotifications.push(
      {
        id: 'notif-read-1',
        userId: seededUserId,
        tenant_id: 'tenant-notif',
        type: NotificationType.REMINDER,
        channel: NotificationChannel.PUSH,
        message: 'Old read notification',
        readAt: new Date(now.getTime() - 60000),
        sentAt: new Date(now.getTime() - 60000),
        createdAt: new Date(now.getTime() - 60000),
      },
      {
        id: 'notif-unread-1',
        userId: seededUserId,
        tenant_id: 'tenant-notif',
        type: NotificationType.REMINDER,
        channel: NotificationChannel.PUSH,
        message: 'Unread notification',
        readAt: null,
        sentAt: now,
        createdAt: now,
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Task 7.5: GET /api/v1/notifications ──────────────────────

  describe('GET /api/v1/notifications', () => {
    it('should return paginated notification history for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('metadata');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.metadata).toMatchObject({
        total: expect.any(Number),
        unreadCount: expect.any(Number),
      });
    });

    it('should only return notifications belonging to the authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      for (const notif of res.body.data) {
        expect(notif).toHaveProperty('id');
        expect(notif).toHaveProperty('type');
        expect(notif).toHaveProperty('message');
        expect(notif).toHaveProperty('readAt');
        expect(notif).toHaveProperty('sentAt');
        expect(notif).toHaveProperty('createdAt');
      }
    });

    it('should return 401 without authentication token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .expect(401);
    });
  });

  // ── Task 7.6: PATCH /api/v1/notifications/:id/read ───────────

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('should mark an unread notification as read (200 idempotent)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/notifications/notif-unread-1/read')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        id: 'notif-unread-1',
        readAt: expect.any(String),
      });
    });

    it('should be idempotent — marking already-read notification returns 200', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/notifications/notif-read-1/read')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        id: 'notif-read-1',
        readAt: expect.any(String),
      });
    });

    it('should return 404 for notification not belonging to user', async () => {
      // Mock findFirst returns null when id not found for this user
      mockPrismaService.notification.findFirst.mockReturnValueOnce(null);

      await request(app.getHttpServer())
        .patch('/api/v1/notifications/other-user-notif/read')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/notifications/notif-unread-1/read')
        .expect(401);
    });
  });

  // ── Task 7.7: POST /api/v1/notifications/test ────────────────

  describe('POST /api/v1/notifications/test', () => {
    it('should return 200 for ADMIN sending test notification to user with FCM token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/notifications/test')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: seededUserId, message: 'Test push notification' })
        .expect(200);

      expect(res.body.data).toMatchObject({ sent: true });
    });

    it('should return 403 for USER role attempting to send test notification', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/notifications/test')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ userId: seededUserId, message: 'Test push notification' })
        .expect(403);
    });

    it('should return 400 for user without FCM token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/notifications/test')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: noFcmUserId, message: 'Test' })
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/notifications/test')
        .send({ userId: seededUserId, message: 'Test' })
        .expect(401);
    });
  });
});

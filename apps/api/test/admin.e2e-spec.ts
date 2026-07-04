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

describe('Admin flow (e2e)', () => {
  let app: INestApplication<App>;

  const mockUsers: any[] = [];
  const mockLessons: any[] = [];
  const mockRedisStore = new Map<string, { value: string; expiresAt: number }>();

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        return mockUsers.find((u) => u.email === where.email || u.id === where.id) ?? null;
      }),
    },
    lesson: {
      findMany: jest.fn().mockImplementation((args: any) => {
        let result = [...mockLessons];
        if (args.where?.tenant_id) result = result.filter((l) => l.tenant_id === args.where.tenant_id);
        if (args.where?.isActive !== undefined) result = result.filter((l) => l.isActive === args.where.isActive);
        return result;
      }),
      findFirst: jest.fn().mockImplementation((args: any) => {
        const { where } = args;
        return mockLessons.find((l) => {
          let matches = l.id === where.id;
          if (where.tenant_id) matches = matches && l.tenant_id === where.tenant_id;
          if (where.isActive !== undefined) matches = matches && l.isActive === where.isActive;
          return matches;
        }) ?? null;
      }),
      create: jest.fn().mockImplementation((args: any) => {
        const lesson = { id: `lesson-${Date.now()}`, isActive: true, ...args.data };
        mockLessons.push(lesson);
        return lesson;
      }),
      update: jest.fn().mockImplementation((args: any) => {
        const idx = mockLessons.findIndex((l) => l.id === args.where.id);
        if (idx === -1) throw new Error('Not found');
        mockLessons[idx] = { ...mockLessons[idx], ...args.data };
        return mockLessons[idx];
      }),
      count: jest.fn().mockImplementation((args: any) => {
        let result = [...mockLessons];
        if (args.where?.tenant_id) result = result.filter((l) => l.tenant_id === args.where.tenant_id);
        if (args.where?.isActive !== undefined) result = result.filter((l) => l.isActive === args.where.isActive);
        return result.length;
      }),
    },
    $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrismaService)),
  };

  const mockRedisService = {
    get: jest.fn().mockImplementation(async (key: string) => {
      const entry = mockRedisStore.get(key);
      if (!entry) return null;
      return entry.value;
    }),
    set: jest.fn().mockImplementation(async (key: string, value: string) => {
      mockRedisStore.set(key, { value, expiresAt: Date.now() + 3600 * 1000 });
    }),
    del: jest.fn().mockImplementation(async (key: string) => {
      mockRedisStore.delete(key);
    }),
    delPattern: jest.fn().mockImplementation(async () => {
      mockRedisStore.clear(); // just clear all for simplicity
    }),
  };

  let adminToken: string;
  let studentToken: string;

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

    // Hash passwords
    const passwordHash = await argon2.hash('TestPass123!', { type: argon2.argon2id });

    // Seed users
    const adminUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: Role.ADMIN,
      tenant_id: 'tenant-test',
      createdAt: new Date(),
    };
    const studentUser = {
      id: 'student-1',
      email: 'student@example.com',
      name: 'Student User',
      passwordHash,
      role: Role.USER,
      tenant_id: 'tenant-test',
      createdAt: new Date(),
    };

    mockUsers.push(adminUser, studentUser);

    // Login admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'TestPass123!' });
    adminToken = adminLogin.body.data.accessToken;

    // Login student
    const studentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'student@example.com', password: 'TestPass123!' });
    studentToken = studentLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should execute full admin CRUD and student catalog exclusion flow', async () => {
    // 1. Create a lesson as admin
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/admin/lessons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'New Integration Lesson',
        description: 'Integration test description',
        level: 'beginner',
        topic: 'vocabulary',
        durationMinutes: 10,
        content: { slides: [] },
      })
      .expect(201);

    const createdLesson = createRes.body.data;
    expect(createdLesson).toHaveProperty('id');
    expect(createdLesson.title).toBe('New Integration Lesson');

    // 2. Fetch student catalog -> should contain the new lesson
    const studentCatalogRes = await request(app.getHttpServer())
      .get('/api/v1/lessons')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    const studentLessons = studentCatalogRes.body.data;
    const foundInCatalog = studentLessons.some((l: any) => l.id === createdLesson.id);
    expect(foundInCatalog).toBe(true);

    // 3. Deactivate the lesson as admin
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/lessons/${createdLesson.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // 4. Fetch student catalog again -> should NOT contain the lesson
    const studentCatalogRes2 = await request(app.getHttpServer())
      .get('/api/v1/lessons')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    const studentLessons2 = studentCatalogRes2.body.data;
    const foundInCatalog2 = studentLessons2.some((l: any) => l.id === createdLesson.id);
    expect(foundInCatalog2).toBe(false);

    // 5. Fetch lesson detail as student -> should return 404 Not Found
    await request(app.getHttpServer())
      .get(`/api/v1/lessons/${createdLesson.id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(404);
  });
});

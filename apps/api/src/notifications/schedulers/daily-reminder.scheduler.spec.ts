import { Test, TestingModule } from '@nestjs/testing';
import { DailyReminderScheduler } from './daily-reminder.scheduler';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationFactory } from '../domain/notification-factory';
import { FcmService } from '../services/fcm.service';
import { SesService } from '../services/ses.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { NotificationEntity } from '../domain/notification.entity';
import { NotificationType, NotificationChannel } from '@linguoup/database';
import { ConfigService } from '@nestjs/config';

const makeNotification = (): NotificationEntity =>
  new NotificationEntity({
    id: 'notif-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    type: NotificationType.REMINDER,
    channel: NotificationChannel.PUSH,
    message: 'Hora de praticar!',
    readAt: null,
    sentAt: new Date(),
    createdAt: new Date(),
  });

describe('DailyReminderScheduler', () => {
  let scheduler: DailyReminderScheduler;
  let mockPrisma: any;
  let mockRepo: any;
  let mockFcm: any;
  let mockSes: any;
  let mockFactory: any;

  const mockUserWithToken = {
    id: 'user-1',
    email: 'user@example.com',
    fcmToken: 'valid-fcm-token',
    tenant_id: 'tenant-1',
    preferences: {
      studyReminderEmail: false,
      studyReminderTime: '08:00',
    },
  };

  const mockUserWithEmail = {
    id: 'user-2',
    email: 'user2@example.com',
    fcmToken: null,
    tenant_id: 'tenant-1',
    preferences: {
      studyReminderEmail: true,
      studyReminderTime: '08:00',
    },
  };

  const mockUserNoPrefs = {
    id: 'user-3',
    email: 'user3@example.com',
    fcmToken: null,
    tenant_id: 'tenant-1',
    preferences: { studyReminderEmail: false, studyReminderTime: null },
  };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    mockRepo = {
      existsTodayReminder: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(makeNotification()),
    };

    mockFcm = {
      sendPush: jest.fn().mockResolvedValue(undefined),
      isUnregisteredError: jest.fn().mockReturnValue(false),
    };

    mockSes = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    mockFactory = {
      build: jest.fn().mockReturnValue(makeNotification()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyReminderScheduler,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsRepository, useValue: mockRepo },
        { provide: NotificationFactory, useValue: mockFactory },
        { provide: FcmService, useValue: mockFcm },
        { provide: SesService, useValue: mockSes },
        {
          provide: StructuredLogger,
          useValue: {
            setService: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    scheduler = module.get<DailyReminderScheduler>(DailyReminderScheduler);
  });

  describe('sendDailyReminders', () => {
    it('should not send FCM if no users match current time', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      await scheduler.sendDailyReminders();

      expect(mockFcm.sendPush).not.toHaveBeenCalled();
      expect(mockSes.sendEmail).not.toHaveBeenCalled();
    });

    it('should send FCM push for user with fcmToken', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUserWithToken]);

      await scheduler.sendDailyReminders();

      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(mockFcm.sendPush).toHaveBeenCalledWith('valid-fcm-token', expect.any(String));
    });

    it('should send SES email for user with studyReminderEmail=true', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUserWithEmail]);

      await scheduler.sendDailyReminders();

      expect(mockSes.sendEmail).toHaveBeenCalledWith(
        'user2@example.com',
        expect.any(String),
        expect.any(String),
      );
    });

    it('should skip user if reminder already sent today (deduplication)', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUserWithToken]);
      mockRepo.existsTodayReminder.mockResolvedValue(true);

      await scheduler.sendDailyReminders();

      expect(mockFcm.sendPush).not.toHaveBeenCalled();
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should skip user with no studyReminderTime', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUserNoPrefs]);

      await scheduler.sendDailyReminders();

      expect(mockFcm.sendPush).not.toHaveBeenCalled();
    });

    it('should clear fcmToken when FCM returns UNREGISTERED error', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUserWithToken]);
      const unregisteredError = new Error('UNREGISTERED');
      mockFcm.sendPush.mockRejectedValue(unregisteredError);
      mockFcm.isUnregisteredError.mockReturnValue(true);

      await scheduler.sendDailyReminders();

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { fcmToken: null },
      });
    });

    it('should continue processing remaining users when one fails (isolation)', async () => {
      const failingUser = { ...mockUserWithToken, id: 'user-fail' };
      const okUser = { ...mockUserWithToken, id: 'user-ok', fcmToken: 'token-ok' };

      mockPrisma.user.findMany.mockResolvedValue([failingUser, okUser]);
      mockFcm.sendPush
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      await scheduler.sendDailyReminders();

      // Should have attempted both sends (2 repo.create calls)
      expect(mockRepo.create).toHaveBeenCalledTimes(2);
    });
  });
});

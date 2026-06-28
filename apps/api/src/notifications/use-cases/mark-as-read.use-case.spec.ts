import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MarkAsReadUseCase } from './mark-as-read.use-case';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { NotificationEntity } from '../domain/notification.entity';
import { NotificationType, NotificationChannel } from '@linguoup/database';

const makeNotification = (readAt: Date | null = null): NotificationEntity =>
  new NotificationEntity({
    id: 'notif-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    type: NotificationType.REMINDER,
    channel: NotificationChannel.PUSH,
    message: 'Test message',
    readAt,
    sentAt: new Date(),
    createdAt: new Date(),
  });

describe('MarkAsReadUseCase', () => {
  let useCase: MarkAsReadUseCase;
  let mockRepo: jest.Mocked<Pick<NotificationsRepository, 'markAsRead'>>;

  const baseCommand = {
    notificationId: 'notif-1',
    userId: 'user-1',
    tenantId: 'tenant-1',
    traceId: 'trace-1',
  };

  beforeEach(async () => {
    mockRepo = {
      markAsRead: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkAsReadUseCase,
        { provide: NotificationsRepository, useValue: mockRepo },
        {
          provide: StructuredLogger,
          useValue: { setService: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<MarkAsReadUseCase>(MarkAsReadUseCase);
  });

  it('should mark unread notification as read and return id + readAt', async () => {
    const now = new Date();
    mockRepo.markAsRead.mockResolvedValue(makeNotification(now));

    const result = await useCase.execute(baseCommand);

    expect(result.id).toBe('notif-1');
    expect(result.readAt).toBe(now);
  });

  it('should be idempotent — if already read, return existing readAt without re-updating', async () => {
    const existingReadAt = new Date('2024-01-01T10:00:00Z');
    mockRepo.markAsRead.mockResolvedValue(makeNotification(existingReadAt));

    const result = await useCase.execute(baseCommand);

    expect(result.readAt).toEqual(existingReadAt);
    expect(mockRepo.markAsRead).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when notification not found or not owned by user', async () => {
    mockRepo.markAsRead.mockResolvedValue(null);

    await expect(useCase.execute(baseCommand)).rejects.toThrow(NotFoundException);
  });
});

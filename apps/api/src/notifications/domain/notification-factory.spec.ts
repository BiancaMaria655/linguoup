import { NotificationFactory } from './notification-factory';
import { NotificationType, NotificationChannel } from '@linguoup/database';
import { NotificationEntity } from './notification.entity';

describe('NotificationFactory', () => {
  let factory: NotificationFactory;

  beforeEach(() => {
    factory = new NotificationFactory();
  });

  it('should build a NotificationEntity with all correct fields', () => {
    const input = {
      userId: 'user-1',
      tenantId: 'tenant-1',
      type: NotificationType.REMINDER,
      channel: NotificationChannel.PUSH,
      message: 'Hora de praticar!',
    };

    const notification = factory.build(input);

    expect(notification).toBeInstanceOf(NotificationEntity);
    expect(notification.userId).toBe('user-1');
    expect(notification.tenantId).toBe('tenant-1');
    expect(notification.type).toBe(NotificationType.REMINDER);
    expect(notification.channel).toBe(NotificationChannel.PUSH);
    expect(notification.message).toBe('Hora de praticar!');
    expect(notification.readAt).toBeNull();
    expect(notification.id).toBeTruthy();
    expect(notification.sentAt).toBeInstanceOf(Date);
    expect(notification.createdAt).toBeInstanceOf(Date);
  });

  it('should assign a unique UUID to each notification', () => {
    const input = {
      userId: 'user-1',
      tenantId: 'tenant-1',
      type: NotificationType.SYSTEM,
      channel: NotificationChannel.EMAIL,
      message: 'System message',
    };

    const n1 = factory.build(input);
    const n2 = factory.build(input);

    expect(n1.id).not.toBe(n2.id);
  });

  it('should use provided sentAt if given', () => {
    const sentAt = new Date('2024-01-01T08:00:00Z');
    const notification = factory.build({
      userId: 'user-1',
      tenantId: 'tenant-1',
      type: NotificationType.REMINDER,
      channel: NotificationChannel.PUSH,
      message: 'Custom time',
      sentAt,
    });

    expect(notification.sentAt).toBe(sentAt);
  });

  it('should set readAt to null by default', () => {
    const notification = factory.build({
      userId: 'user-1',
      tenantId: 'tenant-1',
      type: NotificationType.REMINDER,
      channel: NotificationChannel.PUSH,
      message: 'Test',
    });

    expect(notification.readAt).toBeNull();
    expect(notification.isRead()).toBe(false);
  });
});

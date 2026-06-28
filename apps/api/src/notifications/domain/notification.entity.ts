import { NotificationType, NotificationChannel } from '@linguoup/database';

export class NotificationEntity {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  message: string;
  readAt: Date | null;
  sentAt: Date;
  createdAt: Date;

  constructor(data: {
    id: string;
    tenantId: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    message: string;
    readAt: Date | null;
    sentAt: Date;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.tenantId = data.tenantId;
    this.userId = data.userId;
    this.type = data.type;
    this.channel = data.channel;
    this.message = data.message;
    this.readAt = data.readAt;
    this.sentAt = data.sentAt;
    this.createdAt = data.createdAt;
  }

  isRead(): boolean {
    return this.readAt !== null;
  }

  markAsRead(at: Date = new Date()): void {
    if (!this.readAt) {
      this.readAt = at;
    }
  }
}

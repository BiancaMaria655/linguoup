import { Injectable } from '@nestjs/common';
import { NotificationType, NotificationChannel } from '@linguoup/database';
import { NotificationEntity } from './notification.entity';
import * as crypto from 'crypto';

export interface CreateNotificationInput {
  userId: string;
  tenantId: string;
  type: NotificationType;
  channel: NotificationChannel;
  message: string;
  sentAt?: Date;
}

@Injectable()
export class NotificationFactory {
  build(input: CreateNotificationInput): NotificationEntity {
    const now = new Date();
    return new NotificationEntity({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      userId: input.userId,
      type: input.type,
      channel: input.channel,
      message: input.message,
      readAt: null,
      sentAt: input.sentAt ?? now,
      createdAt: now,
    });
  }
}

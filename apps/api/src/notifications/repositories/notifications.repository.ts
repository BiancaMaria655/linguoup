import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationEntity } from '../domain/notification.entity';
import { NotificationType, NotificationChannel } from '@linguoup/database';

export interface FindByUserOptions {
  userId: string;
  tenantId: string;
  cursor?: string;
  limit?: number;
  unreadOnly?: boolean;
}

export interface FindByUserResult {
  notifications: NotificationEntity[];
  total: number;
  unreadCount: number;
  nextCursor: string | null;
}

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: NotificationEntity): Promise<NotificationEntity> {
    const record = await this.prisma.notification.create({
      data: {
        id: entity.id,
        tenant_id: entity.tenantId,
        userId: entity.userId,
        type: entity.type,
        channel: entity.channel,
        message: entity.message,
        readAt: entity.readAt,
        sentAt: entity.sentAt,
        createdAt: entity.createdAt,
      },
    });
    return this.toDomain(record);
  }

  async findByUser(options: FindByUserOptions): Promise<FindByUserResult> {
    const { userId, tenantId, cursor, limit = 20, unreadOnly = false } = options;

    const where: any = { userId, tenant_id: tenantId };
    if (unreadOnly) where.readAt = null;
    if (cursor) where.createdAt = { lt: new Date(Buffer.from(cursor, 'base64').toString()) };

    const effectiveLimit = Math.min(limit, 50);

    const [records, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: effectiveLimit + 1,
      }),
      this.prisma.notification.count({ where: { userId, tenant_id: tenantId } }),
      this.prisma.notification.count({ where: { userId, tenant_id: tenantId, readAt: null } }),
    ]);

    let nextCursor: string | null = null;
    if (records.length > effectiveLimit) {
      const lastRecord = records[effectiveLimit - 1];
      records.splice(effectiveLimit);
      nextCursor = Buffer.from(lastRecord.createdAt.toISOString()).toString('base64');
    }

    return {
      notifications: records.map((r) => this.toDomain(r)),
      total,
      unreadCount,
      nextCursor,
    };
  }

  async markAsRead(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<NotificationEntity | null> {
    const record = await this.prisma.notification.findFirst({
      where: { id, userId, tenant_id: tenantId },
    });

    if (!record) return null;

    if (record.readAt) {
      return this.toDomain(record);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return this.toDomain(updated);
  }

  async existsTodayReminder(userId: string): Promise<boolean> {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const count = await this.prisma.notification.count({
      where: {
        userId,
        type: NotificationType.REMINDER,
        sentAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return count > 0;
  }

  private toDomain(record: {
    id: string;
    tenant_id: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    message: string;
    readAt: Date | null;
    sentAt: Date;
    createdAt: Date;
  }): NotificationEntity {
    return new NotificationEntity({
      id: record.id,
      tenantId: record.tenant_id,
      userId: record.userId,
      type: record.type,
      channel: record.channel,
      message: record.message,
      readAt: record.readAt,
      sentAt: record.sentAt,
      createdAt: record.createdAt,
    });
  }
}

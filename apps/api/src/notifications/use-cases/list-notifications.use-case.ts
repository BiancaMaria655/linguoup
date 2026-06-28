import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { NotificationEntity } from '../domain/notification.entity';

export interface ListNotificationsCommand {
  userId: string;
  tenantId: string;
  traceId: string;
  cursor?: string;
  limit?: number;
  unreadOnly?: boolean;
}

export interface ListNotificationsResult {
  notifications: NotificationEntity[];
  total: number;
  unreadCount: number;
  nextCursor: string | null;
}

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('list-notifications-use-case');
  }

  async execute(command: ListNotificationsCommand): Promise<ListNotificationsResult> {
    const { userId, tenantId, traceId, cursor, limit, unreadOnly } = command;

    const result = await this.notificationsRepository.findByUser({
      userId,
      tenantId,
      cursor,
      limit,
      unreadOnly,
    });

    this.logger.log('Notifications listed', {
      trace_id: traceId,
      user_id: userId,
      tenant_id: tenantId,
      metadata: { total: result.total, unreadCount: result.unreadCount },
    });

    return result;
  }
}

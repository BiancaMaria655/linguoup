import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

export interface MarkAsReadCommand {
  notificationId: string;
  userId: string;
  tenantId: string;
  traceId: string;
}

export interface MarkAsReadResult {
  id: string;
  readAt: Date;
}

@Injectable()
export class MarkAsReadUseCase {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('mark-as-read-use-case');
  }

  async execute(command: MarkAsReadCommand): Promise<MarkAsReadResult> {
    const { notificationId, userId, tenantId, traceId } = command;

    const notification = await this.notificationsRepository.markAsRead(
      notificationId,
      userId,
      tenantId,
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    this.logger.log('Notification marked as read', {
      trace_id: traceId,
      user_id: userId,
      tenant_id: tenantId,
      metadata: { notificationId, readAt: notification.readAt },
    });

    return {
      id: notification.id,
      readAt: notification.readAt as Date,
    };
  }
}

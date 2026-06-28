import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationFactory } from '../domain/notification-factory';
import { FcmService } from '../services/fcm.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { NotificationType, NotificationChannel } from '@linguoup/database';

export interface SendTestNotificationCommand {
  adminUserId: string;
  tenantId: string;
  traceId: string;
  targetUserId: string;
  message: string;
}

export interface SendTestNotificationResult {
  sent: boolean;
}

@Injectable()
export class SendTestNotificationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationFactory: NotificationFactory,
    private readonly fcmService: FcmService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('send-test-notification-use-case');
  }

  async execute(command: SendTestNotificationCommand): Promise<SendTestNotificationResult> {
    const { adminUserId, tenantId, traceId, targetUserId, message } = command;

    const targetUser = await this.prisma.user.findFirst({
      where: { id: targetUserId },
      select: { id: true, fcmToken: true },
    });

    if (!targetUser) {
      throw new BadRequestException('Target user not found');
    }

    if (!targetUser.fcmToken) {
      throw new BadRequestException('NOTIFICATION_NO_FCM_TOKEN');
    }

    const notification = this.notificationFactory.build({
      userId: targetUserId,
      tenantId,
      type: NotificationType.SYSTEM,
      channel: NotificationChannel.PUSH,
      message,
    });

    await this.notificationsRepository.create(notification);
    await this.fcmService.sendPush(targetUser.fcmToken, message);

    this.logger.log('Test notification sent', {
      trace_id: traceId,
      user_id: adminUserId,
      tenant_id: tenantId,
      metadata: { target_user_id: targetUserId },
    });

    return { sent: true };
  }
}

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationFactory } from '../domain/notification-factory';
import { FcmService } from '../services/fcm.service';
import { SesService } from '../services/ses.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { NotificationType, NotificationChannel } from '@linguoup/database';
import * as crypto from 'crypto';

@Injectable()
export class DailyReminderScheduler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationFactory: NotificationFactory,
    private readonly fcmService: FcmService,
    private readonly sesService: SesService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('daily-reminder-scheduler');
  }

  /**
   * Runs every minute and checks each user's studyReminderTime preference.
   * Sends at most 1 reminder per user per day (UTC).
   *
   * ⚠️ Scaling note: This runs on every NestJS instance. For horizontal scaling,
   * add a distributed lock (Redis) or migrate to AWS EventBridge in V2.
   */
  @Cron('* * * * *')
  async sendDailyReminders(): Promise<void> {
    const nowUtc = new Date();
    const currentHHMM = this.toHHMM(nowUtc);

    const usersWithReminder = await this.prisma.user.findMany({
      where: {
        preferences: {
          studyReminderTime: currentHHMM,
        },
      },
      select: {
        id: true,
        email: true,
        fcmToken: true,
        tenant_id: true,
        preferences: {
          select: {
            studyReminderEmail: true,
            studyReminderTime: true,
          },
        },
      },
    });

    for (const user of usersWithReminder) {
      const traceId = crypto.randomUUID();
      try {
        await this.processUser(user, traceId);
      } catch (err) {
        this.logger.error('Unhandled error processing user reminder', String(err), {
          trace_id: traceId,
          user_id: user.id,
          tenant_id: user.tenant_id,
        });
      }
    }
  }

  private async processUser(
    user: {
      id: string;
      email: string;
      fcmToken: string | null;
      tenant_id: string;
      preferences: { studyReminderEmail: boolean; studyReminderTime: string | null } | null;
    },
    traceId: string,
  ): Promise<void> {
    // Skip if no reminder time configured
    if (!user.preferences?.studyReminderTime) return;

    // Deduplication: skip if already sent today
    const alreadySent = await this.notificationsRepository.existsTodayReminder(user.id);
    if (alreadySent) {
      this.logger.log('Reminder already sent today — skipping', {
        trace_id: traceId,
        user_id: user.id,
        tenant_id: user.tenant_id,
      });
      return;
    }

    const message = 'Hora de praticar! Continue seu progresso no LinguoUp 🎯';

    // FCM push
    if (user.fcmToken) {
      const pushNotification = this.notificationFactory.build({
        userId: user.id,
        tenantId: user.tenant_id,
        type: NotificationType.REMINDER,
        channel: NotificationChannel.PUSH,
        message,
      });

      try {
        await this.notificationsRepository.create(pushNotification);
        await this.fcmService.sendPush(user.fcmToken, message);

        this.logger.log('FCM reminder sent', {
          trace_id: traceId,
          user_id: user.id,
          tenant_id: user.tenant_id,
          metadata: { channel: 'PUSH', success: true },
        });
      } catch (err) {
        if (this.fcmService.isUnregisteredError(err)) {
          // Clean up stale FCM token
          await this.prisma.user.update({
            where: { id: user.id },
            data: { fcmToken: null },
          });
          this.logger.warn('FCM token unregistered — token cleared', {
            trace_id: traceId,
            user_id: user.id,
            tenant_id: user.tenant_id,
          });
        } else {
          this.logger.error('FCM send failed', String(err), {
            trace_id: traceId,
            user_id: user.id,
            tenant_id: user.tenant_id,
          });
        }
      }
    }

    // Email via SES
    if (user.preferences.studyReminderEmail) {
      const emailNotification = this.notificationFactory.build({
        userId: user.id,
        tenantId: user.tenant_id,
        type: NotificationType.REMINDER,
        channel: NotificationChannel.EMAIL,
        message,
      });

      try {
        await this.notificationsRepository.create(emailNotification);
        await this.sesService.sendEmail(
          user.email,
          'Não esqueça de praticar hoje! 🌟',
          message,
        );

        this.logger.log('SES reminder sent', {
          trace_id: traceId,
          user_id: user.id,
          tenant_id: user.tenant_id,
          metadata: { channel: 'EMAIL', success: true },
        });
      } catch (err) {
        this.logger.error('SES send failed', String(err), {
          trace_id: traceId,
          user_id: user.id,
          tenant_id: user.tenant_id,
          metadata: { channel: 'EMAIL', success: false },
        });
        // Isolated: continues for other users
      }
    }
  }

  private toHHMM(date: Date): string {
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}

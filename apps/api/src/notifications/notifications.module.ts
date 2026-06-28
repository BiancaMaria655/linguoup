import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationFactory } from './domain/notification-factory';
import { ListNotificationsUseCase } from './use-cases/list-notifications.use-case';
import { MarkAsReadUseCase } from './use-cases/mark-as-read.use-case';
import { SendTestNotificationUseCase } from './use-cases/send-test-notification.use-case';
import { FcmService } from './services/fcm.service';
import { SesService } from './services/ses.service';
import { DailyReminderScheduler } from './schedulers/daily-reminder.scheduler';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsRepository,
    NotificationFactory,
    ListNotificationsUseCase,
    MarkAsReadUseCase,
    SendTestNotificationUseCase,
    FcmService,
    SesService,
    DailyReminderScheduler,
  ],
})
export class NotificationsModule {}

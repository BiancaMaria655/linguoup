import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './common/logger/logger.module';
import { UsersModule } from './users/users.module';
import { LearningModule } from './learning/learning.module';
import { GamificationModule } from './gamification/gamification.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    LoggerModule,
    UsersModule,
    LearningModule,
    GamificationModule,
    NotificationsModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}

import { Global, Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { PrometheusPushService } from './prometheus-push.service';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, PrometheusPushService],
  exports: [MetricsService],
})
export class MetricsModule {}


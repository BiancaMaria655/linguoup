import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipThrottle } from '@nestjs/throttler';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';

@UseInterceptors(MetricsInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @SkipThrottle()
  @Get('health')
  async healthCheck() {
    const result = await this.appService.healthCheck();
    return { data: result, metadata: {} };
  }
}


import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { RedisService } from './database/redis.service';

export interface ServiceStatus {
  status: 'ok' | 'error';
  latencyMs?: number;
  error?: string;
}

export interface HealthCheckResult {
  api: ServiceStatus;
  database: ServiceStatus;
  redis: ServiceStatus;
  timestamp: string;
}

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    return {
      api: { status: 'ok' },
      database,
      redis,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch (err) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      await this.redis.ping();
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch (err) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}


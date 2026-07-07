import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL não está definida. Redis funcionará em modo degradado (sem cache de tokens).',
      );
    }

    this.client = new Redis(redisUrl ?? 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times >= 3) {
          this.logger.error(
            `Redis indisponível após ${times} tentativas. Verifique a variável REDIS_URL no Railway.`,
          );
          return null; // para de tentar reconectar
        }
        return Math.min(times * 500, 2000);
      },
    });

    // Impede que erros de conexão não tratados derrubem o processo
    this.client.on('error', (err: Error) => {
      this.logger.error(`Erro de conexão Redis: ${err.message}`);
    });

    // Conecta de forma não-bloqueante (lazyConnect)
    this.client.connect().catch((err: Error) => {
      this.logger.error(`Falha ao conectar ao Redis: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      this.logger.error(`Failed to delete keys with pattern ${pattern}: ${(err as Error).message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    const res = await this.client.exists(key);
    return res === 1;
  }

  async ping(): Promise<void> {
    await this.client.ping();
  }
}


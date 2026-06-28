import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { Lesson } from '@linguoup/database';
import * as crypto from 'crypto';

export interface FindAllLessonsParams {
  level?: string;
  theme?: string;
  cursor?: string;
  limit?: number;
  tenantId: string;
}

export interface LessonsPage {
  data: Lesson[];
  metadata: { cursor: string | null; total: number };
}

@Injectable()
export class LessonRepository {
  private readonly logger = new Logger(LessonRepository.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: FindAllLessonsParams): Promise<LessonsPage> {
    const { level, theme, cursor, limit = 20, tenantId } = params;

    const cacheKey = this.buildCacheKey({ level, theme, cursor, limit, tenantId });

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cached) as LessonsPage;
      }
    } catch (err) {
      this.logger.warn(`Redis get failed, falling through to DB: ${(err as Error).message}`);
    }

    const where: Record<string, unknown> = { tenant_id: tenantId };
    if (level) where['level'] = level;
    if (theme) where['theme'] = theme;

    const cursorArg = cursor ? { id: cursor } : undefined;

    const [lessons, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        take: limit + 1, // fetch one extra to determine next cursor
        skip: cursorArg ? 1 : 0,
        cursor: cursorArg,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    let nextCursor: string | null = null;
    if (lessons.length > limit) {
      const lastItem = lessons.pop()!;
      nextCursor = lastItem.id;
    }

    const result: LessonsPage = {
      data: lessons,
      metadata: { cursor: nextCursor, total },
    };

    try {
      await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    } catch (err) {
      this.logger.warn(`Redis set failed: ${(err as Error).message}`);
    }

    return result;
  }

  async findById(id: string, tenantId: string): Promise<Lesson | null> {
    return this.prisma.lesson.findFirst({
      where: { id, tenant_id: tenantId },
    });
  }

  async findAssessmentQuestions(tenantId: string): Promise<Lesson[]> {
    return this.prisma.lesson.findMany({
      where: { tenant_id: tenantId, theme: 'assessment' },
      orderBy: { createdAt: 'asc' },
    });
  }

  private buildCacheKey(params: {
    level?: string;
    theme?: string;
    cursor?: string;
    limit?: number;
    tenantId: string;
  }): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(params))
      .digest('hex')
      .slice(0, 16);
    return `lessons:catalog:${hash}`;
  }
}

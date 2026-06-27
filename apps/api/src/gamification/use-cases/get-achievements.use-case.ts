import { Injectable } from '@nestjs/common';
import { GamificationRepository } from '../repositories/gamification.repository';
import { RedisService } from '../../database/redis.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { Achievement } from '@linguoup/database';

export interface GetAchievementsCommand {
  userId: string;
  tenantId: string;
  traceId: string;
}

const CACHE_KEY = 'gamification:achievements:catalog';
const CACHE_TTL_SECONDS = 3600; // 1 hour

@Injectable()
export class GetAchievementsUseCase {
  constructor(
    private readonly gamificationRepository: GamificationRepository,
    private readonly redisService: RedisService,
    private readonly structuredLogger: StructuredLogger,
  ) {
    this.structuredLogger.setService('get-achievements-use-case');
  }

  async execute(command: GetAchievementsCommand): Promise<Achievement[]> {
    const { userId, tenantId, traceId } = command;

    // Cache-aside: try Redis first
    const cached = await this.redisService.get(CACHE_KEY);
    if (cached) {
      this.structuredLogger.log('Achievements catalog served from cache', {
        trace_id: traceId,
        user_id: userId,
        tenant_id: tenantId,
      });
      return JSON.parse(cached) as Achievement[];
    }

    // Cache miss: query DB and populate cache
    const achievements = await this.gamificationRepository.findAllAchievements();
    await this.redisService.set(CACHE_KEY, JSON.stringify(achievements), CACHE_TTL_SECONDS);

    this.structuredLogger.log('Achievements catalog retrieved from DB', {
      trace_id: traceId,
      user_id: userId,
      tenant_id: tenantId,
      metadata: { count: achievements.length },
    });

    return achievements;
  }
}

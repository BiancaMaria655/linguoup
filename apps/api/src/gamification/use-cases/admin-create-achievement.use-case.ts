import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { GamificationRepository } from '../repositories/gamification.repository';
import { RedisService } from '../../database/redis.service';
import { Achievement } from '@linguoup/database';

export interface AdminCreateAchievementCommand {
  userId: string;
  traceId: string;
  name: string;
  description: string;
  iconUrl: string;
  xpReward: number;
  criteria: any;
}

@Injectable()
export class AdminCreateAchievementUseCase {
  constructor(
    private readonly gamificationRepository: GamificationRepository,
    private readonly redisService: RedisService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('admin-create-achievement-use-case');
  }

  async execute(command: AdminCreateAchievementCommand): Promise<Achievement> {
    const { userId, traceId, name, description, iconUrl, xpReward, criteria } = command;

    this.logger.log('Admin creating achievement', {
      user_id: userId,
      trace_id: traceId,
      metadata: { name, xpReward },
    });

    const achievement = await this.gamificationRepository.createAchievement({
      name,
      description,
      iconUrl,
      xpReward,
      criteria,
    });

    // Invalidate Redis cache
    await this.redisService.del('gamification:achievements:catalog');

    return achievement;
  }
}

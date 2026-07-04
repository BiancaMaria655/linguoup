import { Injectable, NotFoundException } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { GamificationRepository } from '../repositories/gamification.repository';
import { RedisService } from '../../database/redis.service';
import { Achievement } from '@linguoup/database';

export interface AdminEditAchievementCommand {
  id: string;
  userId: string;
  traceId: string;
  name?: string;
  description?: string;
  iconUrl?: string;
  xpReward?: number;
  criteria?: any;
}

@Injectable()
export class AdminEditAchievementUseCase {
  constructor(
    private readonly gamificationRepository: GamificationRepository,
    private readonly redisService: RedisService,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('admin-edit-achievement-use-case');
  }

  async execute(command: AdminEditAchievementCommand): Promise<Achievement> {
    const { id, userId, traceId, ...updateData } = command;

    this.logger.log('Admin editing achievement', {
      achievement_id: id,
      user_id: userId,
      trace_id: traceId,
    });

    try {
      const achievement = await this.gamificationRepository.updateAchievement(id, updateData);

      // Invalidate Redis cache
      await this.redisService.del('gamification:achievements:catalog');

      return achievement;
    } catch (err) {
      this.logger.error(`Failed to edit achievement ${id}: ${(err as Error).message}`);
      throw new NotFoundException('Achievement not found');
    }
  }
}

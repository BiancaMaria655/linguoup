import { Injectable } from '@nestjs/common';
import { GamificationRepository, UserAchievementWithAchievement } from '../repositories/gamification.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

export interface GetMyAchievementsCommand {
  userId: string;
  tenantId: string;
  traceId: string;
}

@Injectable()
export class GetMyAchievementsUseCase {
  constructor(
    private readonly gamificationRepository: GamificationRepository,
    private readonly structuredLogger: StructuredLogger,
  ) {
    this.structuredLogger.setService('get-my-achievements-use-case');
  }

  async execute(command: GetMyAchievementsCommand): Promise<UserAchievementWithAchievement[]> {
    const { userId, tenantId, traceId } = command;

    const userAchievements = await this.gamificationRepository.findUserAchievements(userId, tenantId);

    this.structuredLogger.log('User achievements retrieved', {
      trace_id: traceId,
      user_id: userId,
      tenant_id: tenantId,
      metadata: { count: userAchievements.length },
    });

    return userAchievements;
  }
}

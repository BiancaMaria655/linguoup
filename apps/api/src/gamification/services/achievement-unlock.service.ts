import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

export interface EvaluateInput {
  userId: string;
  tenantId: string;
  totalXP: number;
  currentStreakDays: number;
  lessonsCompleted: number;
}

export interface AchievementUnlocked {
  id: string;
  name: string;
  iconUrl: string;
}

interface AchievementCriteria {
  type: 'lessons_completed' | 'streak_days' | 'total_xp';
  threshold: number;
}

@Injectable()
export class AchievementUnlockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly structuredLogger: StructuredLogger,
  ) {
    this.structuredLogger.setService('achievement-unlock-service');
  }

  async evaluate(input: EvaluateInput): Promise<AchievementUnlocked[]> {
    const { userId, tenantId, totalXP, currentStreakDays, lessonsCompleted } = input;

    // 1. Load all achievements from DB
    const allAchievements = await this.prisma.achievement.findMany();

    // 2. Load achievements already unlocked by this user (IDs only)
    const alreadyUnlocked = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(alreadyUnlocked.map((ua) => ua.achievementId));

    // 3. Evaluate each achievement criterion
    const eligible = allAchievements.filter((achievement) => {
      if (unlockedIds.has(achievement.id)) return false;

      const criteria = achievement.criteria as unknown as AchievementCriteria;
      if (!criteria?.type || criteria.threshold === undefined) return false;

      switch (criteria.type) {
        case 'lessons_completed':
          return lessonsCompleted >= criteria.threshold;
        case 'streak_days':
          return currentStreakDays >= criteria.threshold;
        case 'total_xp':
          return totalXP >= criteria.threshold;
        default:
          return false;
      }
    });

    if (eligible.length === 0) return [];

    // 4. Idempotent bulk insert via createMany + skipDuplicates
    await this.prisma.userAchievement.createMany({
      skipDuplicates: true,
      data: eligible.map((a) => ({
        userId,
        achievementId: a.id,
        tenant_id: tenantId,
      })),
    });

    // 5. Log unlocked achievements (no sensitive data)
    this.structuredLogger.log('Achievements unlocked', {
      user_id: userId,
      tenant_id: tenantId,
      metadata: { achievementNames: eligible.map((a) => a.name) },
    });

    // 6. Return newly unlocked achievements
    return eligible.map((a) => ({
      id: a.id,
      name: a.name,
      iconUrl: a.iconUrl,
    }));
  }
}

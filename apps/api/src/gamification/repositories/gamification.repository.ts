import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Achievement, UserAchievement } from '@linguoup/database';

export interface UserAchievementWithAchievement extends UserAchievement {
  achievement: Achievement;
}

@Injectable()
export class GamificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllAchievements(): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findUserAchievements(
    userId: string,
    tenantId: string,
  ): Promise<UserAchievementWithAchievement[]> {
    return this.prisma.userAchievement.findMany({
      where: { userId, tenant_id: tenantId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'asc' },
    }) as Promise<UserAchievementWithAchievement[]>;
  }

  async findUserLessonsCompleted(userId: string): Promise<number> {
    return this.prisma.lessonCompletion.count({ where: { userId } });
  }
}

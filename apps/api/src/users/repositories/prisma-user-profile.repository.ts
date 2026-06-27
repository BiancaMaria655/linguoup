import { Injectable } from '@nestjs/common';
import { User, UserPreferences } from '@linguoup/database';
import { PrismaService } from '../../database/prisma.service';
import {
  UserProfileRepository,
  UpdateProfileData,
  UpsertPreferencesData,
} from '../interfaces/user-preferences-repository.interface';

@Injectable()
export class PrismaUserProfileRepository implements UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findByIdWithPreferences(
    userId: string,
  ): Promise<(User & { preferences: UserPreferences | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
      },
    });
  }

  async upsertPreferences(
    userId: string,
    data: UpsertPreferencesData,
  ): Promise<UserPreferences> {
    return this.prisma.$transaction(async (tx) => {
      return tx.userPreferences.upsert({
        where: { userId },
        create: {
          userId,
          learningGoal: data.learningGoal,
          targetLanguage: data.targetLanguage,
          dailyGoalMinutes: data.dailyGoalMinutes,
          preferredStudyTime: data.preferredStudyTime ?? undefined,
          onboardingCompleted: data.onboardingCompleted,
        },
        update: {
          learningGoal: data.learningGoal,
          targetLanguage: data.targetLanguage,
          dailyGoalMinutes: data.dailyGoalMinutes,
          preferredStudyTime: data.preferredStudyTime ?? null,
          onboardingCompleted: data.onboardingCompleted,
        },
      });
    });
  }

  async findPreferencesByUserId(userId: string): Promise<UserPreferences | null> {
    return this.prisma.userPreferences.findUnique({
      where: { userId },
    });
  }
}

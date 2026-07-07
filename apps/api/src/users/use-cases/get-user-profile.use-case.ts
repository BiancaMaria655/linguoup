import { Injectable, NotFoundException } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/user-preferences-repository.interface';
import { IUserProfile, UserLevel } from '../interfaces/user-profile.interface';

export interface GetUserProfileCommand {
  userId: string;
  tenantId: string;
}

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async execute(command: GetUserProfileCommand): Promise<IUserProfile> {
    const { userId } = command;

    const user = await this.userProfileRepository.findByIdWithPreferences(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as IUserProfile['role'],
      level: (user.preferences?.proficiencyLevel as UserLevel) ?? 'BEGINNER',
      preferences: user.preferences
        ? {
            learningGoal: user.preferences.learningGoal,
            targetLanguage: user.preferences.targetLanguage,
            dailyGoalMinutes: user.preferences.dailyGoalMinutes,
            preferredStudyTime: user.preferences.preferredStudyTime,
            onboardingCompleted: user.preferences.onboardingCompleted,
          }
        : null,
      createdAt: user.createdAt,
    };
  }
}

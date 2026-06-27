import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { UserProfileRepository } from '../interfaces/user-preferences-repository.interface';

export interface SaveOnboardingCommand {
  userId: string;
  tenantId: string;
  traceId: string;
  learningGoal: string;
  targetLanguage: string;
  dailyGoalMinutes: number;
  preferredStudyTime?: string | null;
}

export interface SaveOnboardingResult {
  onboardingCompleted: boolean;
}

@Injectable()
export class SaveOnboardingUseCase {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly logger: StructuredLogger,
  ) {
    this.logger.setService('save-onboarding-use-case');
  }

  async execute(command: SaveOnboardingCommand): Promise<SaveOnboardingResult> {
    const { userId, tenantId, traceId, learningGoal, targetLanguage, dailyGoalMinutes, preferredStudyTime } = command;

    await this.userProfileRepository.upsertPreferences(userId, {
      learningGoal,
      targetLanguage,
      dailyGoalMinutes,
      preferredStudyTime: preferredStudyTime ?? null,
      onboardingCompleted: true,
    });

    this.logger.log('Onboarding saved successfully', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
    });

    return { onboardingCompleted: true };
  }
}

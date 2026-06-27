import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/user-preferences-repository.interface';
import { UserDomainService } from '../domain/user.domain-service';
import { IInitialPlan } from '../interfaces/user-profile.interface';

export interface GetInitialPlanCommand {
  userId: string;
  tenantId: string;
}

@Injectable()
export class GetInitialPlanUseCase {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(command: GetInitialPlanCommand): Promise<IInitialPlan> {
    const { userId } = command;

    const preferences = await this.userProfileRepository.findPreferencesByUserId(userId);

    if (!preferences || !preferences.onboardingCompleted) {
      throw new UnprocessableEntityException({
        error: {
          code: 'ONBOARDING_INCOMPLETE',
          message: 'Complete o onboarding antes de acessar o plano',
        },
      });
    }

    return this.userDomainService.calculateInitialPlan(
      preferences.dailyGoalMinutes,
      preferences.targetLanguage,
    );
  }
}

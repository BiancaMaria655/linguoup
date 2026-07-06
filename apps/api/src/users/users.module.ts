import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UserProfileRepository } from './interfaces/user-preferences-repository.interface';
import { PrismaUserProfileRepository } from './repositories/prisma-user-profile.repository';
import { UserDomainService } from './domain/user.domain-service';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { SaveOnboardingUseCase } from './use-cases/save-onboarding.use-case';
import { GetInitialPlanUseCase } from './use-cases/get-initial-plan.use-case';
import { UpdateGoalsUseCase } from './use-cases/update-goals.use-case';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    {
      provide: UserProfileRepository,
      useClass: PrismaUserProfileRepository,
    },
    UserDomainService,
    GetUserProfileUseCase,
    UpdateProfileUseCase,
    SaveOnboardingUseCase,
    GetInitialPlanUseCase,
    UpdateGoalsUseCase,
  ],
  exports: [UserProfileRepository],
})
export class UsersModule {}

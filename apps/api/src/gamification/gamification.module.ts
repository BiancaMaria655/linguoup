import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GamificationController } from './controllers/gamification.controller';
import { GamificationRepository } from './repositories/gamification.repository';
import { AchievementUnlockService } from './services/achievement-unlock.service';
import { GetXpUseCase } from './use-cases/get-xp.use-case';
import { GetAchievementsUseCase } from './use-cases/get-achievements.use-case';
import { GetMyAchievementsUseCase } from './use-cases/get-my-achievements.use-case';

@Module({
  imports: [AuthModule],
  controllers: [GamificationController],
  providers: [
    GamificationRepository,
    AchievementUnlockService,
    GetXpUseCase,
    GetAchievementsUseCase,
    GetMyAchievementsUseCase,
  ],
  exports: [AchievementUnlockService],
})
export class GamificationModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GamificationController } from './controllers/gamification.controller';
import { AdminAchievementsController } from './controllers/admin-achievements.controller';
import { GamificationRepository } from './repositories/gamification.repository';
import { AchievementUnlockService } from './services/achievement-unlock.service';
import { GetXpUseCase } from './use-cases/get-xp.use-case';
import { GetAchievementsUseCase } from './use-cases/get-achievements.use-case';
import { GetMyAchievementsUseCase } from './use-cases/get-my-achievements.use-case';
import { AdminCreateAchievementUseCase } from './use-cases/admin-create-achievement.use-case';
import { AdminEditAchievementUseCase } from './use-cases/admin-edit-achievement.use-case';

@Module({
  imports: [AuthModule],
  controllers: [GamificationController, AdminAchievementsController],
  providers: [
    GamificationRepository,
    AchievementUnlockService,
    GetXpUseCase,
    GetAchievementsUseCase,
    GetMyAchievementsUseCase,
    AdminCreateAchievementUseCase,
    AdminEditAchievementUseCase,
  ],
  exports: [AchievementUnlockService],
})
export class GamificationModule {}

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { LessonRepository } from '../repositories/lesson.repository';
import { ProgressRepository } from '../repositories/progress.repository';
import { LearningDomainService } from '../services/learning-domain.service';
import { AchievementUnlockService, AchievementUnlocked } from '../../gamification/services/achievement-unlock.service';

const BASE_XP = 50;

export interface CompleteLessonCommand {
  lessonId: string;
  userId: string;
  tenantId: string;
  traceId: string;
  score: number;
  timeSpentSeconds: number;
}

export interface CompleteLessonResult {
  xpEarned: number;
  newTotalXP: number;
  streakUpdated: boolean;
  streakDays: number;
  newAchievements: AchievementUnlocked[];
}

@Injectable()
export class CompleteLessonUseCase {
  private readonly logger = new Logger(CompleteLessonUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lessonRepository: LessonRepository,
    private readonly progressRepository: ProgressRepository,
    private readonly learningDomainService: LearningDomainService,
    private readonly structuredLogger: StructuredLogger,
    private readonly achievementUnlockService: AchievementUnlockService,
  ) {
    this.structuredLogger.setService('complete-lesson-use-case');
  }

  async execute(command: CompleteLessonCommand): Promise<CompleteLessonResult> {
    const { lessonId, userId, tenantId, traceId, score } = command;

    // Verify lesson exists and belongs to tenant
    const lesson = await this.lessonRepository.findById(lessonId, tenantId);
    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    const xpEarned = this.learningDomainService.calculateXp(score, BASE_XP);
    const today = new Date();

    // Load current progress (outside transaction for streak computation)
    const existingProgress = await this.progressRepository.findProgressByUserId(userId);
    const { newStreakDays, streakUpdated } = this.learningDomainService.computeStreak(
      existingProgress?.lastActivityDate ?? null,
      existingProgress?.currentStreakDays ?? 0,
      today,
    );

    let txResult: { xpEarned: number; newTotalXP: number; streakUpdated: boolean; streakDays: number };

    try {
      txResult = await this.prisma.$transaction(async (tx) => {
        // 1. Create lesson completion record
        await this.progressRepository.createLessonCompletion(tx, {
          userId,
          lessonId,
          tenantId,
          score,
          xpEarned,
        });

        // 2. Upsert progress (increment XP)
        const updatedProgress = await this.progressRepository.upsertProgress(tx, {
          userId,
          tenantId,
          xpEarned,
        });

        // 3. Update streak
        const longestStreak = Math.max(
          existingProgress?.longestStreak ?? 0,
          newStreakDays,
        );

        await tx.userProgress.update({
          where: { userId },
          data: {
            currentStreakDays: newStreakDays,
            longestStreak,
            lastActivityDate: today,
          },
        });

        return {
          xpEarned,
          newTotalXP: updatedProgress.totalXP,
          streakUpdated,
          streakDays: newStreakDays,
        };
      });
    } catch (err) {
      // Task 7.3: error reporting — capture without logging sensitive data
      // Replace this logger call with Sentry.captureException(err) when Sentry SDK is installed
      this.logger.error(
        `Transaction failed for lesson completion: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw err; // re-throw so NestJS exception filter handles HTTP response
    }

    // After transaction commits: evaluate and unlock achievements (non-critical)
    let newAchievements: AchievementUnlocked[] = [];
    try {
      const lessonsCompleted = await this.progressRepository.findLessonsCompletedCount(userId);
      newAchievements = await this.achievementUnlockService.evaluate({
        userId,
        tenantId,
        totalXP: txResult.newTotalXP,
        currentStreakDays: txResult.streakDays,
        lessonsCompleted,
      });
    } catch (err) {
      // Non-critical: achievement unlock failure must not block lesson completion
      this.logger.error(
        `Achievement evaluation failed for user ${userId}: ${(err as Error).message}`,
        (err as Error).stack,
      );
    }

    this.structuredLogger.log('Lesson completed successfully', {
      user_id: userId,
      tenant_id: tenantId,
      trace_id: traceId,
      metadata: { lessonId, score, xpEarned, streakDays: txResult.streakDays, newAchievementsCount: newAchievements.length },
    });

    return {
      ...txResult,
      newAchievements,
    };
  }
}

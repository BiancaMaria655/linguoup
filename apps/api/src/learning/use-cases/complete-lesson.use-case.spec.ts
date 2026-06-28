import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompleteLessonUseCase } from './complete-lesson.use-case';
import { PrismaService } from '../../database/prisma.service';
import { LessonRepository } from '../repositories/lesson.repository';
import { ProgressRepository } from '../repositories/progress.repository';
import { LearningDomainService } from '../services/learning-domain.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';
import { AchievementUnlockService } from '../../gamification/services/achievement-unlock.service';
import { CreateSpacedReviewItemsUseCase } from './create-spaced-review-items.use-case';

const mockLesson = {
  id: 'lesson-1',
  tenant_id: 'tenant-1',
  title: 'Test Lesson',
  description: 'desc',
  level: 'A1',
  theme: 'greetings',
  durationMinutes: 10,
  content: {},
  createdAt: new Date(),
};

const mockProgress = {
  id: 'prog-1',
  userId: 'user-1',
  tenant_id: 'tenant-1',
  totalXP: 100,
  currentLevel: 1,
  currentStreakDays: 3,
  longestStreak: 5,
  lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
};

const mockNewAchievement = {
  id: 'ach-1',
  name: 'Primeira Lição',
  iconUrl: '/icons/achievements/first-lesson.svg',
};

describe('CompleteLessonUseCase', () => {
  let useCase: CompleteLessonUseCase;
  let mockPrisma: any;
  let mockLessonRepo: Partial<LessonRepository>;
  let mockProgressRepo: Partial<ProgressRepository>;
  let mockAchievementUnlockService: Partial<AchievementUnlockService>;

  beforeEach(async () => {
    mockLessonRepo = {
      findById: jest.fn().mockResolvedValue(mockLesson),
    };

    mockProgressRepo = {
      findProgressByUserId: jest.fn().mockResolvedValue(mockProgress),
      createLessonCompletion: jest.fn().mockResolvedValue({}),
      upsertProgress: jest.fn().mockResolvedValue({ ...mockProgress, totalXP: 150 }),
      findLessonsCompletedCount: jest.fn().mockResolvedValue(1),
    };

    const txMock = {
      userProgress: {
        update: jest.fn().mockResolvedValue({ ...mockProgress, currentStreakDays: 4, totalXP: 150 }),
      },
    };

    mockPrisma = {
      $transaction: jest.fn().mockImplementation((cb) => cb(txMock)),
    };

    mockAchievementUnlockService = {
      evaluate: jest.fn().mockResolvedValue([mockNewAchievement]),
    };

    const mockCreateSpacedReviewItemsUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteLessonUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: LessonRepository, useValue: mockLessonRepo },
        { provide: ProgressRepository, useValue: mockProgressRepo },
        LearningDomainService,
        { provide: StructuredLogger, useValue: { setService: jest.fn(), log: jest.fn(), error: jest.fn() } },
        { provide: AchievementUnlockService, useValue: mockAchievementUnlockService },
        { provide: CreateSpacedReviewItemsUseCase, useValue: mockCreateSpacedReviewItemsUseCase },
      ],
    }).compile();

    useCase = module.get<CompleteLessonUseCase>(CompleteLessonUseCase);
  });

  const baseCommand = {
    lessonId: 'lesson-1',
    userId: 'user-1',
    tenantId: 'tenant-1',
    traceId: 'trace-1',
    score: 80,
    timeSpentSeconds: 300,
  };

  describe('execute – success path', () => {
    it('should return xpEarned, newTotalXP, streakUpdated and streakDays', async () => {
      const result = await useCase.execute(baseCommand);

      expect(result.xpEarned).toBe(Math.round(50 * 80 / 100)); // 40
      expect(result.newTotalXP).toBe(150);
      expect(result.streakUpdated).toBe(true); // yesterday → consecutive
      expect(result.streakDays).toBe(4); // 3 + 1
    });

    it('should call createLessonCompletion inside transaction', async () => {
      await useCase.execute(baseCommand);
      expect(mockProgressRepo.createLessonCompletion).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ lessonId: 'lesson-1', score: 80 }),
      );
    });

    it('should return newAchievements from AchievementUnlockService', async () => {
      const result = await useCase.execute(baseCommand);

      expect(result.newAchievements).toHaveLength(1);
      expect(result.newAchievements[0]).toEqual(mockNewAchievement);
    });

    it('should return newAchievements as empty array when no achievements unlocked', async () => {
      (mockAchievementUnlockService.evaluate as jest.Mock).mockResolvedValue([]);

      const result = await useCase.execute(baseCommand);

      expect(result.newAchievements).toEqual([]);
    });

    it('should return newAchievements as empty array when AchievementUnlockService throws', async () => {
      (mockAchievementUnlockService.evaluate as jest.Mock).mockRejectedValue(new Error('Redis down'));

      const result = await useCase.execute(baseCommand);

      // Lesson completion should still succeed
      expect(result.xpEarned).toBeDefined();
      expect(result.newAchievements).toEqual([]);
    });
  });

  describe('execute – lesson not found', () => {
    it('should throw NotFoundException when lesson does not exist', async () => {
      (mockLessonRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(useCase.execute(baseCommand)).rejects.toThrow(NotFoundException);
    });
  });

  describe('execute – streak reset', () => {
    it('should reset streak to 1 when last activity was 2+ days ago', async () => {
      const oldProgress = {
        ...mockProgress,
        lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        currentStreakDays: 5,
      };
      (mockProgressRepo.findProgressByUserId as jest.Mock).mockResolvedValue(oldProgress);

      const result = await useCase.execute(baseCommand);
      expect(result.streakDays).toBe(1);
      expect(result.streakUpdated).toBe(true);
    });
  });

  describe('execute – transaction rollback', () => {
    it('should propagate error when transaction fails', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('DB connection lost'));

      await expect(useCase.execute(baseCommand)).rejects.toThrow('DB connection lost');
    });
  });
});


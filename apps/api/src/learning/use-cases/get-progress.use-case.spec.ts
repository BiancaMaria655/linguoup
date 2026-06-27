import { Test, TestingModule } from '@nestjs/testing';
import { GetProgressUseCase } from './get-progress.use-case';
import { ProgressRepository } from '../repositories/progress.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const mockLogger = { setService: jest.fn(), log: jest.fn(), error: jest.fn() };

const baseCommand = { userId: 'user-1', tenantId: 'tenant-1', traceId: 'trace-1' };

const mockProgress = {
  id: 'prog-1',
  userId: 'user-1',
  tenant_id: 'tenant-1',
  totalXP: 350,
  currentLevel: 2,
  currentStreakDays: 5,
  longestStreak: 12,
  lastActivityDate: new Date(),
};



const mockCompletions = [
  { lessonId: 'l1', completedAt: new Date(), durationMinutes: 12 },
  { lessonId: 'l2', completedAt: new Date(), durationMinutes: 10 },
];

const mockWeekly = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (6 - i));
  return { date: d.toISOString().slice(0, 10), lessonsCompleted: i === 6 ? 2 : 0, minutesStudied: i === 6 ? 22 : 0 };
});

describe('GetProgressUseCase', () => {
  let useCase: GetProgressUseCase;
  let mockRepo: Partial<ProgressRepository>;

  beforeEach(async () => {
    mockRepo = {
      findProgressWithCompletions: jest.fn().mockResolvedValue({
        progress: mockProgress,
        completions: mockCompletions,
      }),
      findWeeklyActivity: jest.fn().mockResolvedValue(mockWeekly),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProgressUseCase,
        { provide: ProgressRepository, useValue: mockRepo },
        { provide: StructuredLogger, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<GetProgressUseCase>(GetProgressUseCase);
  });

  describe('minutesStudied and vocabularyLearned calculation', () => {
    it('should compute minutesStudied as sum of lesson durations', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.minutesStudied).toBe(22); // 12 + 10
    });

    it('should compute vocabularyLearned as lessonsCompleted * 6', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.vocabularyLearned).toBe(12); // 2 * 6
    });

    it('should return lessonsCompleted equal to the number of completions', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.lessonsCompleted).toBe(2);
    });
  });

  describe('weeklyActivity', () => {
    it('should return exactly 7 entries', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.weeklyActivity).toHaveLength(7);
    });

    it('should pass through weeklyActivity from repository', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.weeklyActivity).toEqual(mockWeekly);
    });
  });

  describe('monthlyActivity', () => {
    it('should return exactly 4 ISO week entries', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.monthlyActivity).toHaveLength(4);
    });

    it('should have each entry with a valid YYYY-Www format', async () => {
      const result = await useCase.execute(baseCommand);
      for (const entry of result.monthlyActivity) {
        expect(entry.week).toMatch(/^\d{4}-W\d{2}$/);
      }
    });
  });

  describe('when UserProgress does not exist (new user)', () => {
    beforeEach(() => {
      (mockRepo.findProgressWithCompletions as jest.Mock).mockResolvedValue({
        progress: null,
        completions: [],
      });
      (mockRepo.findWeeklyActivity as jest.Mock).mockResolvedValue(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setUTCDate(d.getUTCDate() - (6 - i));
          return { date: d.toISOString().slice(0, 10), lessonsCompleted: 0, minutesStudied: 0 };
        }),
      );
    });

    it('should return totalXP as 0', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.totalXP).toBe(0);
    });

    it('should return currentLevel as 1', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.currentLevel).toBe(1);
    });

    it('should return lessonsCompleted as 0', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.lessonsCompleted).toBe(0);
    });

    it('should return weeklyActivity with 7 entries all having lessonsCompleted 0', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.weeklyActivity).toHaveLength(7);
      for (const entry of result.weeklyActivity) {
        expect(entry.lessonsCompleted).toBe(0);
      }
    });

    it('should return monthlyActivity with 4 entries all having lessonsCompleted 0', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.monthlyActivity).toHaveLength(4);
      for (const entry of result.monthlyActivity) {
        expect(entry.lessonsCompleted).toBe(0);
      }
    });
  });
});

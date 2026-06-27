import { Test, TestingModule } from '@nestjs/testing';
import { GetXpUseCase } from './get-xp.use-case';
import { PrismaService } from '../../database/prisma.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const makeCompletion = (lessonId: string, xpEarned: number, completedAt: Date) => ({
  xpEarned,
  lessonId,
  completedAt,
});

describe('GetXpUseCase', () => {
  let useCase: GetXpUseCase;
  let mockPrisma: any;

  const baseCommand = { userId: 'user-1', tenantId: 'tenant-1', traceId: 'trace-1' };

  beforeEach(async () => {
    mockPrisma = {
      userProgress: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      lessonCompletion: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetXpUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: StructuredLogger,
          useValue: { setService: jest.fn(), log: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetXpUseCase>(GetXpUseCase);
  });

  describe('new user with no completions', () => {
    it('should return total: 0 and history: []', async () => {
      const result = await useCase.execute(baseCommand);

      expect(result.total).toBe(0);
      expect(result.history).toEqual([]);
    });
  });

  describe('user with UserProgress and completions', () => {
    beforeEach(() => {
      mockPrisma.userProgress.findUnique.mockResolvedValue({
        id: 'prog-1',
        userId: 'user-1',
        totalXP: 350,
        currentLevel: 2,
        currentStreakDays: 5,
        longestStreak: 10,
        lastActivityDate: new Date(),
        tenant_id: 'tenant-1',
      });

      const now = Date.now();
      mockPrisma.lessonCompletion.findMany.mockResolvedValue([
        makeCompletion('lesson-3', 50, new Date(now - 1000)),     // most recent
        makeCompletion('lesson-2', 42, new Date(now - 2000)),
        makeCompletion('lesson-1', 30, new Date(now - 3000)),     // oldest
      ]);
    });

    it('should return correct total XP from UserProgress', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.total).toBe(350);
    });

    it('should return history with 3 entries', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.history).toHaveLength(3);
    });

    it('should return history ordered descending by earnedAt (most recent first)', async () => {
      const result = await useCase.execute(baseCommand);
      // Prisma orders by completedAt desc; our mock preserves that order
      expect(result.history[0].lessonId).toBe('lesson-3');
      expect(result.history[2].lessonId).toBe('lesson-1');
    });

    it('should map each entry with source="lesson"', async () => {
      const result = await useCase.execute(baseCommand);
      for (const entry of result.history) {
        expect(entry.source).toBe('lesson');
        expect(entry).toHaveProperty('xpEarned');
        expect(entry).toHaveProperty('lessonId');
        expect(entry).toHaveProperty('earnedAt');
      }
    });
  });
});

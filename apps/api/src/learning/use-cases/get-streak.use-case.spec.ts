import { Test, TestingModule } from '@nestjs/testing';
import { GetStreakUseCase } from './get-streak.use-case';
import { ProgressRepository } from '../repositories/progress.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const mockLogger = { setService: jest.fn(), log: jest.fn(), error: jest.fn() };

const baseCommand = { userId: 'user-1', tenantId: 'tenant-1', traceId: 'trace-1' };

const todayStr = new Date().toISOString().slice(0, 10);

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

function buildCalendar(activeDates: string[]): { date: string; active: boolean }[] {
  const calendar: { date: string; active: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    calendar.push({ date, active: activeDates.includes(date) });
  }
  return calendar;
}

describe('GetStreakUseCase', () => {
  let useCase: GetStreakUseCase;
  let mockRepo: Partial<ProgressRepository>;

  beforeEach(async () => {
    mockRepo = {
      findProgressByUserId: jest.fn().mockResolvedValue(mockProgress),
      findActivityCalendar: jest.fn().mockResolvedValue(buildCalendar([todayStr])),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStreakUseCase,
        { provide: ProgressRepository, useValue: mockRepo },
        { provide: StructuredLogger, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<GetStreakUseCase>(GetStreakUseCase);
  });

  describe('activityCalendar', () => {
    it('should return exactly 30 entries', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.activityCalendar).toHaveLength(30);
    });

    it('should mark today as active when there is a completion today', async () => {
      const result = await useCase.execute(baseCommand);
      const todayEntry = result.activityCalendar.find((e) => e.date === todayStr);
      expect(todayEntry).toBeDefined();
      expect(todayEntry!.active).toBe(true);
    });

    it('should mark days without completions as active: false', async () => {
      const result = await useCase.execute(baseCommand);
      const inactiveDays = result.activityCalendar.filter((e) => e.date !== todayStr);
      for (const entry of inactiveDays) {
        expect(entry.active).toBe(false);
      }
    });
  });

  describe('streak values', () => {
    it('should return currentStreak from UserProgress', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.currentStreak).toBe(5);
    });

    it('should return longestStreak from UserProgress', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.longestStreak).toBe(12);
    });

    it('should return lastActivityDate as YYYY-MM-DD string', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.lastActivityDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('when UserProgress does not exist (no activity)', () => {
    beforeEach(() => {
      (mockRepo.findProgressByUserId as jest.Mock).mockResolvedValue(null);
      (mockRepo.findActivityCalendar as jest.Mock).mockResolvedValue(buildCalendar([]));
    });

    it('should return currentStreak as 0', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.currentStreak).toBe(0);
    });

    it('should return longestStreak as 0', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.longestStreak).toBe(0);
    });

    it('should return lastActivityDate as null', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.lastActivityDate).toBeNull();
    });

    it('should return 30 entries all active: false', async () => {
      const result = await useCase.execute(baseCommand);
      expect(result.activityCalendar).toHaveLength(30);
      for (const entry of result.activityCalendar) {
        expect(entry.active).toBe(false);
      }
    });
  });
});

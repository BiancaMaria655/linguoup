import { Test, TestingModule } from '@nestjs/testing';
import { GetMyAchievementsUseCase } from './get-my-achievements.use-case';
import { GamificationRepository } from '../repositories/gamification.repository';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const MOCK_USER_ACHIEVEMENTS = [
  {
    id: 'ua-1',
    userId: 'user-1',
    achievementId: 'ach-1',
    tenant_id: 'tenant-1',
    unlockedAt: new Date('2025-01-10T10:00:00Z'),
    achievement: {
      id: 'ach-1',
      name: 'Primeira Lição',
      description: 'Complete sua primeira lição',
      iconUrl: '/icons/achievements/first-lesson.svg',
      xpReward: 50,
      criteria: { type: 'lessons_completed', threshold: 1 },
    },
  },
  {
    id: 'ua-2',
    userId: 'user-1',
    achievementId: 'ach-2',
    tenant_id: 'tenant-1',
    unlockedAt: new Date('2025-01-15T10:00:00Z'),
    achievement: {
      id: 'ach-2',
      name: '100 XP',
      description: 'Acumule 100 XP',
      iconUrl: '/icons/achievements/xp-100.svg',
      xpReward: 30,
      criteria: { type: 'total_xp', threshold: 100 },
    },
  },
];

describe('GetMyAchievementsUseCase', () => {
  let useCase: GetMyAchievementsUseCase;
  let mockRepo: Partial<GamificationRepository>;

  const baseCommand = { userId: 'user-1', tenantId: 'tenant-1', traceId: 'trace-1' };

  beforeEach(async () => {
    mockRepo = {
      findUserAchievements: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyAchievementsUseCase,
        { provide: GamificationRepository, useValue: mockRepo },
        {
          provide: StructuredLogger,
          useValue: { setService: jest.fn(), log: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetMyAchievementsUseCase>(GetMyAchievementsUseCase);
  });

  describe('user with no achievements', () => {
    it('should return empty array (not 404)', async () => {
      const result = await useCase.execute(baseCommand);

      expect(result).toEqual([]);
    });
  });

  describe('user with achievements', () => {
    beforeEach(() => {
      (mockRepo.findUserAchievements as jest.Mock).mockResolvedValue(MOCK_USER_ACHIEVEMENTS);
    });

    it('should return list with 2 achievements', async () => {
      const result = await useCase.execute(baseCommand);

      expect(result).toHaveLength(2);
    });

    it('should include achievement details and unlockedAt in each entry', async () => {
      const result = await useCase.execute(baseCommand);

      for (const entry of result) {
        expect(entry).toHaveProperty('achievement');
        expect(entry).toHaveProperty('unlockedAt');
        expect(entry.achievement).toHaveProperty('id');
        expect(entry.achievement).toHaveProperty('name');
      }
    });

    it('should pass correct userId and tenantId to repository', async () => {
      await useCase.execute(baseCommand);

      expect(mockRepo.findUserAchievements).toHaveBeenCalledWith('user-1', 'tenant-1');
    });
  });
});

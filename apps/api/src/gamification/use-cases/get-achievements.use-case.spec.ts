import { Test, TestingModule } from '@nestjs/testing';
import { GetAchievementsUseCase } from './get-achievements.use-case';
import { GamificationRepository } from '../repositories/gamification.repository';
import { RedisService } from '../../database/redis.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const MOCK_ACHIEVEMENTS = [
  { id: 'ach-1', name: 'Primeira Lição', description: 'desc', iconUrl: '/icon.svg', xpReward: 50, criteria: {} },
  { id: 'ach-2', name: '100 XP', description: 'desc', iconUrl: '/icon.svg', xpReward: 30, criteria: {} },
];

describe('GetAchievementsUseCase', () => {
  let useCase: GetAchievementsUseCase;
  let mockRepo: Partial<GamificationRepository>;
  let mockRedis: any;

  const baseCommand = { userId: 'user-1', tenantId: 'tenant-1', traceId: 'trace-1' };

  beforeEach(async () => {
    mockRepo = {
      findAllAchievements: jest.fn().mockResolvedValue(MOCK_ACHIEVEMENTS),
    };

    mockRedis = {
      get: jest.fn().mockResolvedValue(null), // cache miss by default
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAchievementsUseCase,
        { provide: GamificationRepository, useValue: mockRepo },
        { provide: RedisService, useValue: mockRedis },
        {
          provide: StructuredLogger,
          useValue: { setService: jest.fn(), log: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetAchievementsUseCase>(GetAchievementsUseCase);
  });

  describe('cache miss', () => {
    it('should query the DB and populate cache on first call', async () => {
      const result = await useCase.execute(baseCommand);

      expect(mockRepo.findAllAchievements).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'gamification:achievements:catalog',
        JSON.stringify(MOCK_ACHIEVEMENTS),
        3600,
      );
      expect(result).toEqual(MOCK_ACHIEVEMENTS);
    });
  });

  describe('cache hit', () => {
    it('should serve catalog from Redis on second call without hitting DB', async () => {
      // Simulate cache pre-populated
      mockRedis.get.mockResolvedValue(JSON.stringify(MOCK_ACHIEVEMENTS));

      const result = await useCase.execute(baseCommand);

      expect(mockRepo.findAllAchievements).not.toHaveBeenCalled();
      expect(mockRedis.set).not.toHaveBeenCalled();
      expect(result).toEqual(MOCK_ACHIEVEMENTS);
    });
  });
});

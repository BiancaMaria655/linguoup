import { Test, TestingModule } from '@nestjs/testing';
import { AchievementUnlockService } from './achievement-unlock.service';
import { PrismaService } from '../../database/prisma.service';
import { StructuredLogger } from '../../common/logger/structured-logger.service';

const makeAchievement = (
  id: string,
  name: string,
  type: 'lessons_completed' | 'streak_days' | 'total_xp',
  threshold: number,
  iconUrl = `/icons/${id}.svg`,
) => ({
  id,
  name,
  description: `desc-${name}`,
  iconUrl,
  xpReward: 50,
  criteria: { type, threshold },
});

const ALL_ACHIEVEMENTS = [
  makeAchievement('ach-1', 'Primeira Lição', 'lessons_completed', 1),
  makeAchievement('ach-2', 'Iniciante', 'lessons_completed', 1),
  makeAchievement('ach-3', '10 lições', 'lessons_completed', 10),
  makeAchievement('ach-4', '25 lições', 'lessons_completed', 25),
  makeAchievement('ach-5', 'Sequência de 3 dias', 'streak_days', 3),
  makeAchievement('ach-6', 'Sequência de 7 dias', 'streak_days', 7),
  makeAchievement('ach-7', '100 XP', 'total_xp', 100),
  makeAchievement('ach-8', 'Intermediário', 'total_xp', 100),
  makeAchievement('ach-9', '500 XP', 'total_xp', 500),
  makeAchievement('ach-10', 'Avançado', 'total_xp', 500),
];

describe('AchievementUnlockService', () => {
  let service: AchievementUnlockService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      achievement: {
        findMany: jest.fn().mockResolvedValue(ALL_ACHIEVEMENTS),
      },
      userAchievement: {
        findMany: jest.fn().mockResolvedValue([]),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementUnlockService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: StructuredLogger,
          useValue: { setService: jest.fn(), log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AchievementUnlockService>(AchievementUnlockService);
  });

  const baseInput = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    totalXP: 0,
    currentStreakDays: 0,
    lessonsCompleted: 0,
  };

  // ── 5.2 Criteria: lessons_completed ────────────────────────────

  describe('lessons_completed criterion', () => {
    it('should unlock threshold=1 achievements on first lesson', async () => {
      const result = await service.evaluate({ ...baseInput, lessonsCompleted: 1 });

      const names = result.map((a) => a.name);
      expect(names).toContain('Primeira Lição');
      expect(names).toContain('Iniciante');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should unlock lessons_completed=10 achievement at 10 lessons', async () => {
      const result = await service.evaluate({ ...baseInput, lessonsCompleted: 10 });

      const names = result.map((a) => a.name);
      expect(names).toContain('10 lições');
    });

    it('should unlock lessons_completed=25 achievement at 25 lessons', async () => {
      const result = await service.evaluate({ ...baseInput, lessonsCompleted: 25 });

      const names = result.map((a) => a.name);
      expect(names).toContain('25 lições');
    });

    it('should NOT unlock lessons_completed=10 when only 9 lessons done', async () => {
      const result = await service.evaluate({ ...baseInput, lessonsCompleted: 9 });

      const names = result.map((a) => a.name);
      expect(names).not.toContain('10 lições');
    });
  });

  // ── 5.3 Criteria: streak_days ──────────────────────────────────

  describe('streak_days criterion', () => {
    it('should unlock streak_days=3 at 3 streak days', async () => {
      const result = await service.evaluate({ ...baseInput, currentStreakDays: 3 });

      const names = result.map((a) => a.name);
      expect(names).toContain('Sequência de 3 dias');
    });

    it('should unlock streak_days=7 at 7 streak days', async () => {
      const result = await service.evaluate({ ...baseInput, currentStreakDays: 7 });

      const names = result.map((a) => a.name);
      expect(names).toContain('Sequência de 7 dias');
    });

    it('should NOT unlock streak_days=3 at only 2 days', async () => {
      const result = await service.evaluate({ ...baseInput, currentStreakDays: 2 });

      const names = result.map((a) => a.name);
      expect(names).not.toContain('Sequência de 3 dias');
    });
  });

  // ── 5.4 Criteria: total_xp ─────────────────────────────────────

  describe('total_xp criterion', () => {
    it('should unlock total_xp=100 achievements at 100 XP', async () => {
      const result = await service.evaluate({ ...baseInput, totalXP: 100 });

      const names = result.map((a) => a.name);
      expect(names).toContain('100 XP');
      expect(names).toContain('Intermediário');
    });

    it('should unlock total_xp=500 achievements at 500 XP', async () => {
      const result = await service.evaluate({ ...baseInput, totalXP: 500 });

      const names = result.map((a) => a.name);
      expect(names).toContain('500 XP');
      expect(names).toContain('Avançado');
    });

    it('should NOT unlock total_xp=100 at 99 XP', async () => {
      const result = await service.evaluate({ ...baseInput, totalXP: 99 });

      const names = result.map((a) => a.name);
      expect(names).not.toContain('100 XP');
    });
  });

  // ── 5.5 Idempotência ───────────────────────────────────────────

  describe('idempotency', () => {
    it('should not unlock achievements already unlocked', async () => {
      // Pre-set ach-1 (Primeira Lição) as already unlocked
      mockPrisma.userAchievement.findMany.mockResolvedValue([
        { achievementId: 'ach-1' },
        { achievementId: 'ach-2' },
      ]);

      const result = await service.evaluate({ ...baseInput, lessonsCompleted: 1 });

      const names = result.map((a) => a.name);
      expect(names).not.toContain('Primeira Lição');
      expect(names).not.toContain('Iniciante');
    });

    it('should return empty array when all eligible achievements already unlocked', async () => {
      // All achievements unlocked
      mockPrisma.userAchievement.findMany.mockResolvedValue(
        ALL_ACHIEVEMENTS.map((a) => ({ achievementId: a.id })),
      );

      const result = await service.evaluate({
        ...baseInput,
        lessonsCompleted: 100,
        currentStreakDays: 30,
        totalXP: 9999,
      });

      expect(result).toEqual([]);
    });
  });

  // ── 5.6 Multiple simultaneous unlocks ─────────────────────────

  describe('multiple simultaneous unlocks', () => {
    it('should unlock all applicable achievements when XP and lessons thresholds are hit simultaneously', async () => {
      const result = await service.evaluate({
        ...baseInput,
        totalXP: 100,
        lessonsCompleted: 10,
      });

      const names = result.map((a) => a.name);
      expect(names).toContain('100 XP');
      expect(names).toContain('Intermediário');
      expect(names).toContain('10 lições');
      expect(names).toContain('Primeira Lição');
      expect(result.length).toBeGreaterThanOrEqual(5);
    });

    it('should call createMany once for all eligible achievements', async () => {
      await service.evaluate({
        ...baseInput,
        totalXP: 100,
        lessonsCompleted: 10,
      });

      expect(mockPrisma.userAchievement.createMany).toHaveBeenCalledTimes(1);
    });
  });

  // ── Return shape ───────────────────────────────────────────────

  describe('return value', () => {
    it('should return array of { id, name, iconUrl }', async () => {
      const result = await service.evaluate({ ...baseInput, lessonsCompleted: 1 });

      expect(result.length).toBeGreaterThan(0);
      for (const a of result) {
        expect(a).toHaveProperty('id');
        expect(a).toHaveProperty('name');
        expect(a).toHaveProperty('iconUrl');
      }
    });

    it('should return empty array when no achievements eligible', async () => {
      const result = await service.evaluate(baseInput);
      expect(result).toEqual([]);
    });
  });
});

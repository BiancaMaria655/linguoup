import { LearningDomainService } from '../services/learning-domain.service';

describe('LearningDomainService', () => {
  let service: LearningDomainService;

  beforeEach(() => {
    service = new LearningDomainService();
  });

  // ──────────────── calculateXp ────────────────
  describe('calculateXp', () => {
    it('should return 0 XP for score=0', () => {
      expect(service.calculateXp(0, 50)).toBe(0);
    });

    it('should return full baseXp for score=100', () => {
      expect(service.calculateXp(100, 50)).toBe(50);
    });

    it('should return half baseXp for score=50', () => {
      expect(service.calculateXp(50, 100)).toBe(50);
    });

    it('should round correctly for fractional results', () => {
      // 50 * 33 / 100 = 16.5 → rounds to 17
      expect(service.calculateXp(33, 50)).toBe(17);
    });
  });

  // ──────────────── computeStreak ────────────────
  describe('computeStreak', () => {
    const today = new Date('2024-06-15T10:00:00Z');

    it('should start streak at 1 when no previous activity', () => {
      const result = service.computeStreak(null, 0, today);
      expect(result.newStreakDays).toBe(1);
      expect(result.streakUpdated).toBe(true);
    });

    it('should increment streak for consecutive day', () => {
      const yesterday = new Date('2024-06-14T10:00:00Z');
      const result = service.computeStreak(yesterday, 5, today);
      expect(result.newStreakDays).toBe(6);
      expect(result.streakUpdated).toBe(true);
    });

    it('should NOT update streak if already active today', () => {
      const sameDay = new Date('2024-06-15T08:00:00Z');
      const result = service.computeStreak(sameDay, 5, today);
      expect(result.newStreakDays).toBe(5);
      expect(result.streakUpdated).toBe(false);
    });

    it('should reset streak to 1 when 2 days have passed', () => {
      const twoDaysAgo = new Date('2024-06-13T10:00:00Z');
      const result = service.computeStreak(twoDaysAgo, 10, today);
      expect(result.newStreakDays).toBe(1);
      expect(result.streakUpdated).toBe(true);
    });

    it('should reset streak to 1 when many days have passed', () => {
      const longAgo = new Date('2024-01-01T10:00:00Z');
      const result = service.computeStreak(longAgo, 100, today);
      expect(result.newStreakDays).toBe(1);
      expect(result.streakUpdated).toBe(true);
    });
  });
});

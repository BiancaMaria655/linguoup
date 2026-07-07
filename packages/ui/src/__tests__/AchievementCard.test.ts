/**
 * AchievementCard tests
 * Tests: unlocked vs locked state
 */
import {
  resolveAchievementCardStyle,
  isAchievementUnlocked,
} from '../components/AchievementCard';
import { colors } from '../tokens/colors';

describe('AchievementCard', () => {
  describe('resolveAchievementCardStyle — unlocked', () => {
    it('should have full opacity when unlocked', () => {
      const style = resolveAchievementCardStyle(true);
      expect(style.container.opacity).toBe(1);
    });

    it('should use primary light icon container background when unlocked', () => {
      const style = resolveAchievementCardStyle(true);
      expect(style.iconContainer.backgroundColor).toBe(colors.primaryLight);
    });

    it('should use primary text color when unlocked', () => {
      const style = resolveAchievementCardStyle(true);
      expect(style.title.color).toBe(colors.textPrimary);
    });

    it('should use secondary text color for description when unlocked', () => {
      const style = resolveAchievementCardStyle(true);
      expect(style.description.color).toBe(colors.textSecondary);
    });
  });

  describe('resolveAchievementCardStyle — locked', () => {
    it('should have reduced opacity when locked', () => {
      const style = resolveAchievementCardStyle(false);
      expect(style.container.opacity).toBeLessThan(1);
    });

    it('should use disabled/gray icon container background when locked', () => {
      const style = resolveAchievementCardStyle(false);
      expect(style.iconContainer.backgroundColor).toBe(colors.disabled);
    });

    it('should use secondary text color for title when locked', () => {
      const style = resolveAchievementCardStyle(false);
      expect(style.title.color).toBe(colors.textSecondary);
    });

    it('should use disabled text color for description when locked', () => {
      const style = resolveAchievementCardStyle(false);
      expect(style.description.color).toBe(colors.textDisabled);
    });
  });

  describe('isAchievementUnlocked', () => {
    it('should return true when unlocked prop is true', () => {
      expect(isAchievementUnlocked({
        title: 'Test',
        description: 'Desc',
        icon: '⭐',
        unlocked: true,
      })).toBe(true);
    });

    it('should return false when unlocked prop is false', () => {
      expect(isAchievementUnlocked({
        title: 'Test',
        description: 'Desc',
        icon: '⭐',
        unlocked: false,
      })).toBe(false);
    });
  });
});

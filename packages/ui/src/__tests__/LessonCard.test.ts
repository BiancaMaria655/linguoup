/**
 * LessonCard tests
 */
import {
  resolveLessonCardStyle,
  getLevelColor,
  formatDuration,
  LEVEL_COLORS,
} from '../components/LessonCard';
import { colors } from '../tokens/colors';

describe('LessonCard', () => {
  describe('getLevelColor', () => {
    it('should return green for A1', () => {
      expect(getLevelColor('A1')).toBe(LEVEL_COLORS['A1']);
    });

    it('should return different colors for each level', () => {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
      const colorSet = new Set(levels.map(getLevelColor));
      expect(colorSet.size).toBe(6); // all unique
    });
  });

  describe('formatDuration', () => {
    it('should format 5 minutes as "5 min"', () => {
      expect(formatDuration(5)).toBe('5 min');
    });

    it('should format 60 minutes as "1h"', () => {
      expect(formatDuration(60)).toBe('1h');
    });

    it('should format 90 minutes as "1h 30min"', () => {
      expect(formatDuration(90)).toBe('1h 30min');
    });

    it('should format 120 minutes as "2h"', () => {
      expect(formatDuration(120)).toBe('2h');
    });
  });

  describe('resolveLessonCardStyle', () => {
    it('should use surface background', () => {
      const style = resolveLessonCardStyle('A1');
      expect(style.content.padding).toBe(16);
    });

    it('should use level color as left border', () => {
      const style = resolveLessonCardStyle('B1');
      expect(style.levelBorder.backgroundColor).toBe(LEVEL_COLORS['B1']);
    });

    it('should use level color for level label', () => {
      const style = resolveLessonCardStyle('C2');
      expect(style.levelLabel.color).toBe(LEVEL_COLORS['C2']);
    });

    it('should use textPrimary for theme', () => {
      const style = resolveLessonCardStyle('A2');
      expect(style.theme.color).toBe(colors.textPrimary);
    });

    it('should use textSecondary for duration', () => {
      const style = resolveLessonCardStyle('B2');
      expect(style.duration.color).toBe(colors.textSecondary);
    });

    it('should be uppercase for level label', () => {
      const style = resolveLessonCardStyle('A1');
      expect(style.levelLabel.textTransform).toBe('uppercase');
    });
  });
});

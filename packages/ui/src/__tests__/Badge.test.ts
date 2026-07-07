/**
 * Badge tests
 * Tests: xp, streak, level variants — value and label
 */
import { resolveBadgeContent, resolveBadgeStyle } from '../components/Badge';
import { colors } from '../tokens/colors';

describe('Badge', () => {
  describe('resolveBadgeContent — xp', () => {
    it('should display XP label with + prefix', () => {
      const content = resolveBadgeContent('xp', 250);
      expect(content.label).toBe('+250 XP');
    });

    it('should use lightning icon for XP', () => {
      const content = resolveBadgeContent('xp', 250);
      expect(content.icon).toBe('⚡');
    });

    it('should use amber/gold color for XP', () => {
      const content = resolveBadgeContent('xp', 250);
      expect(content.color).toBe(colors.xp);
    });
  });

  describe('resolveBadgeContent — streak', () => {
    it('should display singular "dia" for value 1', () => {
      const content = resolveBadgeContent('streak', 1);
      expect(content.label).toBe('1 dia');
    });

    it('should display plural "dias" for value > 1', () => {
      const content = resolveBadgeContent('streak', 7);
      expect(content.label).toBe('7 dias');
    });

    it('should use fire icon for streak', () => {
      const content = resolveBadgeContent('streak', 7);
      expect(content.icon).toBe('🔥');
    });

    it('should use orange color for streak', () => {
      const content = resolveBadgeContent('streak', 7);
      expect(content.color).toBe(colors.streak);
    });
  });

  describe('resolveBadgeContent — level', () => {
    it('should display level label with number', () => {
      const content = resolveBadgeContent('level', 5);
      expect(content.label).toBe('Nível 5');
    });

    it('should use star icon for level', () => {
      const content = resolveBadgeContent('level', 5);
      expect(content.icon).toBe('⭐');
    });

    it('should use primary (indigo) color for level', () => {
      const content = resolveBadgeContent('level', 5);
      expect(content.color).toBe(colors.level);
    });
  });

  describe('resolveBadgeStyle', () => {
    it('should return container, icon, and text styles', () => {
      const style = resolveBadgeStyle('xp');
      expect(style.container).toBeDefined();
      expect(style.icon).toBeDefined();
      expect(style.text).toBeDefined();
    });

    it('should apply correct color to text for each variant', () => {
      expect(resolveBadgeStyle('xp').text.color).toBe(colors.xp);
      expect(resolveBadgeStyle('streak').text.color).toBe(colors.streak);
      expect(resolveBadgeStyle('level').text.color).toBe(colors.level);
    });

    it('should be larger for lg size', () => {
      const sm = resolveBadgeStyle('xp', 'sm');
      const lg = resolveBadgeStyle('xp', 'lg');
      expect(lg.text.fontSize as number).toBeGreaterThan(sm.text.fontSize as number);
    });
  });
});

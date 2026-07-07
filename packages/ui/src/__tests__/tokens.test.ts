/**
 * Design Tokens tests
 * Tests: exported values for colors, spacing, typography
 */
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { shadows, rnShadows } from '../tokens/shadows';

describe('Design Tokens', () => {
  describe('colors', () => {
    it('should export primary color as #4648d4', () => {
      expect(colors.primary).toBe('#4648d4');
    });

    it('should export secondary color as #006c49', () => {
      expect(colors.secondary).toBe('#006c49');
    });

    it('should export background color as #fcf8ff', () => {
      expect(colors.background).toBe('#fcf8ff');
    });

    it('should export surface color as #ffffff', () => {
      expect(colors.surface).toBe('#ffffff');
    });

    it('should export error color as #ba1a1a', () => {
      expect(colors.error).toBe('#ba1a1a');
    });

    it('should export onPrimary as white (#ffffff)', () => {
      expect(colors.onPrimary).toBe('#ffffff');
    });

    it('should export gamification colors (xp, streak, level)', () => {
      expect(colors.xp).toBeDefined();
      expect(colors.streak).toBeDefined();
      expect(colors.level).toBeDefined();
    });
  });

  describe('spacing', () => {
    it('should export xs as 4 (0.5 * base 8)', () => {
      expect(spacing.xs).toBe(4);
    });

    it('should export sm as 12 (1.5 * base 8)', () => {
      expect(spacing.sm).toBe(12);
    });

    it('should export md as 16 (2 * base 8)', () => {
      expect(spacing.md).toBe(16);
    });

    it('should export lg as 24 (3 * base 8)', () => {
      expect(spacing.lg).toBe(24);
    });

    it('should export xl as 32 (4 * base 8)', () => {
      expect(spacing.xl).toBe(32);
    });

    it('should export touchTarget as 44 (WCAG 2.1 AA)', () => {
      expect(spacing.touchTarget).toBe(44);
    });

    it('should export base as 8', () => {
      expect(spacing.base).toBe(8);
    });
  });

  describe('typography', () => {
    it('should include Nunito Sans as font family', () => {
      expect(typography.fontFamily).toContain('Nunito Sans');
    });

    it('should export headline weight as 800', () => {
      expect(typography.headlineWeight).toBe(800);
    });

    it('should export body weight as 400', () => {
      expect(typography.bodyWeight).toBe(400);
    });

    it('should export label weight as 700', () => {
      expect(typography.labelWeight).toBe(700);
    });

    it('should export md font size as 16', () => {
      expect(typography.size.md).toBe(16);
    });

    it('should export semantic scale with expected roles', () => {
      expect(typography.scale.headlineLarge).toBeDefined();
      expect(typography.scale.bodyMedium).toBeDefined();
      expect(typography.scale.labelMedium).toBeDefined();
    });
  });

  describe('shadows', () => {
    it('should export sm shadow string', () => {
      expect(typeof shadows.sm).toBe('string');
      expect(shadows.sm).not.toBe('none');
    });

    it('should export none as "none"', () => {
      expect(shadows.none).toBe('none');
    });

    it('should export rnShadows.sm with shadowColor', () => {
      expect(rnShadows.sm.shadowColor).toBeDefined();
      expect(rnShadows.sm.elevation).toBeGreaterThan(0);
    });

    it('should export rnShadows.none with 0 elevation', () => {
      expect(rnShadows.none.elevation).toBe(0);
    });
  });
});

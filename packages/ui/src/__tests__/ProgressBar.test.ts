/**
 * ProgressBar tests
 * Tests: value 0, 60, 100 render correct fill
 */
import {
  resolveProgressBarStyle,
  clampProgress,
  getProgressBarA11yProps,
} from '../components/ProgressBar';
import { colors } from '../tokens/colors';

describe('ProgressBar', () => {
  describe('clampProgress', () => {
    it('should clamp 0 to 0', () => {
      expect(clampProgress(0)).toBe(0);
    });

    it('should clamp 60 to 60', () => {
      expect(clampProgress(60)).toBe(60);
    });

    it('should clamp 100 to 100', () => {
      expect(clampProgress(100)).toBe(100);
    });

    it('should clamp negative values to 0', () => {
      expect(clampProgress(-10)).toBe(0);
    });

    it('should clamp values > 100 to 100', () => {
      expect(clampProgress(150)).toBe(100);
    });
  });

  describe('resolveProgressBarStyle — value 0', () => {
    it('should have 0% fill width', () => {
      const style = resolveProgressBarStyle(0);
      expect(style.fill.width).toBe('0%');
    });

    it('should use secondary (mint green) as fill color', () => {
      const style = resolveProgressBarStyle(0);
      expect(style.fill.backgroundColor).toBe(colors.secondary);
    });
  });

  describe('resolveProgressBarStyle — value 60', () => {
    it('should have 60% fill width', () => {
      const style = resolveProgressBarStyle(60);
      expect(style.fill.width).toBe('60%');
    });
  });

  describe('resolveProgressBarStyle — value 100', () => {
    it('should have 100% fill width', () => {
      const style = resolveProgressBarStyle(100);
      expect(style.fill.width).toBe('100%');
    });

    it('should have full opacity at completion', () => {
      const style = resolveProgressBarStyle(100);
      expect(style.fill.opacity).toBe(1);
    });
  });

  describe('resolveProgressBarStyle — track', () => {
    it('should be pill-shaped (borderRadius = height/2)', () => {
      const style = resolveProgressBarStyle(50, 8);
      expect(style.track.borderRadius).toBe(4); // 8/2
    });

    it('should use secondary light for track background', () => {
      const style = resolveProgressBarStyle(50);
      expect(style.track.backgroundColor).toBe(colors.secondaryLight);
    });
  });

  describe('getProgressBarA11yProps', () => {
    it('should return correct aria valuenow', () => {
      const props = getProgressBarA11yProps(60);
      expect(props['aria-valuenow']).toBe(60);
    });

    it('should always set aria-valuemin to 0 and aria-valuemax to 100', () => {
      const props = getProgressBarA11yProps(50);
      expect(props['aria-valuemin']).toBe(0);
      expect(props['aria-valuemax']).toBe(100);
    });

    it('should have role=progressbar', () => {
      const props = getProgressBarA11yProps(50);
      expect(props['role']).toBe('progressbar');
    });
  });
});

/**
 * SkeletonLoader tests
 */
import {
  resolveSkeletonLayout,
  resolveSkeletonRectStyle,
  SKELETON_BASE_COLOR,
  SKELETON_HIGHLIGHT_COLOR,
} from '../components/SkeletonLoader';

describe('SkeletonLoader', () => {
  describe('constants', () => {
    it('should export a base skeleton color', () => {
      expect(typeof SKELETON_BASE_COLOR).toBe('string');
      expect(SKELETON_BASE_COLOR).toBeTruthy();
    });

    it('should export a highlight color', () => {
      expect(typeof SKELETON_HIGHLIGHT_COLOR).toBe('string');
      expect(SKELETON_HIGHLIGHT_COLOR).toBeTruthy();
    });

    it('should have highlight lighter than base', () => {
      // Both are hex grays; highlight (#f5f5f5) > base (#e0e0e0)
      expect(SKELETON_HIGHLIGHT_COLOR.localeCompare(SKELETON_BASE_COLOR)).toBeGreaterThan(0);
    });
  });

  describe('resolveSkeletonLayout — card variant', () => {
    it('should return a container and rects for card variant', () => {
      const layout = resolveSkeletonLayout('card');
      expect(layout.container).toBeDefined();
      expect(Array.isArray(layout.rects)).toBe(true);
      expect(layout.rects.length).toBeGreaterThan(0);
    });

    it('should include a large image placeholder rect', () => {
      const layout = resolveSkeletonLayout('card');
      const hasLargeRect = layout.rects.some((r) => r.height >= 100);
      expect(hasLargeRect).toBe(true);
    });

    it('should have card border radius in container', () => {
      const layout = resolveSkeletonLayout('card');
      expect(layout.container.borderRadius).toBe(8);
    });
  });

  describe('resolveSkeletonLayout — list variant', () => {
    it('should return a container and rects for list variant', () => {
      const layout = resolveSkeletonLayout('list');
      expect(layout.container).toBeDefined();
      expect(Array.isArray(layout.rects)).toBe(true);
      expect(layout.rects.length).toBeGreaterThan(0);
    });

    it('should include an avatar (circle) rect', () => {
      const layout = resolveSkeletonLayout('list');
      const hasCircle = layout.rects.some((r) => r.borderRadius >= 20 && r.width === 40);
      expect(hasCircle).toBe(true);
    });
  });

  describe('resolveSkeletonRectStyle', () => {
    it('should use base skeleton color as background', () => {
      const rect = { width: '100%', height: 16, borderRadius: 4 };
      const style = resolveSkeletonRectStyle(rect);
      expect(style.backgroundColor).toBe(SKELETON_BASE_COLOR);
    });

    it('should apply width, height, borderRadius from rect', () => {
      const rect = { width: 200, height: 20, borderRadius: 6 };
      const style = resolveSkeletonRectStyle(rect);
      expect(style.width).toBe(200);
      expect(style.height).toBe(20);
      expect(style.borderRadius).toBe(6);
    });

    it('should default marginBottom to 0 when not provided', () => {
      const rect = { width: '100%', height: 16, borderRadius: 4 };
      const style = resolveSkeletonRectStyle(rect);
      expect(style.marginBottom).toBe(0);
    });
  });
});

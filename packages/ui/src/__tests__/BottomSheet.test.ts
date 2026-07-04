/**
 * BottomSheet tests
 */
import {
  resolveBottomSheetStyle,
  BOTTOM_SHEET_ANIMATION,
} from '../components/BottomSheet';
import { colors } from '../tokens/colors';

describe('BottomSheet', () => {
  describe('resolveBottomSheetStyle — visible', () => {
    it('should have full opacity overlay when visible', () => {
      const style = resolveBottomSheetStyle(true);
      expect(style.overlay.opacity).toBe(1);
    });

    it('should be interactive when visible', () => {
      const style = resolveBottomSheetStyle(true);
      expect(style.overlay.pointerEvents).toBe('auto');
    });
  });

  describe('resolveBottomSheetStyle — hidden', () => {
    it('should have 0 opacity overlay when hidden', () => {
      const style = resolveBottomSheetStyle(false);
      expect(style.overlay.opacity).toBe(0);
    });

    it('should not be interactive when hidden', () => {
      const style = resolveBottomSheetStyle(false);
      expect(style.overlay.pointerEvents).toBe('none');
    });
  });

  describe('resolveBottomSheetStyle — sheet styles', () => {
    it('should use surface background', () => {
      const style = resolveBottomSheetStyle(true);
      expect(style.sheet.backgroundColor).toBe(colors.surface);
    });

    it('should have rounded top corners', () => {
      const style = resolveBottomSheetStyle(true);
      expect(style.sheet.borderTopLeftRadius).toBe(16);
      expect(style.sheet.borderTopRightRadius).toBe(16);
    });

    it('should have a handle element defined', () => {
      const style = resolveBottomSheetStyle(true);
      expect(style.handle.width).toBe(40);
      expect(style.handle.height).toBe(4);
      expect(style.handle.borderRadius).toBe(2);
    });
  });

  describe('BOTTOM_SHEET_ANIMATION', () => {
    it('should define open animation config', () => {
      expect(BOTTOM_SHEET_ANIMATION.open).toBeDefined();
      expect(BOTTOM_SHEET_ANIMATION.open.toValue).toBe(0);
      expect(BOTTOM_SHEET_ANIMATION.open.useNativeDriver).toBe(true);
    });

    it('should define close animation config', () => {
      expect(BOTTOM_SHEET_ANIMATION.close).toBeDefined();
      expect(BOTTOM_SHEET_ANIMATION.close.toValue).toBe(1);
    });
  });
});

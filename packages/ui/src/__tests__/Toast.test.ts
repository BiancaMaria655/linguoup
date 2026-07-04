/**
 * Toast tests
 * Tests: success/error variants, auto-dismiss timer
 */
import {
  resolveToastContent,
  resolveToastStyle,
  createToastTimer,
  TOAST_DEFAULT_DURATION,
} from '../components/Toast';
import { colors } from '../tokens/colors';

describe('Toast', () => {
  describe('TOAST_DEFAULT_DURATION', () => {
    it('should default to 3000ms', () => {
      expect(TOAST_DEFAULT_DURATION).toBe(3000);
    });
  });

  describe('resolveToastContent — success', () => {
    it('should use check icon for success', () => {
      const content = resolveToastContent('success');
      expect(content.icon).toBe('✓');
    });

    it('should use green background for success', () => {
      const content = resolveToastContent('success');
      expect(content.backgroundColor).toBe(colors.secondaryLight);
    });

    it('should use dark green text for success', () => {
      const content = resolveToastContent('success');
      expect(content.textColor).toBe(colors.secondaryDark);
    });
  });

  describe('resolveToastContent — error', () => {
    it('should use warning icon for error', () => {
      const content = resolveToastContent('error');
      expect(content.icon).toBe('⚠');
    });

    it('should use error container (coral/light red) background for error', () => {
      const content = resolveToastContent('error');
      expect(content.backgroundColor).toBe(colors.errorContainer);
    });

    it('should use error (red) text color for error', () => {
      const content = resolveToastContent('error');
      expect(content.textColor).toBe(colors.error);
    });
  });

  describe('resolveToastStyle', () => {
    it('should return container, iconText, and messageText styles', () => {
      const style = resolveToastStyle('success');
      expect(style.container).toBeDefined();
      expect(style.iconText).toBeDefined();
      expect(style.messageText).toBeDefined();
    });

    it('should apply success colors to container', () => {
      const style = resolveToastStyle('success');
      expect(style.container.backgroundColor).toBe(colors.secondaryLight);
    });

    it('should apply error colors to container', () => {
      const style = resolveToastStyle('error');
      expect(style.container.backgroundColor).toBe(colors.errorContainer);
    });
  });

  describe('createToastTimer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call onDismiss after default duration (3000ms)', () => {
      const onDismiss = jest.fn();
      createToastTimer(onDismiss);
      expect(onDismiss).not.toHaveBeenCalled();
      jest.advanceTimersByTime(3000);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss after custom duration', () => {
      const onDismiss = jest.fn();
      createToastTimer(onDismiss, 1500);
      jest.advanceTimersByTime(1500);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onDismiss before duration elapsed', () => {
      const onDismiss = jest.fn();
      createToastTimer(onDismiss, 3000);
      jest.advanceTimersByTime(2999);
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should cancel timer when cleanup function is called', () => {
      const onDismiss = jest.fn();
      const cancel = createToastTimer(onDismiss);
      cancel(); // cancel before timer fires
      jest.advanceTimersByTime(3000);
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });
});

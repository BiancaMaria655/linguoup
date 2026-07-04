/**
 * Input tests
 * Tests: label display, error message, focus style
 */
import {
  resolveInputStyle,
  createInputProps,
  isLabelFloating,
} from '../components/Input';
import { colors } from '../tokens/colors';

describe('Input', () => {
  describe('resolveInputStyle — default state', () => {
    it('should use outline color for border when not focused and no error', () => {
      const style = resolveInputStyle(false, false, false);
      expect(style.border.borderColor).toBe(colors.outline);
    });

    it('should use thin border in default state', () => {
      const style = resolveInputStyle(false, false, false);
      expect(style.border.borderWidth).toBe(1);
    });
  });

  describe('resolveInputStyle — focused state', () => {
    it('should change border color to primary (indigo) on focus', () => {
      const style = resolveInputStyle(true, false, false);
      expect(style.border.borderColor).toBe(colors.primary);
    });

    it('should thicken border on focus', () => {
      const style = resolveInputStyle(true, false, false);
      expect(style.border.borderWidth).toBe(2);
    });

    it('should change label color to primary on focus', () => {
      const style = resolveInputStyle(true, false, false);
      expect(style.label.color).toBe(colors.primary);
    });

    it('should shrink label font size on focus (float)', () => {
      const focusedStyle = resolveInputStyle(true, false, false);
      const blurredStyle = resolveInputStyle(false, false, false);
      expect(focusedStyle.label.fontSize).toBeLessThan(blurredStyle.label.fontSize as number);
    });
  });

  describe('resolveInputStyle — error state', () => {
    it('should display error border color (#ba1a1a)', () => {
      const style = resolveInputStyle(false, true, false);
      expect(style.border.borderColor).toBe(colors.error);
    });

    it('should display error label color', () => {
      const style = resolveInputStyle(false, true, false);
      expect(style.label.color).toBe(colors.error);
    });

    it('should thicken border on error', () => {
      const style = resolveInputStyle(false, true, false);
      expect(style.border.borderWidth).toBe(2);
    });

    it('should include error text style', () => {
      const style = resolveInputStyle(false, true, false);
      expect(style.errorText.color).toBe(colors.error);
    });
  });

  describe('isLabelFloating', () => {
    it('should float when focused', () => {
      expect(isLabelFloating(true, '')).toBe(true);
    });

    it('should float when has value', () => {
      expect(isLabelFloating(false, 'some value')).toBe(true);
    });

    it('should not float when not focused and empty', () => {
      expect(isLabelFloating(false, '')).toBe(false);
    });

    it('should not float when not focused and undefined value', () => {
      expect(isLabelFloating(false, undefined)).toBe(false);
    });
  });

  describe('createInputProps', () => {
    it('should attach style when no error', () => {
      const props = createInputProps({ label: 'Email', value: '' });
      expect(props.style).toBeDefined();
    });

    it('should detect error from error prop string', () => {
      const props = createInputProps({ label: 'Email', error: 'Campo obrigatório' });
      expect(props.style.border.borderColor).toBe(colors.error);
    });

    it('should not treat empty string as error', () => {
      const props = createInputProps({ label: 'Email', error: '' });
      expect(props.style.border.borderColor).not.toBe(colors.error);
    });
  });
});

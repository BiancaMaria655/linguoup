/**
 * Button tests
 * Tests: variants, onPress, disabled, touch target ≥ 44px
 */
import {
  resolveButtonStyle,
  createButtonProps,
  BUTTON_MIN_HEIGHT,
  BUTTON_MIN_WIDTH,
} from '../components/Button';
import { colors } from '../tokens/colors';

describe('Button', () => {
  describe('BUTTON_MIN constants', () => {
    it('should have min height of 44px (WCAG 2.1 AA)', () => {
      expect(BUTTON_MIN_HEIGHT).toBeGreaterThanOrEqual(44);
    });

    it('should have min width of 44px (WCAG 2.1 AA)', () => {
      expect(BUTTON_MIN_WIDTH).toBeGreaterThanOrEqual(44);
    });
  });

  describe('resolveButtonStyle — primary variant', () => {
    it('should return indigo background (#4648d4) for primary', () => {
      const style = resolveButtonStyle('primary', false);
      expect(style.container.backgroundColor).toBe(colors.primary);
    });

    it('should return white label color for primary', () => {
      const style = resolveButtonStyle('primary', false);
      expect(style.label.color).toBe(colors.onPrimary);
    });

    it('should enforce minHeight of 44px', () => {
      const style = resolveButtonStyle('primary', false);
      expect(style.container.minHeight).toBeGreaterThanOrEqual(44);
    });

    it('should enforce minWidth of 44px', () => {
      const style = resolveButtonStyle('primary', false);
      expect(style.container.minWidth).toBeGreaterThanOrEqual(44);
    });
  });

  describe('resolveButtonStyle — secondary variant', () => {
    it('should return transparent background for secondary', () => {
      const style = resolveButtonStyle('secondary', false);
      expect(style.container.backgroundColor).toBe('transparent');
    });

    it('should have a border for secondary', () => {
      const style = resolveButtonStyle('secondary', false);
      expect(style.container.borderWidth).toBe(2);
      expect(style.container.borderColor).toBe(colors.primary);
    });

    it('should use primary color for secondary label', () => {
      const style = resolveButtonStyle('secondary', false);
      expect(style.label.color).toBe(colors.primary);
    });
  });

  describe('resolveButtonStyle — disabled state', () => {
    it('should reduce opacity when disabled', () => {
      const style = resolveButtonStyle('primary', true);
      expect(style.container.opacity).toBeLessThan(1);
    });

    it('should use disabled background color when disabled (primary)', () => {
      const style = resolveButtonStyle('primary', true);
      expect(style.container.backgroundColor).toBe(colors.disabled);
    });
  });

  describe('createButtonProps', () => {
    it('should default variant to primary', () => {
      const props = createButtonProps({ label: 'Test' });
      expect(props.variant).toBe('primary');
    });

    it('should default disabled to false', () => {
      const props = createButtonProps({ label: 'Test' });
      expect(props.disabled).toBe(false);
    });

    it('should attach style to props', () => {
      const props = createButtonProps({ label: 'Test', variant: 'secondary' });
      expect(props.style).toBeDefined();
      expect(props.style.container).toBeDefined();
      expect(props.style.label).toBeDefined();
    });

    it('should preserve onPress handler', () => {
      const onPress = jest.fn();
      const props = createButtonProps({ label: 'Test', onPress });
      expect(props.onPress).toBe(onPress);
    });
  });
});

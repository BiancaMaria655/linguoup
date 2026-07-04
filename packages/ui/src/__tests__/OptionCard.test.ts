/**
 * OptionCard tests
 * Tests: selected vs not selected, onSelect callback
 */
import {
  resolveOptionCardStyle,
  handleOptionSelect,
  OPTION_CARD_CHECK_ICON,
} from '../components/OptionCard';
import { colors } from '../tokens/colors';

describe('OptionCard', () => {
  describe('resolveOptionCardStyle — not selected', () => {
    it('should use surface background when not selected', () => {
      const style = resolveOptionCardStyle(false);
      expect(style.container.backgroundColor).toBe(colors.surface);
    });

    it('should use thin outline border when not selected', () => {
      const style = resolveOptionCardStyle(false);
      expect(style.container.borderWidth).toBe(1);
      expect(style.container.borderColor).toBe(colors.outlineVariant);
    });

    it('should hide check icon when not selected', () => {
      const style = resolveOptionCardStyle(false);
      expect(style.checkIcon.opacity).toBe(0);
    });

    it('should use normal font weight for label when not selected', () => {
      const style = resolveOptionCardStyle(false);
      expect(style.label.color).toBe(colors.textPrimary);
    });
  });

  describe('resolveOptionCardStyle — selected', () => {
    it('should use primary light background when selected', () => {
      const style = resolveOptionCardStyle(true);
      expect(style.container.backgroundColor).toBe(colors.primaryLight);
    });

    it('should use thick indigo border when selected', () => {
      const style = resolveOptionCardStyle(true);
      expect(style.container.borderWidth).toBe(2);
      expect(style.container.borderColor).toBe(colors.primary);
    });

    it('should show check icon when selected', () => {
      const style = resolveOptionCardStyle(true);
      expect(style.checkIcon.opacity).toBe(1);
    });

    it('should use primary color for label when selected', () => {
      const style = resolveOptionCardStyle(true);
      expect(style.label.color).toBe(colors.primary);
    });
  });

  describe('handleOptionSelect', () => {
    it('should call onSelect when not selected', () => {
      const onSelect = jest.fn();
      handleOptionSelect(false, onSelect);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onSelect when already selected (idempotent)', () => {
      const onSelect = jest.fn();
      handleOptionSelect(true, onSelect);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('OPTION_CARD_CHECK_ICON', () => {
    it('should be defined', () => {
      expect(OPTION_CARD_CHECK_ICON).toBeDefined();
      expect(typeof OPTION_CARD_CHECK_ICON).toBe('string');
    });
  });
});

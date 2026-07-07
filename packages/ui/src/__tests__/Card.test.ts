/**
 * Card tests
 */
import { resolveCardStyle, createCardProps } from '../components/Card';
import { colors } from '../tokens/colors';

describe('Card', () => {
  describe('resolveCardStyle — defaults', () => {
    it('should use white surface background', () => {
      const style = resolveCardStyle();
      expect(style.container.backgroundColor).toBe(colors.surface);
    });

    it('should use 8px border radius by default', () => {
      const style = resolveCardStyle();
      expect(style.container.borderRadius).toBe(8);
    });

    it('should have padding of 16 by default', () => {
      const style = resolveCardStyle();
      expect(style.container.padding).toBe(16);
    });

    it('should include shadow when elevated (default)', () => {
      const elevated = resolveCardStyle(16, 8, true);
      const flat = resolveCardStyle(16, 8, false);
      expect(elevated.container.elevation).toBeGreaterThan(0);
      expect(flat.container.elevation).toBe(0);
    });
  });

  describe('resolveCardStyle — custom values', () => {
    it('should accept custom padding', () => {
      const style = resolveCardStyle(24);
      expect(style.container.padding).toBe(24);
    });

    it('should accept custom border radius', () => {
      const style = resolveCardStyle(16, 12);
      expect(style.container.borderRadius).toBe(12);
    });
  });

  describe('createCardProps', () => {
    it('should attach style to props', () => {
      const props = createCardProps({ children: null });
      expect(props.style).toBeDefined();
      expect(props.style.container).toBeDefined();
    });

    it('should use padding from props', () => {
      const props = createCardProps({ padding: 24 });
      expect(props.style.container.padding).toBe(24);
    });

    it('should use elevated=true by default', () => {
      const props = createCardProps({});
      const elevation = props.style.container.elevation as number;
      expect(elevation).toBeGreaterThan(0);
    });

    it('should apply flat shadow when elevated=false', () => {
      const props = createCardProps({ elevated: false });
      expect(props.style.container.elevation).toBe(0);
    });
  });
});

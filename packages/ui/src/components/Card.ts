/**
 * Card — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Container with soft shadow (shadows.sm), border-radius 8px,
 * and white surface background.
 */
import { colors } from '../tokens/colors';
import { rnShadows } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';


export interface CardProps {
  /** Card content */
  children?: unknown;
  /** Additional padding override */
  padding?: number;
  /** Border radius override (defaults to 8) */
  borderRadius?: number;
  /** Whether to show elevated shadow */
  elevated?: boolean;
  /** Accessible label */
  accessibilityLabel?: string;
}

export interface CardStyle {
  container: Record<string, unknown>;
}

/**
 * Resolves Card styles.
 */
export function resolveCardStyle(
  padding: number = 16, // spacing.cardPadding
  borderRadius = 8,
  elevated = true,
): CardStyle {
  return {
    container: {
      backgroundColor: colors.surface,
      borderRadius,
      padding,
      ...(elevated ? rnShadows.sm : rnShadows.none),
    },
  };
}

export function createCardProps(props: CardProps): CardProps & { style: CardStyle } {
  return {
    ...props,
    style: resolveCardStyle(
      props.padding ?? spacing.cardPadding,
      props.borderRadius ?? 8,
      props.elevated ?? true,
    ),
  };
}

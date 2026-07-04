/**
 * Button — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * A platform-agnostic button component specification.
 * Provides typed props, style resolvers, and constants.
 * Consume in React/React Native by mapping these to your renderer.
 */
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  /** Button label text */
  label: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Press handler — not called when disabled */
  onPress?: () => void;
  /** Accessible label (defaults to label) */
  accessibilityLabel?: string;
  /** Full-width layout */
  fullWidth?: boolean;
}

/** Minimum touch target per WCAG 2.1 AA */
export const BUTTON_MIN_HEIGHT = 44;
export const BUTTON_MIN_WIDTH = 44;

export interface ButtonStyle {
  container: Record<string, unknown>;
  label: Record<string, unknown>;
}

/**
 * Resolves the button styles based on variant and disabled state.
 * Returns plain style objects consumable by any renderer.
 */
export function resolveButtonStyle(
  variant: ButtonVariant = 'primary',
  disabled = false,
): ButtonStyle {
  const baseContainer: Record<string, unknown> = {
    minHeight: BUTTON_MIN_HEIGHT,
    minWidth: BUTTON_MIN_WIDTH,
    borderRadius: 8,
    paddingVertical: spacing.buttonPaddingV,
    paddingHorizontal: spacing.buttonPaddingH,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.4 : 1,
  };

  const baseLabel: Record<string, unknown> = {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.labelWeight,
  };

  if (variant === 'primary') {
    return {
      container: {
        ...baseContainer,
        backgroundColor: disabled ? colors.disabled : colors.primary,
      },
      label: {
        ...baseLabel,
        color: disabled ? colors.onDisabled : colors.onPrimary,
      },
    };
  }

  if (variant === 'secondary') {
    return {
      container: {
        ...baseContainer,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? colors.disabled : colors.primary,
      },
      label: {
        ...baseLabel,
        color: disabled ? colors.onDisabled : colors.primary,
      },
    };
  }

  // ghost
  return {
    container: {
      ...baseContainer,
      backgroundColor: 'transparent',
    },
    label: {
      ...baseLabel,
      color: disabled ? colors.onDisabled : colors.primary,
    },
  };
}

/**
 * Creates a Button props descriptor.
 * Useful for deriving test expectations and documentation.
 */
export function createButtonProps(props: ButtonProps): ButtonProps & { style: ButtonStyle } {
  return {
    ...props,
    variant: props.variant ?? 'primary',
    disabled: props.disabled ?? false,
    style: resolveButtonStyle(props.variant ?? 'primary', props.disabled ?? false),
  };
}

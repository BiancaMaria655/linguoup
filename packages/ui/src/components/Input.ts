/**
 * Input — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Platform-agnostic input component specification with floating label,
 * focus state (indigo border), and error state.
 */
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export interface InputProps {
  /** Field label text (floating) */
  label: string;
  /** Current field value */
  value?: string;
  /** Change handler */
  onChangeText?: (text: string) => void;
  /** Error message to display (triggers error state) */
  error?: string;
  /** Whether the field is focused */
  focused?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Placeholder text (shown when not focused and empty) */
  placeholder?: string;
  /** Secure text entry (password) */
  secureTextEntry?: boolean;
  /** Accessible label */
  accessibilityLabel?: string;
}

export interface InputStyle {
  container: Record<string, unknown>;
  label: Record<string, unknown>;
  input: Record<string, unknown>;
  border: Record<string, unknown>;
  errorText: Record<string, unknown>;
}

/**
 * Resolves Input styles based on focus and error state.
 */
export function resolveInputStyle(
  focused = false,
  hasError = false,
  disabled = false,
): InputStyle {
  const borderColor = hasError
    ? colors.error
    : focused
    ? colors.primary
    : colors.outline;

  return {
    container: {
      width: '100%',
      paddingTop: spacing.lg, // space for floating label
    },
    label: {
      position: 'absolute',
      left: spacing.inputPadding,
      fontFamily: typography.fontFamily,
      fontSize: focused ? typography.size.sm : typography.size.md,
      fontWeight: typography.bodyWeight,
      color: hasError ? colors.error : focused ? colors.primary : colors.textSecondary,
      // top: focused ? 0 : spacing.md  (animated in implementation)
      top: focused ? 0 : spacing.md,
      transition: 'all 0.2s',
    },
    input: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.md,
      fontWeight: typography.bodyWeight,
      color: disabled ? colors.textDisabled : colors.textPrimary,
      paddingHorizontal: spacing.inputPadding,
      paddingVertical: spacing.sm,
      minHeight: 44,
      opacity: disabled ? 0.6 : 1,
    },
    border: {
      borderWidth: focused || hasError ? 2 : 1,
      borderColor,
      borderRadius: 8,
    },
    errorText: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.sm,
      fontWeight: typography.bodyWeight,
      color: colors.error,
      marginTop: spacing.xs,
      marginLeft: spacing.inputPadding,
    },
  };
}

/**
 * Derives whether the label is in floating (top) position.
 */
export function isLabelFloating(focused: boolean, value: string | undefined): boolean {
  return focused || (value !== undefined && value.length > 0);
}

export function createInputProps(props: InputProps): InputProps & { style: InputStyle } {
  const hasError = typeof props.error === 'string' && props.error.length > 0;
  return {
    ...props,
    style: resolveInputStyle(props.focused ?? false, hasError, props.disabled ?? false),
  };
}

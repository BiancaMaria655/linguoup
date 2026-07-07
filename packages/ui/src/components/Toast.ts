/**
 * Toast — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Feedback toast with success (green) and error (coral) variants.
 * Auto-dismiss after 3 seconds.
 */
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export type ToastVariant = 'success' | 'error';

export interface ToastProps {
  /** Message to display */
  message: string;
  /** Visual variant */
  variant: ToastVariant;
  /** Auto-dismiss timeout in ms (defaults to 3000) */
  duration?: number;
  /** Dismiss callback */
  onDismiss?: () => void;
}

/** Default auto-dismiss duration in milliseconds */
export const TOAST_DEFAULT_DURATION = 3000;

export interface ToastContent {
  icon: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export interface ToastStyle {
  container: Record<string, unknown>;
  iconText: Record<string, unknown>;
  messageText: Record<string, unknown>;
}

/**
 * Resolves toast content based on variant.
 */
export function resolveToastContent(variant: ToastVariant): ToastContent {
  if (variant === 'success') {
    return {
      icon: '✓',
      backgroundColor: colors.secondaryLight,
      textColor: colors.secondaryDark,
      borderColor: colors.secondary,
    };
  }
  // error / coral
  return {
    icon: '⚠',
    backgroundColor: colors.errorContainer,
    textColor: colors.error,
    borderColor: colors.error,
  };
}

/**
 * Resolves Toast styles.
 */
export function resolveToastStyle(variant: ToastVariant): ToastStyle {
  const content = resolveToastContent(variant);

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: content.backgroundColor,
      borderLeftWidth: 4,
      borderLeftColor: content.borderColor,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      // Position typically absolute, managed by renderer
    },
    iconText: {
      fontSize: typography.size.lg,
      color: content.textColor,
    },
    messageText: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.base,
      fontWeight: typography.bodyWeight,
      color: content.textColor,
      flex: 1,
    },
  };
}

/**
 * Creates a timer that calls onDismiss after duration ms.
 * Returns a cleanup function to cancel the timer.
 */
export function createToastTimer(
  onDismiss: () => void,
  duration = TOAST_DEFAULT_DURATION,
): () => void {
  const timerId = setTimeout(onDismiss, duration);
  return () => clearTimeout(timerId);
}

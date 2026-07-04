/**
 * OptionCard — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Selection card used in onboarding flows.
 * Selected state: indigo border + light indigo background + check icon.
 */
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export interface OptionCardProps {
  /** Option label */
  label: string;
  /** Whether this option is currently selected */
  selected: boolean;
  /** Selection callback */
  onSelect: () => void;
  /** Optional icon/emoji */
  icon?: string;
  /** Accessible label (defaults to label) */
  accessibilityLabel?: string;
}

export interface OptionCardStyle {
  container: Record<string, unknown>;
  content: Record<string, unknown>;
  label: Record<string, unknown>;
  checkIcon: Record<string, unknown>;
}

/** Check icon shown when selected */
export const OPTION_CARD_CHECK_ICON = '✓';

/**
 * Resolves OptionCard styles based on selected state.
 */
export function resolveOptionCardStyle(selected: boolean): OptionCardStyle {
  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: selected ? colors.primaryLight : colors.surface,
      borderWidth: selected ? 2 : 1,
      borderColor: selected ? colors.primary : colors.outlineVariant,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 52,
      gap: spacing.sm,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    label: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.md,
      fontWeight: selected ? typography.labelWeight : typography.bodyWeight,
      color: selected ? colors.primary : colors.textPrimary,
      flex: 1,
    },
    checkIcon: {
      fontSize: typography.size.lg,
      color: colors.primary,
      fontWeight: typography.labelWeight,
      opacity: selected ? 1 : 0,
    },
  };
}

/**
 * Handles option selection — calls onSelect callback.
 * Does not call onSelect when already selected (idempotent).
 */
export function handleOptionSelect(
  selected: boolean,
  onSelect: () => void,
): void {
  if (!selected) {
    onSelect();
  }
}

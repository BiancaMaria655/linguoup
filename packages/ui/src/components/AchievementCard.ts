/**
 * AchievementCard — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Displays a user achievement in unlocked (colorful) or locked (gray/dim) state.
 */
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { rnShadows } from '../tokens/shadows';

export interface AchievementCardProps {
  /** Achievement title */
  title: string;
  /** Achievement description */
  description: string;
  /** Icon identifier (emoji or icon name) */
  icon: string;
  /** Whether the achievement is unlocked */
  unlocked: boolean;
}

export interface AchievementCardStyle {
  container: Record<string, unknown>;
  iconContainer: Record<string, unknown>;
  iconText: Record<string, unknown>;
  title: Record<string, unknown>;
  description: Record<string, unknown>;
}

/**
 * Resolves AchievementCard styles based on unlocked state.
 */
export function resolveAchievementCardStyle(unlocked: boolean): AchievementCardStyle {
  return {
    container: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.cardPadding,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      opacity: unlocked ? 1 : 0.5,
      ...rnShadows.sm,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: unlocked ? colors.primaryLight : colors.disabled,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 24,
      // Grayscale filter not natively available; opacity on parent handles it
    },
    title: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.base,
      fontWeight: typography.labelWeight,
      color: unlocked ? colors.textPrimary : colors.textSecondary,
    },
    description: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.sm,
      fontWeight: typography.bodyWeight,
      color: unlocked ? colors.textSecondary : colors.textDisabled,
      marginTop: spacing.xs,
    },
  };
}

export function isAchievementUnlocked(props: AchievementCardProps): boolean {
  return props.unlocked;
}

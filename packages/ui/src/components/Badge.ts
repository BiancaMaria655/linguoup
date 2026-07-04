/**
 * Badge — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Gamification badges for XP, streak, and level.
 */
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing } from '../tokens/spacing';

export type BadgeType = 'xp' | 'streak' | 'level';

export interface BadgeProps {
  /** Badge type determines icon and color */
  type: BadgeType;
  /** Numeric value to display */
  value: number;
  /** Optional size override */
  size?: 'sm' | 'md' | 'lg';
}

export interface BadgeStyle {
  container: Record<string, unknown>;
  icon: Record<string, unknown>;
  text: Record<string, unknown>;
}

export interface BadgeContent {
  icon: string;        // Unicode emoji or icon identifier
  label: string;       // Display label (e.g. "+250 XP", "7 dias")
  color: string;       // Accent color
  backgroundColor: string;
}

/**
 * Resolves badge content (icon, label, colors) by type and value.
 */
export function resolveBadgeContent(type: BadgeType, value: number): BadgeContent {
  switch (type) {
    case 'xp':
      return {
        icon: '⚡',
        label: `+${value} XP`,
        color: colors.xp,
        backgroundColor: colors.warningContainer,
      };
    case 'streak':
      return {
        icon: '🔥',
        label: `${value} ${value === 1 ? 'dia' : 'dias'}`,
        color: colors.streak,
        backgroundColor: '#fff3e0',
      };
    case 'level':
      return {
        icon: '⭐',
        label: `Nível ${value}`,
        color: colors.level,
        backgroundColor: colors.primaryLight,
      };
  }
}

const sizeMap = {
  sm: { fontSize: typography.size.xs, paddingH: spacing.xs, paddingV: 2, borderRadius: 4 },
  md: { fontSize: typography.size.sm, paddingH: spacing.sm, paddingV: spacing.xs, borderRadius: 6 },
  lg: { fontSize: typography.size.base, paddingH: spacing.md, paddingV: spacing.sm, borderRadius: 8 },
} as const;

/**
 * Resolves badge styles.
 */
export function resolveBadgeStyle(type: BadgeType, size: 'sm' | 'md' | 'lg' = 'md'): BadgeStyle {
  const content = resolveBadgeContent(type, 0); // value not needed for styles
  const dims = sizeMap[size];

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: content.backgroundColor,
      paddingHorizontal: dims.paddingH,
      paddingVertical: dims.paddingV,
      borderRadius: dims.borderRadius,
      gap: spacing.xs,
    },
    icon: {
      fontSize: dims.fontSize,
    },
    text: {
      fontFamily: typography.fontFamily,
      fontSize: dims.fontSize,
      fontWeight: typography.labelWeight,
      color: content.color,
    },
  };
}

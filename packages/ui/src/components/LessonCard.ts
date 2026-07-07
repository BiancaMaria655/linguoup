/**
 * LessonCard — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Card for a lesson with level-colored left border, theme, and duration.
 */
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { rnShadows } from '../tokens/shadows';

export type LessonLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LessonCardProps {
  /** CEFR level (determines border color) */
  level: LessonLevel;
  /** Lesson theme/title */
  theme: string;
  /** Duration in minutes */
  duration: number;
  /** Optional subtitle or description */
  description?: string;
  /** Press handler */
  onPress?: () => void;
}

export interface LessonCardStyle {
  container: Record<string, unknown>;
  levelBorder: Record<string, unknown>;
  content: Record<string, unknown>;
  levelLabel: Record<string, unknown>;
  theme: Record<string, unknown>;
  duration: Record<string, unknown>;
}

/** Level to color mapping */
export const LEVEL_COLORS: Record<LessonLevel, string> = {
  A1: '#4CAF50',  // Green — Beginner
  A2: '#8BC34A',  // Light Green — Elementary
  B1: '#2196F3',  // Blue — Intermediate
  B2: '#3F51B5',  // Indigo — Upper Intermediate
  C1: '#9C27B0',  // Purple — Advanced
  C2: '#F44336',  // Red — Proficient
};

/**
 * Returns the accent color for a given CEFR level.
 */
export function getLevelColor(level: LessonLevel): string {
  return LEVEL_COLORS[level];
}

/**
 * Resolves LessonCard styles.
 */
export function resolveLessonCardStyle(level: LessonLevel): LessonCardStyle {
  const levelColor = getLevelColor(level);

  return {
    container: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      flexDirection: 'row',
      overflow: 'hidden',
      ...rnShadows.sm,
    },
    levelBorder: {
      width: 4,
      backgroundColor: levelColor,
    },
    content: {
      flex: 1,
      padding: spacing.cardPadding,
    },
    levelLabel: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.xs,
      fontWeight: typography.labelWeight,
      color: levelColor,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
    },
    theme: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.md,
      fontWeight: typography.headlineWeight,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    duration: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.sm,
      fontWeight: typography.bodyWeight,
      color: colors.textSecondary,
    },
  };
}

/**
 * Formats duration in minutes as human-readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

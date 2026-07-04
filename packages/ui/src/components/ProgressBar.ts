/**
 * ProgressBar — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Pill-shaped progress bar with Verde Mint fill.
 * prop `value`: 0–100 (percentage).
 */
import { colors } from '../tokens/colors';

export interface ProgressBarProps {
  /** Progress value 0–100 */
  value: number;
  /** Bar height in pixels (defaults to 8) */
  height?: number;
  /** Accessible label */
  accessibilityLabel?: string;
}

export interface ProgressBarStyle {
  track: Record<string, unknown>;
  fill: Record<string, unknown>;
}

/**
 * Clamps value to [0, 100] range.
 */
export function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Resolves ProgressBar styles.
 */
export function resolveProgressBarStyle(value: number, height = 8): ProgressBarStyle {
  const clamped = clampProgress(value);
  const isComplete = clamped >= 100;

  return {
    track: {
      height,
      borderRadius: height / 2,
      backgroundColor: colors.secondaryLight,
      overflow: 'hidden',
      width: '100%',
    },
    fill: {
      height,
      borderRadius: height / 2,
      backgroundColor: isComplete ? colors.secondary : colors.secondary,
      width: `${clamped}%`,
      // On completion, a slightly more vibrant shade can be applied in impl
      opacity: isComplete ? 1 : 0.85,
    },
  };
}

/** Returns aria/accessibility role for the progress bar */
export function getProgressBarA11yProps(value: number): Record<string, unknown> {
  return {
    role: 'progressbar',
    'aria-valuenow': clampProgress(value),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  };
}

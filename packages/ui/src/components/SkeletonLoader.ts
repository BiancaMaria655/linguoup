/**
 * SkeletonLoader — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Loading state placeholder with shimmer animation.
 * Variants: 'card' and 'list'.
 */
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';

export type SkeletonVariant = 'card' | 'list';

export interface SkeletonLoaderProps {
  /** Layout variant */
  variant: SkeletonVariant;
  /** Number of items to repeat (for list variant) */
  count?: number;
}

export interface SkeletonRect {
  width: string | number;
  height: number;
  borderRadius: number;
  marginBottom?: number;
}

export interface SkeletonLayout {
  container: Record<string, unknown>;
  rects: SkeletonRect[];
}

/** Base shimmer color */
export const SKELETON_BASE_COLOR = '#e0e0e0';
export const SKELETON_HIGHLIGHT_COLOR = '#f5f5f5';

/**
 * Returns the shape layout for each skeleton variant.
 * Animated shimmer is handled by the platform's Animated API.
 */
export function resolveSkeletonLayout(variant: SkeletonVariant): SkeletonLayout {
  if (variant === 'card') {
    return {
      container: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: spacing.cardPadding,
      },
      rects: [
        // Image placeholder
        { width: '100%', height: 140, borderRadius: 8, marginBottom: spacing.md },
        // Title line
        { width: '70%', height: 16, borderRadius: 4, marginBottom: spacing.sm },
        // Subtitle line
        { width: '50%', height: 12, borderRadius: 4, marginBottom: 0 },
      ],
    };
  }

  // list variant
  return {
    container: {
      gap: spacing.sm,
    },
    rects: [
      // Row: avatar + text lines
      { width: 40, height: 40, borderRadius: 20, marginBottom: 0 },
      { width: '80%', height: 14, borderRadius: 4, marginBottom: spacing.xs },
      { width: '60%', height: 12, borderRadius: 4, marginBottom: 0 },
    ],
  };
}

/**
 * Returns base style for a skeleton rect (the animated rectangle).
 */
export function resolveSkeletonRectStyle(rect: SkeletonRect): Record<string, unknown> {
  return {
    width: rect.width,
    height: rect.height,
    borderRadius: rect.borderRadius,
    backgroundColor: SKELETON_BASE_COLOR,
    marginBottom: rect.marginBottom ?? 0,
    overflow: 'hidden',
  };
}

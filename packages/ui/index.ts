/**
 * @linguoup/ui — Design System
 * LinguoUp — Premium Playful Learning
 *
 * Main barrel export. Consumers import via:
 *   import { Button, colors } from '@linguoup/ui'
 */

// Design Tokens
export {
  colors,
} from './src/tokens/colors';
export type { Color, ColorValue } from './src/tokens/colors';

export {
  typography,
} from './src/tokens/typography';
export type { Typography } from './src/tokens/typography';

export {
  spacing,
} from './src/tokens/spacing';
export type { Spacing, SpacingKey } from './src/tokens/spacing';

export {
  shadows,
  rnShadows,
} from './src/tokens/shadows';
export type { Shadow, RNShadow } from './src/tokens/shadows';

// Components (style resolvers + types)
export {
  resolveButtonStyle,
  createButtonProps,
  BUTTON_MIN_HEIGHT,
  BUTTON_MIN_WIDTH,
} from './src/components/Button';
export type { ButtonProps, ButtonVariant, ButtonStyle } from './src/components/Button';

export {
  resolveInputStyle,
  createInputProps,
  isLabelFloating,
} from './src/components/Input';
export type { InputProps, InputStyle } from './src/components/Input';

export {
  resolveCardStyle,
  createCardProps,
} from './src/components/Card';
export type { CardProps, CardStyle } from './src/components/Card';

export {
  resolveProgressBarStyle,
  clampProgress,
  getProgressBarA11yProps,
} from './src/components/ProgressBar';
export type { ProgressBarProps, ProgressBarStyle } from './src/components/ProgressBar';

export {
  resolveBadgeContent,
  resolveBadgeStyle,
} from './src/components/Badge';
export type { BadgeProps, BadgeType, BadgeContent, BadgeStyle } from './src/components/Badge';

export {
  resolveSkeletonLayout,
  resolveSkeletonRectStyle,
  SKELETON_BASE_COLOR,
  SKELETON_HIGHLIGHT_COLOR,
} from './src/components/SkeletonLoader';
export type { SkeletonLoaderProps, SkeletonVariant, SkeletonLayout, SkeletonRect } from './src/components/SkeletonLoader';

export {
  resolveToastContent,
  resolveToastStyle,
  createToastTimer,
  TOAST_DEFAULT_DURATION,
} from './src/components/Toast';
export type { ToastProps, ToastVariant, ToastContent, ToastStyle } from './src/components/Toast';

export {
  resolveBottomSheetStyle,
  BOTTOM_SHEET_ANIMATION,
} from './src/components/BottomSheet';
export type { BottomSheetProps, BottomSheetStyle } from './src/components/BottomSheet';

export {
  resolveAchievementCardStyle,
  isAchievementUnlocked,
} from './src/components/AchievementCard';
export type { AchievementCardProps, AchievementCardStyle } from './src/components/AchievementCard';

export {
  resolveLessonCardStyle,
  getLevelColor,
  formatDuration,
  LEVEL_COLORS,
} from './src/components/LessonCard';
export type { LessonCardProps, LessonCardStyle, LessonLevel } from './src/components/LessonCard';

export {
  resolveOptionCardStyle,
  handleOptionSelect,
  OPTION_CARD_CHECK_ICON,
} from './src/components/OptionCard';
export type { OptionCardProps, OptionCardStyle } from './src/components/OptionCard';

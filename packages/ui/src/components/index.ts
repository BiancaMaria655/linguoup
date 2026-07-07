/**
 * Components — Barrel export
 * LinguoUp Design System
 */

// Atomic components
export {
  resolveButtonStyle,
  createButtonProps,
  BUTTON_MIN_HEIGHT,
  BUTTON_MIN_WIDTH,
} from './Button';
export type { ButtonProps, ButtonVariant, ButtonStyle } from './Button';

export {
  resolveInputStyle,
  createInputProps,
  isLabelFloating,
} from './Input';
export type { InputProps, InputStyle } from './Input';

export {
  resolveCardStyle,
  createCardProps,
} from './Card';
export type { CardProps, CardStyle } from './Card';

export {
  resolveProgressBarStyle,
  clampProgress,
  getProgressBarA11yProps,
} from './ProgressBar';
export type { ProgressBarProps, ProgressBarStyle } from './ProgressBar';

export {
  resolveBadgeContent,
  resolveBadgeStyle,
} from './Badge';
export type { BadgeProps, BadgeType, BadgeContent, BadgeStyle } from './Badge';

// Compound components
export {
  resolveSkeletonLayout,
  resolveSkeletonRectStyle,
  SKELETON_BASE_COLOR,
  SKELETON_HIGHLIGHT_COLOR,
} from './SkeletonLoader';
export type { SkeletonLoaderProps, SkeletonVariant, SkeletonLayout, SkeletonRect } from './SkeletonLoader';

export {
  resolveToastContent,
  resolveToastStyle,
  createToastTimer,
  TOAST_DEFAULT_DURATION,
} from './Toast';
export type { ToastProps, ToastVariant, ToastContent, ToastStyle } from './Toast';

export {
  resolveBottomSheetStyle,
  BOTTOM_SHEET_ANIMATION,
} from './BottomSheet';
export type { BottomSheetProps, BottomSheetStyle } from './BottomSheet';

export {
  resolveAchievementCardStyle,
  isAchievementUnlocked,
} from './AchievementCard';
export type { AchievementCardProps, AchievementCardStyle } from './AchievementCard';

export {
  resolveLessonCardStyle,
  getLevelColor,
  formatDuration,
  LEVEL_COLORS,
} from './LessonCard';
export type { LessonCardProps, LessonCardStyle, LessonLevel } from './LessonCard';

export {
  resolveOptionCardStyle,
  handleOptionSelect,
  OPTION_CARD_CHECK_ICON,
} from './OptionCard';
export type { OptionCardProps, OptionCardStyle } from './OptionCard';

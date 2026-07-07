/**
 * BottomSheet — Design System Component
 * LinguoUp — Premium Playful Learning
 *
 * Custom bottom sheet without external dependencies.
 * Uses Animated API in React Native (slide-up animation).
 * Props: visible, onClose, children.
 */
import { colors } from '../tokens/colors';
import { rnShadows } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';

export interface BottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Called when the sheet should be dismissed */
  onClose: () => void;
  /** Sheet content */
  children?: unknown;
  /** Snap point height (in px or %) — defaults to '50%' */
  height?: number | string;
}

export interface BottomSheetStyle {
  overlay: Record<string, unknown>;
  sheet: Record<string, unknown>;
  handle: Record<string, unknown>;
  content: Record<string, unknown>;
}

/**
 * Resolves BottomSheet styles.
 * The `transform` (translateY animation) is handled by the platform renderer.
 */
export function resolveBottomSheetStyle(visible: boolean): BottomSheetStyle {
  return {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      // display: none when !visible, handled by renderer
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: spacing.pagePadding,
      paddingBottom: spacing.xl,
      paddingTop: spacing.md,
      ...rnShadows.lg,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.outlineVariant,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    content: {
      flex: 1,
    },
  };
}

/**
 * Animation config for the slide-up transition.
 * Values to be passed to Animated.spring or Animated.timing in React Native.
 */
export const BOTTOM_SHEET_ANIMATION = {
  open: {
    toValue: 0,         // translateY = 0 (fully visible)
    useNativeDriver: true,
    tension: 65,
    friction: 11,
  },
  close: {
    toValue: 1,         // translateY = height (hidden below)
    useNativeDriver: true,
    duration: 250,
  },
} as const;

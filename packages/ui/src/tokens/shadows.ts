/**
 * Design tokens — Shadows
 * LinguoUp Design System
 * Platform-agnostic shadow definitions (CSS box-shadow format).
 * In React Native, these map to elevation + shadowColor/shadowOffset/etc.
 */
export const shadows = {
  none: 'none',

  // Soft shadow for cards (elevation 1)
  sm: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.08)',

  // Medium shadow for bottom sheets, modals (elevation 2)
  md: '0px 4px 6px rgba(0, 0, 0, 0.10), 0px 2px 4px rgba(0, 0, 0, 0.06)',

  // Large shadow for popups, overlays (elevation 3)
  lg: '0px 10px 15px rgba(0, 0, 0, 0.10), 0px 4px 6px rgba(0, 0, 0, 0.05)',
} as const;

/**
 * React Native shadow style helper.
 * Returns platform-specific shadow props for React Native components.
 */
export const rnShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 8,
  },
} as const;

export type Shadow = keyof typeof shadows;
export type RNShadow = typeof rnShadows[keyof typeof rnShadows];

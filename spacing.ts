/** Base unit: 8px */
export const spacing = {
  xs: 4,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  /** Component-specific shortcuts */
  touchTarget: 44, // a11y: minimum touch target
  cardPadding: 16,
  screenPadding: 20,
} as const;

export const radius = {
  sm: 6,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;

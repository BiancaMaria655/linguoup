/**
 * Design tokens — Spacing
 * LinguoUp Design System — base 8px grid
 */
export const spacing = {
  // Base unit
  base: 8,

  // Named scale
  none: 0,
  xs: 4,    // 0.5 × base
  sm: 12,   // 1.5 × base
  md: 16,   // 2 × base
  lg: 24,   // 3 × base
  xl: 32,   // 4 × base
  '2xl': 40, // 5 × base
  '3xl': 48, // 6 × base
  '4xl': 64, // 8 × base

  // Semantic aliases
  pagePadding: 16,
  sectionGap: 24,
  cardPadding: 16,
  inputPadding: 12,
  buttonPaddingV: 12,
  buttonPaddingH: 24,
  touchTarget: 44,  // WCAG 2.1 AA minimum
} as const;

export type Spacing = typeof spacing;
export type SpacingKey = keyof typeof spacing;

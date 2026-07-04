/**
 * Design tokens — Typography
 * LinguoUp Design System — Premium Playful Learning
 */
export const typography = {
  fontFamily: 'Nunito Sans, system-ui, sans-serif',
  fontFamilyMono: 'monospace',

  // Font weights
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Role-based weights
  headlineWeight: 800,
  bodyWeight: 400,
  labelWeight: 700,

  // Font sizes (px / sp)
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // Line heights (ratio)
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing (em)
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.01,
    wider: 0.05,
  },

  // Semantic scale (role → { size, weight, lineHeight })
  scale: {
    displayLarge: { fontSize: 40, fontWeight: 800, lineHeight: 1.2 },
    displaySmall: { fontSize: 32, fontWeight: 800, lineHeight: 1.2 },
    headlineLarge: { fontSize: 28, fontWeight: 800, lineHeight: 1.25 },
    headlineMedium: { fontSize: 24, fontWeight: 800, lineHeight: 1.3 },
    headlineSmall: { fontSize: 20, fontWeight: 700, lineHeight: 1.3 },
    titleLarge: { fontSize: 18, fontWeight: 700, lineHeight: 1.375 },
    titleMedium: { fontSize: 16, fontWeight: 600, lineHeight: 1.5 },
    titleSmall: { fontSize: 14, fontWeight: 600, lineHeight: 1.5 },
    bodyLarge: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
    bodyMedium: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
    bodySmall: { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
    labelLarge: { fontSize: 14, fontWeight: 700, lineHeight: 1.375 },
    labelMedium: { fontSize: 12, fontWeight: 700, lineHeight: 1.375 },
    labelSmall: { fontSize: 11, fontWeight: 700, lineHeight: 1.375 },
  },
} as const;

export type Typography = typeof typography;

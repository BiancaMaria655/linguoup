export const typography = {
  fonts: {
    sans: 'Nunito Sans',
    fallback: 'System',
  },
  weights: {
    regular: '400',
    bold: '700',
    headline: '800',
  },
  sizes: {
    caption: 11,
    label: 12,
    body: 14,
    bodyLg: 16,
    subtitle: 18,
    title: 20,
    headline: 24,
    display: 28,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export type Typography = typeof typography;

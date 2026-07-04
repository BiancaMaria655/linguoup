/**
 * Design tokens — Colors
 * LinguoUp Design System — Premium Playful Learning
 */
export const colors = {
  // Brand
  primary: '#4648d4',        // Electric Indigo
  primaryLight: '#e8e8ff',   // Indigo 50
  primaryDark: '#2f31a8',    // Indigo 800

  secondary: '#006c49',      // Verde Mint
  secondaryLight: '#ccf0e0', // Mint 50
  secondaryDark: '#004d34',  // Mint 800

  // Semantic
  background: '#fcf8ff',     // Off-white lavender
  surface: '#ffffff',        // Pure white
  surfaceVariant: '#f4f0fb', // Lavender tinted

  error: '#ba1a1a',          // Error red
  errorContainer: '#ffdad6', // Error red light
  onError: '#ffffff',

  success: '#006c49',        // Verde mint (same as secondary)
  successContainer: '#ccf0e0',

  warning: '#f59e0b',        // Amber
  warningContainer: '#fef3c7',

  // Neutral
  onBackground: '#1c1b1f',   // Near black text
  onSurface: '#1c1b1f',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',

  // Text hierarchy
  textPrimary: '#1c1b1f',
  textSecondary: '#49454f',
  textDisabled: '#9e9e9e',
  textHint: '#79747e',

  // Border
  outline: '#79747e',
  outlineVariant: '#cac4d0',

  // Gamification
  xp: '#f59e0b',             // Gold / XP
  streak: '#f97316',         // Orange / Streak
  level: '#4648d4',          // Indigo / Level

  // Disabled
  disabled: '#e0e0e0',
  onDisabled: '#9e9e9e',
} as const;

export type Color = keyof typeof colors;
export type ColorValue = (typeof colors)[Color];

export const colors = {
  primary: {
    DEFAULT: '#4648d4',
    dark: '#3335a8',
    light: '#eeeeff',
    tint: '#f5f5ff',
  },
  secondary: {
    DEFAULT: '#006c49',
    dark: '#004d34',
    light: '#e0f4ec',
  },
  background: '#fcf8ff',
  surface: '#ffffff',
  error: {
    DEFAULT: '#ba1a1a',
    light: '#fce8e8',
  },
  warning: {
    DEFAULT: '#bf5500',
    light: '#fff3e0',
  },
  text: {
    primary: '#1a1a2e',
    secondary: '#3d3d5c',
    muted: '#6b6b8a',
    disabled: '#9e9eb8',
  },
  border: {
    DEFAULT: '#e0ddef',
    strong: '#c4c0e0',
  },
} as const;

export type Colors = typeof colors;

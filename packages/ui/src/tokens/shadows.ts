import type { ShadowStyleIOS } from 'react-native';

type Shadow = ShadowStyleIOS & { elevation?: number };

export const shadows: Record<string, Shadow> = {
  sm: {
    shadowColor: '#4648d4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#4648d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4648d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#4648d4',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

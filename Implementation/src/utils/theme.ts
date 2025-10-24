/**
 * Design System / Theme
 */

export const colors = {
  background: '#ffffff',
  foreground: '#1a1a1a',
  card: '#ffffff',
  cardForeground: '#1a1a1a',
  primary: '#030213',
  primaryForeground: '#ffffff',
  secondary: '#f3f3f7',
  secondaryForeground: '#030213',
  muted: '#ececf0',
  mutedForeground: '#717182',
  accent: '#e9ebef',
  accentForeground: '#030213',
  destructive: '#d4183d',
  destructiveForeground: '#ffffff',
  border: '#e5e5e5',
  input: 'transparent',
  inputBackground: '#f3f3f5',
  switchBackground: '#cbced4',
  ring: '#a3a3a3',
  
  // Status colors
  green: '#16a34a',
  yellow: '#ca8a04',
  red: '#dc2626',
  orange: '#ea580c',
  
  // Opacity variants
  mutedBg: 'rgba(236, 236, 240, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400' as '400',
  medium: '500' as '500',
  semibold: '600' as '600',
  bold: '700' as '700',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

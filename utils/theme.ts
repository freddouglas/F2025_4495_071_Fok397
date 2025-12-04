/**
 * Design System / Theme
 * Supports both light and dark modes
 */

export const lightColors = {
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
  
  // Aliases for compatibility
  surface: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#717182',
  error: '#dc2626',
};

export const darkColors = {
  background: '#222831',
  foreground: '#e5e5e5',
  card: '#262626',
  cardForeground: '#e5e5e5',
  primary: '#f5f5f5',
  primaryForeground: '#1a1a1a',
  secondary: '#333333',
  secondaryForeground: '#e5e5e5',
  muted: '#2a2a2a',
  mutedForeground: '#a3a3a3',
  accent: '#363636',
  accentForeground: '#e5e5e5',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#3a3a3a',
  input: 'transparent',
  inputBackground: '#262626',
  switchBackground: '#4a4a4a',
  ring: '#525252',
  
  // Status colors
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  orange: '#f97316',
  
  // Opacity variants
  mutedBg: 'rgba(42, 42, 42, 0.5)',
  
  // Aliases for compatibility
  surface: '#262626',
  text: '#e5e5e5',
  textSecondary: '#a3a3a3',
  error: '#ef4444',
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
  lg: 12,
  xl: 16,
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

// Default to light colors for backwards compatibility
export const colors = lightColors;
// All colors and spacing used throughout the app
// Single source of truth — change here, changes everywhere

export const colors = {
  // Backgrounds
  bg: '#0f1e1a',
  bgCard: '#1a2e28',
  bgCardLight: '#1f3530',
  bgInput: '#162420',

  // Brand
  sage: '#4a7c6f',
  sageLight: '#7aab9c',
  amber: '#d4872a',
  amberLight: '#f5c87a',
  blush: '#c4736a',

  // Text
  textPrimary: '#e8f0ec',
  textSecondary: '#8a9aa8',
  textMuted: '#6c8291',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.12)',

  // Status
  success: '#4a7c6f',
  warning: '#d4872a',
  error: '#c4736a',

  // White
  white: '#ffffff',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
}

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  xxxl: 32,
}

export const fontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
}
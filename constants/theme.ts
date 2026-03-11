// Lactus Design System - Theme Tokens
export const Colors = {
  // Backgrounds
  bg: '#0D0D0D',
  bgSecondary: '#161616',
  surface: '#1E1E1E',
  surfaceAlt: '#252525',
  surfaceBorder: '#2E2E2E',

  // Brand
  brand: '#7C3AED',
  brandLight: '#A78BFA',
  brandDim: '#4C1D95',
  brandSurface: '#1A0A3D',

  // Text
  text: '#F0F0F0',
  textSecondary: '#A0A0A0',
  textMuted: '#606060',

  // Status
  success: '#10B981',
  successDim: '#064E3B',
  warning: '#F59E0B',
  warningDim: '#451A03',
  danger: '#EF4444',
  dangerDim: '#450A0A',
  info: '#3B82F6',
  infoDim: '#1E3A5F',

  // Priority
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',

  // Task Status
  statusPending: '#6B7280',
  statusProgress: '#3B82F6',
  statusDone: '#10B981',

  // Misc
  border: '#2A2A2A',
  divider: '#1F1F1F',
  overlay: 'rgba(0,0,0,0.7)',
  white: '#FFFFFF',
  transparent: 'transparent',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  brand: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

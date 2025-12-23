/**
 * Color Palette
 * Based on Islamic design principles with green and gold accents
 */

// Light theme colors
export const lightColors = {
  // Backgrounds
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',

  // Primary - Islamic Green
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  primaryDark: '#0D3310',

  // Secondary - Gold
  secondary: '#B8860B',
  secondaryLight: '#DAA520',
  secondaryDark: '#8B6914',

  // Accent
  accent: '#388E3C',
  accentLight: '#66BB6A',

  // Text
  textPrimary: '#212121',
  textSecondary: '#616161',
  textTertiary: '#9E9E9E',
  textArabic: '#000000',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderDark: '#BDBDBD',

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Special
  highlight: 'rgba(27, 94, 32, 0.1)',
  ayahHighlight: 'rgba(27, 94, 32, 0.15)',
  ripple: 'rgba(27, 94, 32, 0.2)',

  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarInactive: '#9E9E9E',
  tabBarActive: '#1B5E20',
};

// Dark theme colors
export const darkColors = {
  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2A2A2A',

  // Primary - Islamic Green (lighter for dark mode)
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',

  // Secondary - Gold (lighter for dark mode)
  secondary: '#FFD700',
  secondaryLight: '#FFEB3B',
  secondaryDark: '#FFC107',

  // Accent
  accent: '#66BB6A',
  accentLight: '#A5D6A7',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#757575',
  textArabic: '#FFFFFF',
  textInverse: '#000000',

  // Borders
  border: '#333333',
  borderLight: '#424242',
  borderDark: '#212121',

  // Status
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  info: '#42A5F5',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // Special
  highlight: 'rgba(76, 175, 80, 0.2)',
  ayahHighlight: 'rgba(76, 175, 80, 0.25)',
  ripple: 'rgba(76, 175, 80, 0.3)',

  // Tab bar
  tabBarBackground: '#1E1E1E',
  tabBarInactive: '#757575',
  tabBarActive: '#4CAF50',
};

// Color type
export type ThemeColors = typeof lightColors;

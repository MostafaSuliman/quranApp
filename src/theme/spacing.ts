/**
 * Spacing System
 * Consistent spacing values for the app
 */

// Base spacing unit (4px)
const UNIT = 4;

// Spacing scale
export const spacing = {
  none: 0,
  xs: UNIT, // 4
  sm: UNIT * 2, // 8
  md: UNIT * 3, // 12
  base: UNIT * 4, // 16
  lg: UNIT * 5, // 20
  xl: UNIT * 6, // 24
  '2xl': UNIT * 8, // 32
  '3xl': UNIT * 10, // 40
  '4xl': UNIT * 12, // 48
  '5xl': UNIT * 16, // 64
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Common layout values
export const layout = {
  // Screen padding
  screenPadding: spacing.base,
  screenPaddingHorizontal: spacing.base,
  screenPaddingVertical: spacing.lg,

  // Card
  cardPadding: spacing.base,
  cardBorderRadius: borderRadius.lg,

  // Button
  buttonPaddingHorizontal: spacing.lg,
  buttonPaddingVertical: spacing.md,
  buttonBorderRadius: borderRadius.md,

  // Input
  inputPaddingHorizontal: spacing.base,
  inputPaddingVertical: spacing.md,
  inputBorderRadius: borderRadius.md,

  // Tab bar
  tabBarHeight: 60,
  tabBarPadding: spacing.sm,

  // Header
  headerHeight: 56,
  headerPadding: spacing.base,

  // Bottom sheet
  bottomSheetBorderRadius: borderRadius['2xl'],
  bottomSheetPadding: spacing.lg,

  // Touch target minimum size
  touchTargetMin: 44,
};

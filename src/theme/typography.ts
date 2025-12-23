/**
 * Typography System
 * Font sizes and styles for the app
 */

import { Platform, TextStyle } from 'react-native';

// Font families
export const fonts = {
  arabic: {
    // Amiri is a classical Arabic font, good for Quran display
    regular: Platform.select({
      ios: 'Amiri',
      android: 'Amiri',
      default: 'Amiri',
    }) || 'System',
    // System Arabic for UI text
    system: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }) || 'System',
  },
  latin: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }) || 'System',
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }) || 'System',
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }) || 'System',
  },
};

// Base font sizes
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 36,
  '5xl': 48,
};

// Line heights
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2.0,
  arabic: 2.2, // Extra space for Arabic diacritics
};

// Quran text font sizes
export const quranFontSizes = {
  small: 20,
  medium: 24,
  large: 28,
  xlarge: 32,
};

// Typography presets
export const typography = {
  // Quran text styles
  quranText: {
    fontFamily: fonts.arabic.regular,
    fontSize: quranFontSizes.medium,
    lineHeight: quranFontSizes.medium * lineHeights.arabic,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  } as TextStyle,

  quranTextSmall: {
    fontFamily: fonts.arabic.regular,
    fontSize: quranFontSizes.small,
    lineHeight: quranFontSizes.small * lineHeights.arabic,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  } as TextStyle,

  quranTextLarge: {
    fontFamily: fonts.arabic.regular,
    fontSize: quranFontSizes.large,
    lineHeight: quranFontSizes.large * lineHeights.arabic,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  } as TextStyle,

  // Arabic UI text
  arabicUI: {
    fontFamily: fonts.arabic.system,
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * lineHeights.normal,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  } as TextStyle,

  arabicUILarge: {
    fontFamily: fonts.arabic.system,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.normal,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  } as TextStyle,

  // Surah name
  surahName: {
    fontFamily: fonts.arabic.regular,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.relaxed,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  } as TextStyle,

  // Latin/English text
  heading1: {
    fontFamily: fonts.latin.bold,
    fontSize: fontSizes['3xl'],
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    fontWeight: '700' as const,
  } as TextStyle,

  heading2: {
    fontFamily: fonts.latin.bold,
    fontSize: fontSizes['2xl'],
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    fontWeight: '600' as const,
  } as TextStyle,

  heading3: {
    fontFamily: fonts.latin.medium,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.tight,
    fontWeight: '600' as const,
  } as TextStyle,

  body: {
    fontFamily: fonts.latin.regular,
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * lineHeights.normal,
    fontWeight: '400' as const,
  } as TextStyle,

  bodySmall: {
    fontFamily: fonts.latin.regular,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: '400' as const,
  } as TextStyle,

  caption: {
    fontFamily: fonts.latin.regular,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontWeight: '400' as const,
  } as TextStyle,

  button: {
    fontFamily: fonts.latin.medium,
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * lineHeights.tight,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fonts.latin.medium,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.tight,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  } as TextStyle,
};

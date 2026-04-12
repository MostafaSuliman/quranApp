export const typography = {
  arabicXL: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 32,
    lineHeight: 58,
  },
  arabicLG: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 26,
    lineHeight: 48,
  },
  arabicMD: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 20,
    lineHeight: 36,
  },
  arabicBold: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 22,
    lineHeight: 40,
  },
  displaySans: {
    fontFamily: 'System',
    fontSize: 26,
    fontWeight: '700' as const,
  },
  titleSans: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  bodySans: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '400' as const,
  },
  captionSans: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
  },
} as const;

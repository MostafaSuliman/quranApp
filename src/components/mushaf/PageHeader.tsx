import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { toArabicDigits } from '@/utils/arabicNumerals';

interface PageHeaderProps {
  pageNumber: number;
  surahArabic: string;
  surahLatin: string;
}

export function PageHeader({ pageNumber, surahArabic, surahLatin }: PageHeaderProps) {
  const palette = useThemePalette();
  return (
    <View style={[styles.wrap, { borderBottomColor: palette.borderGold + '66' }]}>
      <View style={{ flex: 1 }}>
        <Text style={[typography.arabicBold, { color: palette.borderGreen, textAlign: 'left' }]}>
          {surahArabic}
        </Text>
        <Text
          style={[
            typography.captionSans,
            { color: palette.textMuted, letterSpacing: 1.4, textTransform: 'uppercase' },
          ]}
        >
          {surahLatin}
        </Text>
      </View>
      <View
        style={[
          styles.pageBadge,
          { backgroundColor: palette.borderGold + '22', borderColor: palette.borderGold },
        ]}
      >
        <Text style={[typography.arabicBold, { color: palette.borderGreen, fontSize: 18 }]}>
          {toArabicDigits(pageNumber)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  pageBadge: {
    minWidth: 38,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 10,
  },
});

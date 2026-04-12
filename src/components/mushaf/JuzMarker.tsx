import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { toArabicDigits } from '@/utils/arabicNumerals';

interface JuzMarkerProps {
  juzNumber: number;
}

export function JuzMarker({ juzNumber }: JuzMarkerProps) {
  const palette = useThemePalette();
  return (
    <View
      style={[
        styles.marker,
        { backgroundColor: palette.borderGreen, borderColor: palette.borderGold },
      ]}
    >
      <Text style={[typography.captionSans, { color: palette.borderGold, fontSize: 9 }]}>JUZ</Text>
      <Text
        style={[
          typography.arabicBold,
          { color: palette.surfaceGold, fontSize: 16, lineHeight: 18 },
        ]}
      >
        {toArabicDigits(juzNumber)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    right: -2,
    top: 120,
    width: 30,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
});

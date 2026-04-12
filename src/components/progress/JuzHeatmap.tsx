import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useProgress } from '@/store/progress';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { toArabicDigits } from '@/utils/arabicNumerals';

export function JuzHeatmap() {
  const palette = useThemePalette();
  const perJuz = useProgress((s) => s.perJuzScore);

  return (
    <View style={styles.wrap}>
      <Text style={[typography.captionSans, { color: palette.textMuted, marginBottom: 10, letterSpacing: 1.2 }]}>
        JUZ HEATMAP
      </Text>
      <View style={styles.grid}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
          const score = perJuz[juz] ?? 0;
          return (
            <View
              key={juz}
              style={[
                styles.cell,
                {
                  backgroundColor: palette.borderGreen,
                  opacity: 0.15 + score * 0.85,
                  borderColor: palette.borderGold + '55',
                },
              ]}
            >
              <Text style={{ color: palette.surfaceGold, fontSize: 10, fontWeight: '700' }}>
                {toArabicDigits(juz)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

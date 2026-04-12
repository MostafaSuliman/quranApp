import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useProgress } from '@/store/progress';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { toArabicDigits } from '@/utils/arabicNumerals';
import { levelFromXp } from '@/utils/xp';

export function QuickStats() {
  const palette = useThemePalette();
  const streak = useProgress((s) => s.streak);
  const xp = useProgress((s) => s.xp);
  const memorized = useProgress((s) => s.memorizedVerseKeys.length);
  const { level } = levelFromXp(xp);

  return (
    <View style={styles.row}>
      {[
        { label: 'STREAK', value: toArabicDigits(streak) },
        { label: 'LEVEL', value: toArabicDigits(level) },
        { label: 'VERSES', value: toArabicDigits(memorized) },
      ].map((s) => (
        <View
          key={s.label}
          style={[
            styles.stat,
            { backgroundColor: palette.surface, borderColor: palette.borderGold + '55' },
          ]}
        >
          <Text style={[typography.captionSans, { color: palette.textMuted }]}>{s.label}</Text>
          <Text style={[typography.displaySans, { color: palette.borderGreen, marginTop: 4 }]}>
            {s.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 18 },
  stat: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
});

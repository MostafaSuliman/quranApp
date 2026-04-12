import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useHifzPlan } from '@/hooks/useHifzPlan';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { toArabicDigits } from '@/utils/arabicNumerals';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { tapLight } from '@/utils/haptics';

export function TodayPlanCard() {
  const palette = useThemePalette();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useHifzPlan();

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.borderGold + '55' }]}>
        <LottieLoader />
      </View>
    );
  }

  if (error || !data) {
    return (
      <Pressable
        onPress={() => refetch()}
        style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.borderGold + '55' }]}
      >
        <Text style={[typography.titleSans, { color: palette.error }]}>Plan unavailable</Text>
        <Text style={[typography.bodySans, { color: palette.textMuted, marginTop: 4 }]}>Tap to retry.</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.borderGold + '55' }]}>
      <Text style={[typography.captionSans, { color: palette.borderGreen, letterSpacing: 1.2 }]}>
        TODAY · {toArabicDigits(data.estMinutes)} MIN
      </Text>
      <Text style={[typography.displaySans, { color: palette.text, marginTop: 6 }]}>{data.title}</Text>
      <Text style={[typography.bodySans, { color: palette.textMuted, marginTop: 8 }]}>{data.nasiha}</Text>

      <View style={styles.verseList}>
        {data.ayat.map((key) => (
          <Pressable
            key={key}
            onPress={() => {
              tapLight();
              router.push(`/session/${encodeURIComponent(key)}` as never);
            }}
            style={({ pressed }) => [
              styles.versePill,
              {
                backgroundColor: palette.surfaceLavender,
                borderColor: palette.borderGold,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[typography.bodySans, { color: palette.text, fontWeight: '600' }]}>
              {toArabicDigits(key.replace(':', '·'))}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: -40, // overlap parallax
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  verseList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  versePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
});

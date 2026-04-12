import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { levelFromXp } from '@/utils/xp';
import { toArabicDigits } from '@/utils/arabicNumerals';

export function XPBar({ xp }: { xp: number }) {
  const palette = useThemePalette();
  const { level, progress, nextLevelXp } = levelFromXp(xp);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 700 });
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[typography.captionSans, { color: palette.textMuted, letterSpacing: 1.2 }]}>
          LEVEL {toArabicDigits(level)}
        </Text>
        <Text style={[typography.captionSans, { color: palette.textMuted }]}>
          {toArabicDigits(xp)} / {toArabicDigits(level * 100 + (nextLevelXp - level * 100))} XP
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: palette.surfaceLavender }]}>
        <Animated.View style={[styles.fill, { backgroundColor: palette.borderGold }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 20, marginTop: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});

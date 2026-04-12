import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StreakFlame } from '@/components/progress/StreakFlame';
import { XPBar } from '@/components/progress/XPBar';
import { JuzHeatmap } from '@/components/progress/JuzHeatmap';
import { useProgress } from '@/store/progress';
import { useThemePalette } from '@/theme';

export default function ProgressScreen() {
  const palette = useThemePalette();
  const streak = useProgress((s) => s.streak);
  const xp = useProgress((s) => s.xp);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <StreakFlame streak={streak} />
        <XPBar xp={xp} />
        <JuzHeatmap />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

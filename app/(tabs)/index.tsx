import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParallaxHeader } from '@/components/home/ParallaxHeader';
import { TodayPlanCard } from '@/components/home/TodayPlanCard';
import { QuickStats } from '@/components/home/QuickStats';
import { useThemePalette } from '@/theme';

const AnimatedScroll = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const palette = useThemePalette();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <AnimatedScroll
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ParallaxHeader scrollY={scrollY} title="Hifz" subtitle="AS-SALAMU ALAYKUM" />
        <TodayPlanCard />
        <QuickStats />
        <SafeAreaView edges={['bottom']} />
      </AnimatedScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
});

import React from 'react';
import { Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';

interface ParallaxHeaderProps {
  scrollY: SharedValue<number>;
  title: string;
  subtitle: string;
  height?: number;
}

export function ParallaxHeader({ scrollY, title, subtitle, height = 220 }: ParallaxHeaderProps) {
  const palette = useThemePalette();

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.5 }, { scale: interpolate(scrollY.value, [-120, 0], [1.15, 1], 'clamp') }],
    opacity: interpolate(scrollY.value, [0, height], [1, 0.2], 'clamp'),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.2 }],
  }));

  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Animated.View style={[{ position: 'absolute', inset: 0 }, bgStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={palette.borderGreen} />
              <Stop offset="1" stopColor={palette.bg} />
            </LinearGradient>
          </Defs>
          <Rect width="400" height="260" fill="url(#sky)" />
          {/* Crescent */}
          <Circle cx={320} cy={90} r={40} fill={palette.borderGold} opacity={0.85} />
          <Circle cx={310} cy={80} r={40} fill={palette.borderGreen} />
          {/* Distant skyline suggestion */}
          <Rect x={40} y={200} width={40} height={60} fill={palette.borderGold} opacity={0.22} />
          <Rect x={110} y={180} width={30} height={80} fill={palette.borderGold} opacity={0.18} />
          <Rect x={170} y={210} width={25} height={50} fill={palette.borderGold} opacity={0.25} />
          <Circle cx={60} cy={200} r={10} fill={palette.borderGold} opacity={0.3} />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ flex: 1, justifyContent: 'flex-end', padding: 22 }, titleStyle]}>
        <Text style={[typography.captionSans, { color: palette.surfaceGold, letterSpacing: 1.5 }]}>
          {subtitle}
        </Text>
        <Text style={[typography.displaySans, { color: palette.surfaceGold, marginTop: 4 }]}>
          {title}
        </Text>
      </Animated.View>
    </View>
  );
}

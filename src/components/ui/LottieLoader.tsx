import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useThemePalette } from '@/theme';

/**
 * Reanimated spinning crescent — used as a lightweight loader.
 * (Named LottieLoader for call-site simplicity; no bitmap JSON required.)
 */
export function LottieLoader({ size = 56 }: { size?: number }) {
  const palette = useThemePalette();
  const rot = useSharedValue(0);

  useEffect(() => {
    rot.value = withRepeat(
      withTiming(360, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
  }, [rot]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <G>
          <Circle cx={20} cy={20} r={16} stroke={palette.borderGold} strokeWidth={3} fill="none" opacity={0.2} />
          <Circle
            cx={20}
            cy={20}
            r={16}
            stroke={palette.borderGold}
            strokeWidth={3}
            fill="none"
            strokeDasharray="40 120"
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </Animated.View>
  );
}

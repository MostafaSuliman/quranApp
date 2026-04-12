import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { toArabicDigits } from '@/utils/arabicNumerals';

export function StreakFlame({ streak }: { streak: number }) {
  const palette = useThemePalette();
  const flicker = useSharedValue(0);

  useEffect(() => {
    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
  }, [flicker]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: 1 + flicker.value * 0.1 }, { scaleX: 1 - flicker.value * 0.05 }],
  }));

  return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Animated.View style={flameStyle}>
        <Svg width={96} height={120} viewBox="0 0 96 120">
          <Defs>
            <LinearGradient id="flame" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={palette.borderGold} />
              <Stop offset="1" stopColor={palette.error} />
            </LinearGradient>
          </Defs>
          <Path
            d="M48 4 C60 28 82 40 76 72 C72 96 58 112 48 114 C38 112 24 96 20 72 C14 40 36 28 48 4 Z"
            fill="url(#flame)"
          />
          <Path
            d="M48 30 C56 46 68 54 64 74 C62 90 54 100 48 102 C42 100 34 90 32 74 C28 54 40 46 48 30 Z"
            fill={palette.surfaceGold}
            opacity={0.8}
          />
        </Svg>
      </Animated.View>
      <Text style={[typography.displaySans, { color: palette.text, marginTop: 6 }]}>
        {toArabicDigits(streak)}
      </Text>
      <Text style={[typography.captionSans, { color: palette.textMuted, letterSpacing: 1.4 }]}>
        DAY STREAK
      </Text>
    </View>
  );
}

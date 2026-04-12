import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useThemePalette } from '@/theme';
import { tapMedium } from '@/utils/haptics';

interface RecordButtonProps {
  recording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function RecordButton({ recording, onToggle, disabled }: RecordButtonProps) {
  const palette = useThemePalette();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (recording) {
      pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [recording, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.25 }],
    opacity: 1 - pulse.value * 0.6,
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.ring,
          { borderColor: recording ? palette.error : palette.borderGold },
          ringStyle,
        ]}
      />
      <Pressable
        disabled={disabled}
        onPress={() => {
          tapMedium();
          onToggle();
        }}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: recording ? palette.error : palette.borderGreen,
            opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.innerIcon,
            recording
              ? { backgroundColor: palette.surfaceGold, borderRadius: 4, width: 18, height: 18 }
              : { backgroundColor: palette.surfaceGold, borderRadius: 999, width: 24, height: 24 },
          ]}
        />
      </Pressable>
      <Text style={{ color: palette.textMuted, marginTop: 12, fontSize: 13, letterSpacing: 0.4 }}>
        {recording ? 'Recording… tap to stop' : 'Tap to start recording'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    top: 16,
  },
  btn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerIcon: { alignSelf: 'center' },
});

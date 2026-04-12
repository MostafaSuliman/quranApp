import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useThemePalette } from '@/theme';
import { tapLight } from '@/utils/haptics';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const palette = useThemePalette();
  const bg =
    variant === 'primary'
      ? palette.borderGreen
      : variant === 'secondary'
      ? palette.borderGold
      : 'transparent';
  const fg =
    variant === 'primary' ? palette.surfaceGold : variant === 'secondary' ? palette.borderGreen : palette.text;
  const border = variant === 'ghost' ? palette.borderGold : 'transparent';

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        tapLight();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

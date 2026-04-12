import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useThemePalette } from '@/theme';

interface ThemedTextProps extends TextProps {
  variant?: 'title' | 'display' | 'body' | 'caption' | 'muted';
}

export function ThemedText({ variant = 'body', style, ...rest }: ThemedTextProps) {
  const palette = useThemePalette();
  const color =
    variant === 'muted' ? palette.textMuted : palette.text;
  const base: TextStyle =
    variant === 'display'
      ? { fontSize: 26, fontWeight: '700' }
      : variant === 'title'
      ? { fontSize: 18, fontWeight: '600' }
      : variant === 'caption'
      ? { fontSize: 12, fontWeight: '500', letterSpacing: 0.8 }
      : { fontSize: 15 };
  return <Text {...rest} style={[{ color }, base, style]} />;
}

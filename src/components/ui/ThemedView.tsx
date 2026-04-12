import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemePalette } from '@/theme';

interface ThemedViewProps extends ViewProps {
  tone?: 'bg' | 'surface' | 'lavender' | 'gold';
}

export function ThemedView({ tone = 'bg', style, ...rest }: ThemedViewProps) {
  const palette = useThemePalette();
  const bg =
    tone === 'surface'
      ? palette.surface
      : tone === 'lavender'
      ? palette.surfaceLavender
      : tone === 'gold'
      ? palette.surfaceGold
      : palette.bg;
  return <View {...rest} style={[{ backgroundColor: bg }, style]} />;
}

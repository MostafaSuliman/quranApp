import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { useThemePalette } from '@/theme';
import { toArabicDigits } from '@/utils/arabicNumerals';

interface VerseMedallionProps {
  verseNumber: number;
  size?: number;
}

/**
 * Decorative 8-point star medallion containing the verse number in Eastern Arabic digits.
 * Used inline after each verse, traditional Mushaf style.
 */
export function VerseMedallion({ verseNumber, size = 28 }: VerseMedallionProps) {
  const palette = useThemePalette();
  const half = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Polygon
          points={starPoints(half, half, half - 1, half - 6)}
          fill={palette.borderGold}
          stroke={palette.borderGreen}
          strokeWidth={1}
        />
        <Circle cx={half} cy={half} r={half - 8} fill={palette.surface} />
      </Svg>
      <Text
        style={{
          fontSize: size * 0.42,
          fontFamily: 'Amiri_700Bold',
          color: palette.borderGreen,
          lineHeight: size * 0.55,
        }}
      >
        {toArabicDigits(verseNumber)}
      </Text>
    </View>
  );
}

function starPoints(cx: number, cy: number, r1: number, r2: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return pts.join(' ');
}

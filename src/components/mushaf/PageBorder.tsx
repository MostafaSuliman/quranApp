import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, Path, Pattern, Polygon, Rect } from 'react-native-svg';
import { useThemePalette } from '@/theme';

interface PageBorderProps {
  width: number;
  height: number;
  children: ReactNode;
}

/**
 * Ornamental Mushaf page frame. Draws an interlaced gold/green border
 * with repeating 8-point star motif and four corner medallions.
 * Pure SVG — no bitmap assets — so it scales to any device.
 */
export function PageBorder({ width, height, children }: PageBorderProps) {
  const palette = useThemePalette();
  const outerPad = 10;
  const innerPad = 22;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="starPattern" x={0} y={0} width={24} height={24} patternUnits="userSpaceOnUse">
            <Polygon
              points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10"
              fill={palette.borderGold}
              opacity={0.55}
            />
          </Pattern>
        </Defs>

        {/* Outer frame */}
        <Rect
          x={outerPad}
          y={outerPad}
          width={width - outerPad * 2}
          height={height - outerPad * 2}
          rx={14}
          ry={14}
          stroke={palette.borderGold}
          strokeWidth={3}
          fill="transparent"
        />
        {/* Patterned band */}
        <Rect
          x={outerPad + 4}
          y={outerPad + 4}
          width={width - (outerPad + 4) * 2}
          height={height - (outerPad + 4) * 2}
          rx={10}
          ry={10}
          stroke="url(#starPattern)"
          strokeWidth={10}
          fill="transparent"
        />
        {/* Inner hairline */}
        <Rect
          x={innerPad}
          y={innerPad}
          width={width - innerPad * 2}
          height={height - innerPad * 2}
          rx={6}
          ry={6}
          stroke={palette.borderGreen}
          strokeWidth={1.5}
          fill="transparent"
        />

        {/* Corner medallions */}
        {([
          [outerPad + 4, outerPad + 4],
          [width - outerPad - 20, outerPad + 4],
          [outerPad + 4, height - outerPad - 20],
          [width - outerPad - 20, height - outerPad - 20],
        ] as const).map(([cx, cy], i) => (
          <G key={i} transform={`translate(${cx},${cy})`}>
            <Polygon
              points="8,0 10,6 16,8 10,10 8,16 6,10 0,8 6,6"
              fill={palette.borderGold}
            />
            <Path d="M8 3 L13 8 L8 13 L3 8 Z" fill={palette.borderGreen} />
          </G>
        ))}
      </Svg>

      <View
        style={{
          position: 'absolute',
          left: innerPad + 8,
          right: innerPad + 8,
          top: innerPad + 8,
          bottom: innerPad + 8,
        }}
      >
        {children}
      </View>
    </View>
  );
}

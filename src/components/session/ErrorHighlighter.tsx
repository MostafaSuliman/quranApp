import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecitationErrorWord } from '@/api/claude';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';

interface ErrorHighlighterProps {
  markers: RecitationErrorWord[];
}

export function ErrorHighlighter({ markers }: ErrorHighlighterProps) {
  const palette = useThemePalette();

  const colorFor = (status: RecitationErrorWord['status']): string => {
    switch (status) {
      case 'correct':
        return palette.success;
      case 'wrong':
        return palette.error;
      case 'missing':
        return palette.warning;
      case 'extra':
        return palette.textMuted;
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: palette.surface, borderColor: palette.borderGold + '55' }]}>
      <Text
        style={[
          typography.arabicLG,
          { color: palette.text, textAlign: 'right', writingDirection: 'rtl', flexWrap: 'wrap' },
        ]}
      >
        {markers.map((m, i) => (
          <Text key={i} style={{ color: colorFor(m.status) }}>
            {m.word}{' '}
          </Text>
        ))}
      </Text>
      <View style={styles.legend}>
        {(['correct', 'missing', 'wrong', 'extra'] as const).map((k) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colorFor(k) }]} />
            <Text style={[typography.captionSans, { color: palette.textMuted }]}>
              {k.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, margin: 16, borderRadius: 16, borderWidth: 1 },
  legend: { flexDirection: 'row', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

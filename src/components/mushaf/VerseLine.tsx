import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { QuranVerse } from '@/api/quran';
import { VerseMedallion } from './VerseMedallion';

interface VerseLineProps {
  verse: QuranVerse;
  /** Zero-based index within the current page used to alternate backgrounds. */
  index: number;
  isPlaying: boolean;
  onPress: () => void;
}

export function VerseLine({ verse, index, isPlaying, onPress }: VerseLineProps) {
  const palette = useThemePalette();
  const bg = index % 2 === 0 ? palette.surfaceLavender : palette.surfaceGold;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: isPlaying ? palette.borderGold + '33' : bg,
          borderColor: isPlaying ? palette.borderGold : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          typography.arabicLG,
          {
            color: palette.text,
            writingDirection: 'rtl',
            textAlign: 'right',
            flex: 1,
          },
        ]}
      >
        {verse.text_uthmani}
        {'  '}
      </Text>
      <VerseMedallion verseNumber={verse.verse_number} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
});

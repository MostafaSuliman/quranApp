import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { QuranVerse } from '@/api/quran';
import { toArabicDigits } from '@/utils/arabicNumerals';

interface HiddenVerseCardProps {
  verse: QuranVerse;
  revealed: boolean;
  onToggleReveal: () => void;
}

export function HiddenVerseCard({ verse, revealed, onToggleReveal }: HiddenVerseCardProps) {
  const palette = useThemePalette();
  const words = verse.text_uthmani.split(/\s+/);
  const [cheatWord, setCheatWord] = useState(0);

  return (
    <View style={[styles.card, { backgroundColor: palette.surfaceLavender, borderColor: palette.borderGold }]}>
      <Text style={[typography.captionSans, { color: palette.borderGreen, letterSpacing: 1.2 }]}>
        {toArabicDigits(verse.verse_key)}
      </Text>
      <Text
        style={[
          typography.arabicXL,
          {
            color: palette.text,
            textAlign: 'right',
            writingDirection: 'rtl',
            marginTop: 10,
          },
        ]}
      >
        {words
          .map((w, i) => (revealed || i < cheatWord ? w : '•'.repeat(Math.max(3, w.length))))
          .join(' ')}
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={() => setCheatWord((c) => Math.min(words.length, c + 1))}
          style={[styles.pill, { borderColor: palette.borderGold }]}
        >
          <Text style={{ color: palette.text }}>Hint</Text>
        </Pressable>
        <Pressable
          onPress={onToggleReveal}
          style={[styles.pill, { borderColor: palette.borderGold }]}
        >
          <Text style={{ color: palette.text }}>{revealed ? 'Hide' : 'Reveal'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 18, borderWidth: 1.5, margin: 16 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
});

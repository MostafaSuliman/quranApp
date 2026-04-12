import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePage } from '@/hooks/usePage';
import { useChapters } from '@/hooks/useChapters';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { toArabicDigits } from '@/utils/arabicNumerals';
import { PageBorder } from './PageBorder';
import { PageHeader } from './PageHeader';
import { VerseLine } from './VerseLine';
import { JuzMarker } from './JuzMarker';

interface MushafPageProps {
  pageNumber: number;
  width: number;
  height: number;
  currentVerseKey: string | null;
  onVersePress: (verseKey: string) => void;
}

export function MushafPage({
  pageNumber,
  width,
  height,
  currentVerseKey,
  onVersePress,
}: MushafPageProps) {
  const palette = useThemePalette();
  const { data: verses, isLoading, error } = usePage(pageNumber);
  const { data: chapters } = useChapters();

  const dominantChapter = useMemo(() => {
    if (!verses || verses.length === 0) return null;
    return chapters?.find((c) => c.id === verses[0].chapter_id) ?? null;
  }, [verses, chapters]);

  const juzOnPage = verses && verses.length ? verses[0].juz_number : null;
  const versesCount = verses?.length ?? 0;

  return (
    <View style={{ width, height, backgroundColor: palette.bg }}>
      <PageBorder width={width} height={height}>
        {dominantChapter && (
          <PageHeader
            pageNumber={pageNumber}
            surahArabic={dominantChapter.name_arabic}
            surahLatin={dominantChapter.name_simple}
          />
        )}

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={palette.borderGold} />
          </View>
        )}

        {error && (
          <View style={styles.center}>
            <Text style={[typography.bodySans, { color: palette.error }]}>
              Could not load page {toArabicDigits(pageNumber)}.
            </Text>
          </View>
        )}

        {verses && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {verses.map((verse, i) => (
              <VerseLine
                key={verse.id}
                verse={verse}
                index={i}
                isPlaying={currentVerseKey === verse.verse_key}
                onPress={() => onVersePress(verse.verse_key)}
              />
            ))}
          </ScrollView>
        )}

        {verses && dominantChapter && (
          <View style={[styles.footer, { borderTopColor: palette.borderGold + '44' }]}>
            <Text style={[typography.captionSans, { color: palette.textMuted }]}>
              {dominantChapter.name_simple.toUpperCase()} · {toArabicDigits(versesCount)}
            </Text>
            <Text style={[typography.captionSans, { color: palette.textMuted }]}>
              {toArabicDigits(pageNumber)} / {toArabicDigits(604)}
            </Text>
          </View>
        )}
      </PageBorder>

      {juzOnPage != null && <JuzMarker juzNumber={juzOnPage} />}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
  },
});

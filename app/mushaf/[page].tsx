import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageFlipper } from '@/components/mushaf/PageFlipper';
import { usePageAudio } from '@/hooks/usePageAudio';
import { useSettings } from '@/store/settings';
import { useThemePalette } from '@/theme';

export default function MushafPageRoute() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const pageNumber = clamp(parseInt(page ?? '1', 10) || 1, 1, 604);
  const palette = useThemePalette();
  const router = useRouter();

  const reciterId = useSettings((s) => s.reciterId);
  const setLastPage = useSettings((s) => s.setLastPage);
  const { play, stop, currentVerseKey } = usePageAudio(pageNumber, reciterId);

  useEffect(() => {
    setLastPage(pageNumber);
    return () => {
      void stop();
    };
  }, [pageNumber, setLastPage, stop]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <PageFlipper
        pageNumber={pageNumber}
        onPageChange={(p) => router.replace(`/mushaf/${p}` as never)}
        currentVerseKey={currentVerseKey}
        onVersePress={(key) => {
          void play(key);
        }}
      />
    </View>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

import { useQuery } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPageAudio, QuranAudioFile } from '@/api/quran';

export function usePageAudio(pageNumber: number, recitationId: number | null) {
  const { data: audioFiles } = useQuery({
    queryKey: ['quran', 'audio', recitationId, pageNumber],
    queryFn: () => getPageAudio(recitationId as number, pageNumber),
    enabled: recitationId != null && pageNumber >= 1 && pageNumber <= 604,
    staleTime: 1000 * 60 * 30,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setCurrentVerseKey(null);
  }, []);

  const play = useCallback(
    async (verseKey: string) => {
      const file = audioFiles?.find((f: QuranAudioFile) => f.verse_key === verseKey);
      if (!file) return;
      await stop();
      // quran.com returns relative URLs in some responses; prepend CDN if missing.
      const url = file.url.startsWith('http') ? file.url : `https://verses.quran.com/${file.url}`;
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      soundRef.current = sound;
      setCurrentVerseKey(verseKey);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setCurrentVerseKey(null);
        }
      });
    },
    [audioFiles, stop]
  );

  useEffect(
    () => () => {
      void stop();
    },
    [stop]
  );

  return { play, stop, currentVerseKey, audioFiles };
}

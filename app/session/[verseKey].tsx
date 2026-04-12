import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVerseByKey } from '@/api/quran';
import { analyzeRecitation, RecitationErrorWord } from '@/api/claude';
import { transcribeArabic } from '@/api/whisper';
import { HiddenVerseCard } from '@/components/session/HiddenVerseCard';
import { RecordButton } from '@/components/session/RecordButton';
import { ErrorHighlighter } from '@/components/session/ErrorHighlighter';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { Button } from '@/components/ui/Button';
import { useSecrets } from '@/store/secrets';
import { useProgress } from '@/store/progress';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { fallbackDiff } from '@/utils/diffWords';
import { notifyError, notifySuccess } from '@/utils/haptics';

type SessionState =
  | { kind: 'idle' }
  | { kind: 'recording' }
  | { kind: 'processing' }
  | { kind: 'results'; markers: RecitationErrorWord[]; perfect: boolean };

export default function SessionRoute() {
  const { verseKey: rawKey } = useLocalSearchParams<{ verseKey: string }>();
  const verseKey = decodeURIComponent(rawKey ?? '1:1');
  const palette = useThemePalette();
  const { anthropic, openai } = useSecrets();
  const finishSession = useProgress((s) => s.finishSession);

  const [state, setState] = useState<SessionState>({ kind: 'idle' });
  const [revealed, setRevealed] = useState(false);
  const recordingRef = React.useRef<Audio.Recording | null>(null);

  const { data: verse, isLoading } = useQuery({
    queryKey: ['quran', 'verse', verseKey],
    queryFn: () => getVerseByKey(verseKey),
    staleTime: Infinity,
  });

  const startRecording = useCallback(async () => {
    try {
      const perms = await Audio.requestPermissionsAsync();
      if (!perms.granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recordingRef.current = rec;
      setState({ kind: 'recording' });
    } catch (e) {
      notifyError();
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current || !verse) return;
    setState({ kind: 'processing' });
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error('no uri');

      let transcribed = '';
      if (openai) {
        transcribed = await transcribeArabic(openai, uri);
      } else {
        // Without OpenAI key we cannot do STT; fall through to self-assessment.
        setState({
          kind: 'results',
          markers: verse.text_uthmani.split(/\s+/).map((word) => ({ word, status: 'missing' as const })),
          perfect: false,
        });
        return;
      }

      let markers: RecitationErrorWord[];
      if (anthropic) {
        markers = await analyzeRecitation(anthropic, verse.text_uthmani, transcribed);
      } else {
        markers = fallbackDiff(verse.text_uthmani.split(/\s+/), transcribed);
      }

      const perfect = markers.every((m) => m.status === 'correct');
      if (perfect) notifySuccess();
      setState({ kind: 'results', markers, perfect });
      finishSession([verse.verse_key], perfect, [verse.juz_number]);
    } catch (e) {
      notifyError();
      setState({ kind: 'idle' });
    }
  }, [verse, openai, anthropic, finishSession]);

  if (isLoading || !verse) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: palette.bg }]}>
        <LottieLoader />
      </SafeAreaView>
    );
  }

  const recording = state.kind === 'recording';
  const processing = state.kind === 'processing';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <HiddenVerseCard
          verse={verse}
          revealed={revealed}
          onToggleReveal={() => setRevealed((r) => !r)}
        />

        {processing ? (
          <View style={styles.processing}>
            <LottieLoader />
            <Text style={[typography.bodySans, { color: palette.textMuted, marginTop: 10 }]}>
              Analyzing recitation…
            </Text>
          </View>
        ) : (
          <RecordButton
            recording={recording}
            onToggle={() => (recording ? stopRecording() : startRecording())}
            disabled={processing}
          />
        )}

        {state.kind === 'results' && (
          <>
            <ErrorHighlighter markers={state.markers} />
            <View style={{ paddingHorizontal: 16 }}>
              <Button
                label={state.perfect ? 'Perfect! Try another' : 'Try again'}
                onPress={() => setState({ kind: 'idle' })}
              />
            </View>
          </>
        )}

        {!openai && state.kind === 'idle' && (
          <Text
            style={[
              typography.captionSans,
              { color: palette.warning, textAlign: 'center', marginTop: 16, paddingHorizontal: 24 },
            ]}
          >
            Add an OpenAI key in Settings to enable automatic recitation error detection.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  processing: { alignItems: 'center', padding: 30 },
});

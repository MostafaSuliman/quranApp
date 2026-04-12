import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settings';
import { useProgress } from '@/store/progress';
import { useSecrets } from '@/store/secrets';
import { useRecitations } from '@/hooks/useRecitations';
import { useThemePalette } from '@/theme';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import type { ThemeMode } from '@/theme/colors';

export default function SettingsScreen() {
  const palette = useThemePalette();
  const themePref = useSettings((s) => s.themePreference);
  const setThemePref = useSettings((s) => s.setThemePreference);
  const reciterId = useSettings((s) => s.reciterId);
  const setReciterId = useSettings((s) => s.setReciterId);
  const resetProgress = useProgress((s) => s.reset);
  const { preferred, isLoading } = useRecitations();
  const { anthropic, openai, saveAnthropic, saveOpenAI, loading: loadingSecrets } = useSecrets();

  const [anthropicInput, setAnthropicInput] = useState('');
  const [openaiInput, setOpenaiInput] = useState('');

  useEffect(() => {
    if (!loadingSecrets) {
      setAnthropicInput(anthropic ?? '');
      setOpenaiInput(openai ?? '');
    }
  }, [loadingSecrets, anthropic, openai]);

  // Auto-pick Mishary as default reciter once the list arrives.
  useEffect(() => {
    if (!reciterId && preferred.length > 0) {
      const mishary = preferred.find((r) => r.reciter_name.toLowerCase().includes('mishary'));
      setReciterId((mishary ?? preferred[0]).id);
    }
  }, [preferred, reciterId, setReciterId]);

  const confirmReset = () => {
    Alert.alert('Reset progress?', 'This clears your streak, XP, and memorized verses.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetProgress },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        <Text style={[typography.displaySans, { color: palette.text }]}>Settings</Text>

        <Section title="Appearance" palette={palette}>
          <View style={styles.row}>
            {(['light', 'dark', 'auto'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setThemePref(mode as ThemeMode | 'auto')}
                style={[
                  styles.segment,
                  {
                    backgroundColor: themePref === mode ? palette.borderGreen : palette.surface,
                    borderColor: palette.borderGold,
                  },
                ]}
              >
                <Text
                  style={{
                    color: themePref === mode ? palette.surfaceGold : palette.text,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Reciter" palette={palette}>
          {isLoading && <Text style={{ color: palette.textMuted }}>Loading reciters…</Text>}
          <View style={{ gap: 8 }}>
            {preferred.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => setReciterId(r.id)}
                style={[
                  styles.reciter,
                  {
                    backgroundColor: reciterId === r.id ? palette.surfaceLavender : palette.surface,
                    borderColor: reciterId === r.id ? palette.borderGold : palette.borderGold + '55',
                  },
                ]}
              >
                <Text style={{ color: palette.text, fontWeight: '600' }}>{r.reciter_name}</Text>
                {r.style && (
                  <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: 2 }}>{r.style}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="API Keys" palette={palette}>
          <Text style={[typography.bodySans, { color: palette.textMuted, marginBottom: 8 }]}>
            Hifz is 100% free. Bring your own keys — they're stored securely on this device only.
          </Text>
          <Text style={[typography.captionSans, { color: palette.textMuted }]}>ANTHROPIC</Text>
          <TextInput
            placeholder="sk-ant-…"
            placeholderTextColor={palette.textMuted}
            value={anthropicInput}
            onChangeText={setAnthropicInput}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { color: palette.text, borderColor: palette.borderGold + '88' }]}
          />
          <Button label="Save Anthropic key" onPress={() => saveAnthropic(anthropicInput.trim())} style={{ marginBottom: 16 }} />

          <Text style={[typography.captionSans, { color: palette.textMuted }]}>OPENAI</Text>
          <TextInput
            placeholder="sk-…"
            placeholderTextColor={palette.textMuted}
            value={openaiInput}
            onChangeText={setOpenaiInput}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { color: palette.text, borderColor: palette.borderGold + '88' }]}
          />
          <Button label="Save OpenAI key" onPress={() => saveOpenAI(openaiInput.trim())} />
        </Section>

        <Section title="Data" palette={palette}>
          <Button label="Reset progress" variant="ghost" onPress={confirmReset} />
        </Section>

        <Text
          style={[
            typography.captionSans,
            { color: palette.textMuted, textAlign: 'center', marginTop: 24 },
          ]}
        >
          Quran text and audio by api.quran.com · 100% free · no ads
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
  palette,
}: {
  title: string;
  children: React.ReactNode;
  palette: ReturnType<typeof useThemePalette>;
}) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={[typography.titleSans, { color: palette.borderGreen, marginBottom: 10 }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  segment: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  reciter: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 10,
    fontSize: 15,
  },
});

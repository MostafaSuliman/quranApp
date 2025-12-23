import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, useColorScheme } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuranStore, useAudioStore, useSettingsStore } from '@/stores'
import { toArabicIndic } from '@/utils/numerals'
import type { Ayah } from '@/types'

export default function SurahScreen() {
  const { number } = useLocalSearchParams<{ number: string }>()
  const surahNumber = parseInt(number || '1', 10)

  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  const loadSurah = useQuranStore((s) => s.loadSurah)
  const getSurahByNumber = useQuranStore((s) => s.getSurahByNumber)
  const getSurahAyahsList = useQuranStore((s) => s.getSurahAyahsList)
  const surahLoading = useQuranStore((s) => s.surahLoading)
  const { isPlaying, currentAyah, pause, resume } = useAudioStore()
  const reciterId = useSettingsStore((s) => s.selectedReciterId)
  const playAyah = useAudioStore((s) => s.playAyah)

  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const surah = getSurahByNumber(surahNumber)

  useEffect(() => {
    async function load() {
      const data = await loadSurah(surahNumber)
      setAyahs(data)
    }
    load()
  }, [surahNumber, loadSurah])

  const cachedAyahs = getSurahAyahsList(surahNumber)
  const displayAyahs = cachedAyahs || ayahs

  const styles = createStyles(isDark, fontSize)

  const handlePlayAyah = async (ayahNumberInSurah: number) => {
    if (currentAyah?.surahNumber === surahNumber && currentAyah?.ayahNumber === ayahNumberInSurah) {
      if (isPlaying) {
        pause()
      } else {
        resume()
      }
    } else {
      await playAyah(surahNumber, ayahNumberInSurah, reciterId)
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: surah?.name || `سورة ${toArabicIndic(surahNumber)}`,
        }}
      />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {surahLoading && displayAyahs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2d8a4e" />
            <Text style={styles.loadingText}>جاري تحميل السورة...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Surah Header */}
            {surah && (
              <View style={styles.surahHeader}>
                <Text style={styles.surahName}>{surah.name}</Text>
                <Text style={styles.surahInfo}>
                  {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {toArabicIndic(surah.numberOfAyahs)} آية
                </Text>
              </View>
            )}

            {/* Bismillah */}
            {surahNumber !== 1 && surahNumber !== 9 && (
              <View style={styles.bismillah}>
                <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
              </View>
            )}

            {/* Ayahs */}
            <View style={styles.ayahsContainer}>
              {displayAyahs.map((ayah) => {
                const isCurrentlyPlaying =
                  currentAyah?.surahNumber === surahNumber &&
                  currentAyah?.ayahNumber === ayah.numberInSurah &&
                  isPlaying

                return (
                  <Pressable
                    key={ayah.numberInSurah}
                    style={[styles.ayahContainer, isCurrentlyPlaying && styles.ayahContainerPlaying]}
                    onPress={() => handlePlayAyah(ayah.numberInSurah)}
                  >
                    <View style={styles.ayahHeader}>
                      <View style={styles.ayahNumberBadge}>
                        <Text style={styles.ayahNumberText}>{toArabicIndic(ayah.numberInSurah)}</Text>
                      </View>
                      <Pressable
                        style={styles.playButton}
                        onPress={() => handlePlayAyah(ayah.numberInSurah)}
                      >
                        <Ionicons
                          name={isCurrentlyPlaying ? 'pause' : 'play'}
                          size={16}
                          color={isCurrentlyPlaying ? '#2d8a4e' : isDark ? '#888' : '#666'}
                        />
                      </Pressable>
                    </View>
                    <Text style={styles.ayahText}>{ayah.text}</Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  )
}

const fontSizeMap = {
  small: 20,
  medium: 24,
  large: 30,
  xlarge: 36,
}

const createStyles = (isDark: boolean, fontSize: 'small' | 'medium' | 'large' | 'xlarge') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0a0a0a' : '#f5f5dc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: isDark ? '#888' : '#666',
  },
  scrollView: {
    flex: 1,
  },
  surahHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#ddd',
  },
  surahName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    marginBottom: 8,
  },
  surahInfo: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
  },
  bismillah: {
    padding: 20,
    alignItems: 'center',
  },
  bismillahText: {
    fontSize: 24,
    color: isDark ? '#e0d5c0' : '#1a1a1a',
    fontFamily: 'System',
  },
  ayahsContainer: {
    padding: 16,
  },
  ayahContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    borderRadius: 12,
  },
  ayahContainerPlaying: {
    backgroundColor: isDark ? '#1a3a2a' : '#e8f5e9',
    borderWidth: 1,
    borderColor: '#2d8a4e',
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ayahNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#333' : '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#333' : '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahText: {
    fontFamily: 'System',
    fontSize: fontSizeMap[fontSize],
    lineHeight: fontSizeMap[fontSize] * 1.8,
    color: isDark ? '#e0d5c0' : '#1a1a1a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
})

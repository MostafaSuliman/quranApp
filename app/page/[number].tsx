import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, useColorScheme } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuranStore, useAudioStore, useSettingsStore, useMemorizationStore } from '@/stores'
import { toArabicIndic, formatPageNumber, formatAyahNumber } from '@/utils/numerals'
import type { Ayah } from '@/types'

export default function PageScreen() {
  const { number } = useLocalSearchParams<{ number: string }>()
  const pageNumber = parseInt(number || '1', 10)
  const router = useRouter()

  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  const loadPage = useQuranStore((s) => s.loadPage)
  const getPageAyahs = useQuranStore((s) => s.getPageAyahs)
  const pageLoading = useQuranStore((s) => s.pageLoading)
  const { playAyah, isPlaying, currentAyah, pause, resume } = useAudioStore()
  const reciterId = useSettingsStore((s) => s.selectedReciterId)
  const getPageProgressByNumber = useMemorizationStore((s) => s.getPageProgressByNumber)

  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const pageProgress = getPageProgressByNumber(pageNumber)

  useEffect(() => {
    async function load() {
      const data = await loadPage(pageNumber)
      setAyahs(data)
    }
    load()
  }, [pageNumber, loadPage])

  const cachedAyahs = getPageAyahs(pageNumber)
  const displayAyahs = cachedAyahs || ayahs

  const styles = createStyles(isDark, fontSize)

  const handlePlayAyah = async (surahNumber: number, ayahNumber: number) => {
    if (currentAyah?.surahNumber === surahNumber && currentAyah?.ayahNumber === ayahNumber) {
      if (isPlaying) {
        await pause()
      } else {
        await resume()
      }
    } else {
      await playAyah(surahNumber, ayahNumber, reciterId)
    }
  }

  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      router.replace(`/page/${pageNumber - 1}`)
    }
  }

  const goToNextPage = () => {
    if (pageNumber < 604) {
      router.replace(`/page/${pageNumber + 1}`)
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: formatPageNumber(pageNumber),
          headerRight: () => (
            <View style={styles.headerRight}>
              {pageProgress?.status === 'memorized' && (
                <Ionicons name="checkmark-circle" size={24} color="#2d8a4e" />
              )}
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {pageLoading && displayAyahs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2d8a4e" />
            <Text style={styles.loadingText}>جاري تحميل الصفحة...</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.pageContent}>
                {displayAyahs.map((ayah) => {
                  const isCurrentlyPlaying =
                    currentAyah?.surahNumber === ayah.surah?.number &&
                    currentAyah?.ayahNumber === ayah.numberInSurah &&
                    isPlaying

                  return (
                    <Pressable
                      key={`${ayah.surah?.number}-${ayah.numberInSurah}`}
                      style={[styles.ayahContainer, isCurrentlyPlaying && styles.ayahContainerPlaying]}
                      onPress={() => handlePlayAyah(ayah.surah?.number || 1, ayah.numberInSurah)}
                    >
                      <Text style={styles.ayahText}>
                        {ayah.text}
                        <Text style={styles.ayahNumber}>
                          {' '}﴿{toArabicIndic(ayah.numberInSurah)}﴾
                        </Text>
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>

            {/* Navigation Footer */}
            <View style={styles.footer}>
              <Pressable
                style={[styles.navButton, pageNumber >= 604 && styles.navButtonDisabled]}
                onPress={goToNextPage}
                disabled={pageNumber >= 604}
              >
                <Ionicons name="chevron-back" size={24} color={pageNumber >= 604 ? '#999' : '#fff'} />
                <Text style={[styles.navButtonText, pageNumber >= 604 && styles.navButtonTextDisabled]}>
                  التالي
                </Text>
              </Pressable>

              <View style={styles.pageIndicator}>
                <Text style={styles.pageIndicatorText}>{formatPageNumber(pageNumber)}</Text>
              </View>

              <Pressable
                style={[styles.navButton, pageNumber <= 1 && styles.navButtonDisabled]}
                onPress={goToPreviousPage}
                disabled={pageNumber <= 1}
              >
                <Text style={[styles.navButtonText, pageNumber <= 1 && styles.navButtonTextDisabled]}>
                  السابق
                </Text>
                <Ionicons name="chevron-forward" size={24} color={pageNumber <= 1 ? '#999' : '#fff'} />
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaView>
    </>
  )
}

const fontSizeMap = {
  small: 22,
  medium: 26,
  large: 32,
  xlarge: 38,
}

const createStyles = (isDark: boolean, fontSize: 'small' | 'medium' | 'large' | 'xlarge') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0a0a0a' : '#f5f5dc',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
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
  pageContent: {
    padding: 16,
    paddingBottom: 32,
  },
  ayahContainer: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  ayahContainerPlaying: {
    backgroundColor: isDark ? '#1a3a2a' : '#e8f5e9',
  },
  ayahText: {
    fontFamily: 'System', // Will be replaced with Arabic font
    fontSize: fontSizeMap[fontSize],
    lineHeight: fontSizeMap[fontSize] * 2,
    color: isDark ? '#e0d5c0' : '#1a1a1a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ayahNumber: {
    color: '#2d8a4e',
    fontSize: fontSizeMap[fontSize] * 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a472a',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  pageIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  pageIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
})

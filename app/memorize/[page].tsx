import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, useColorScheme } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuranStore, useAudioStore, useSettingsStore, useMemorizationStore } from '@/stores'
import { toArabicIndic, formatPageNumber, formatRepetitions } from '@/utils/numerals'
import type { Ayah } from '@/types'

export default function MemorizePageScreen() {
  const { page } = useLocalSearchParams<{ page: string }>()
  const pageNumber = parseInt(page || '1', 10)
  const router = useRouter()

  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const targetRepetitions = useSettingsStore((s) => s.targetRepetitions)
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  const loadPage = useQuranStore((s) => s.loadPage)
  const getPageAyahs = useQuranStore((s) => s.getPageAyahs)
  const pageLoading = useQuranStore((s) => s.pageLoading)
  const { playAyah, isPlaying, currentAyah, pause, resume } = useAudioStore()
  const reciterId = useSettingsStore((s) => s.selectedReciterId)

  const startSession = useMemorizationStore((s) => s.startSession)
  const endSession = useMemorizationStore((s) => s.endSession)
  const incrementRepetition = useMemorizationStore((s) => s.incrementRepetition)
  const currentSession = useMemorizationStore((s) => ({
    type: s.currentSessionType,
    page: s.currentPage,
    repetitions: s.sessionRepetitions,
  }))
  const markPageStatus = useMemorizationStore((s) => s.markPageStatus)
  const ratePageStrength = useMemorizationStore((s) => s.ratePageStrength)
  const completeSabaq = useMemorizationStore((s) => s.completeSabaq)

  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [showRating, setShowRating] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await loadPage(pageNumber)
      setAyahs(data)
    }
    load()

    // Start memorization session
    startSession('memorization', pageNumber)

    return () => {
      // End session when leaving
      endSession()
    }
  }, [pageNumber, loadPage, startSession, endSession])

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

  const handleRepetitionComplete = () => {
    incrementRepetition()

    // Check if target reached
    if (currentSession.repetitions + 1 >= targetRepetitions) {
      setShowRating(true)
    }
  }

  const handleRating = async (rating: 'strong' | 'medium' | 'weak') => {
    await ratePageStrength(pageNumber, rating)

    if (rating === 'strong' || rating === 'medium') {
      await markPageStatus(pageNumber, 'memorized')
      await completeSabaq()
    }

    setShowRating(false)
    router.back()
  }

  const progress = (currentSession.repetitions / targetRepetitions) * 100

  return (
    <>
      <Stack.Screen
        options={{
          title: `حفظ ${formatPageNumber(pageNumber)}`,
        }}
      />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {pageLoading && displayAyahs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2d8a4e" />
            <Text style={styles.loadingText}>جاري تحميل الصفحة...</Text>
          </View>
        ) : showRating ? (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>كيف كان حفظك؟</Text>
            <Text style={styles.ratingSubtitle}>قيم مستوى حفظك لهذه الصفحة</Text>

            <View style={styles.ratingButtons}>
              <Pressable
                style={[styles.ratingButton, { backgroundColor: '#2d8a4e' }]}
                onPress={() => handleRating('strong')}
              >
                <Ionicons name="checkmark-circle" size={32} color="#fff" />
                <Text style={styles.ratingButtonText}>قوي</Text>
                <Text style={styles.ratingButtonHint}>أستطيع التسميع بثقة</Text>
              </Pressable>

              <Pressable
                style={[styles.ratingButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => handleRating('medium')}
              >
                <Ionicons name="remove-circle" size={32} color="#fff" />
                <Text style={styles.ratingButtonText}>متوسط</Text>
                <Text style={styles.ratingButtonHint}>أحتاج مراجعة قريبة</Text>
              </Pressable>

              <Pressable
                style={[styles.ratingButton, { backgroundColor: '#ef4444' }]}
                onPress={() => handleRating('weak')}
              >
                <Ionicons name="close-circle" size={32} color="#fff" />
                <Text style={styles.ratingButtonText}>ضعيف</Text>
                <Text style={styles.ratingButtonHint}>أحتاج تكرار أكثر</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {/* Progress Header */}
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>التكرارات</Text>
                <Text style={styles.progressValue}>
                  {formatRepetitions(currentSession.repetitions, targetRepetitions)}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${Math.min(100, progress)}%` }]} />
              </View>
            </View>

            {/* Quran Content */}
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

            {/* Action Footer */}
            <View style={styles.footer}>
              <Pressable style={styles.repeatButton} onPress={handleRepetitionComplete}>
                <Ionicons name="refresh" size={28} color="#fff" />
                <Text style={styles.repeatButtonText}>اكتملت التكرار</Text>
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
  progressHeader: {
    backgroundColor: '#1a472a',
    padding: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#a7d5b8',
    fontSize: 14,
  },
  progressValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2d8a4e',
    borderRadius: 4,
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
    fontFamily: 'System',
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
    backgroundColor: '#1a472a',
    padding: 16,
  },
  repeatButton: {
    backgroundColor: '#2d8a4e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  repeatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  ratingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 16,
    color: isDark ? '#888' : '#666',
    marginBottom: 32,
  },
  ratingButtons: {
    gap: 16,
    width: '100%',
  },
  ratingButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  ratingButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  ratingButtonHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
})

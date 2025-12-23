import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuranStore, useAudioStore, useSettingsStore } from '@/stores'
import { toArabicIndic, formatJuzNumber } from '@/utils/numerals'

export default function ListenScreen() {
  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  const surahs = useQuranStore((s) => s.surahs)
  const loadSurahs = useQuranStore((s) => s.loadSurahs)
  const { isPlaying, currentAyah, playAyah, pause, resume } = useAudioStore()
  const reciterId = useSettingsStore((s) => s.selectedReciterId)

  const [selectedSurah, setSelectedSurah] = useState<number | null>(null)

  useEffect(() => {
    loadSurahs()
  }, [loadSurahs])

  const styles = createStyles(isDark)

  const handlePlaySurah = async (surahNumber: number) => {
    if (currentAyah?.surahNumber === surahNumber && isPlaying) {
      await pause()
    } else if (currentAyah?.surahNumber === surahNumber && !isPlaying) {
      await resume()
    } else {
      setSelectedSurah(surahNumber)
      await playAyah(surahNumber, 1, reciterId)
    }
  }

  const renderSurah = ({ item }: { item: typeof surahs[0] }) => {
    const isCurrentSurah = currentAyah?.surahNumber === item.number
    const isCurrentlyPlaying = isCurrentSurah && isPlaying

    return (
      <Pressable
        style={[styles.surahItem, isCurrentSurah && styles.surahItemActive]}
        onPress={() => handlePlaySurah(item.number)}
      >
        <View style={styles.surahNumber}>
          <Text style={styles.surahNumberText}>{toArabicIndic(item.number)}</Text>
        </View>

        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{item.name}</Text>
          <Text style={styles.surahMeta}>
            {item.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {toArabicIndic(item.numberOfAyahs)} آية
          </Text>
        </View>

        <Pressable
          style={[styles.playButton, isCurrentlyPlaying && styles.playButtonActive]}
          onPress={() => handlePlaySurah(item.number)}
        >
          <Ionicons
            name={isCurrentlyPlaying ? 'pause' : 'play'}
            size={24}
            color={isCurrentlyPlaying ? '#fff' : '#2d8a4e'}
          />
        </Pressable>
      </Pressable>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Now Playing Bar */}
      {currentAyah && (
        <View style={styles.nowPlaying}>
          <View style={styles.nowPlayingInfo}>
            <Text style={styles.nowPlayingTitle}>
              {surahs.find(s => s.number === currentAyah.surahNumber)?.name || ''}
            </Text>
            <Text style={styles.nowPlayingSubtitle}>
              الآية {toArabicIndic(currentAyah.ayahNumber)}
            </Text>
          </View>

          <View style={styles.nowPlayingControls}>
            <Pressable style={styles.controlButton} onPress={() => isPlaying ? pause() : resume()}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Surah List */}
      <FlatList
        data={surahs}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderSurah}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>الاستماع للقرآن الكريم</Text>
            <Text style={styles.headerSubtitle}>اختر السورة للاستماع</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
  },
  listContent: {
    paddingBottom: 100,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
  },
  surahItemActive: {
    backgroundColor: isDark ? '#1a3a2a' : '#e8f5e9',
    borderWidth: 1,
    borderColor: '#2d8a4e',
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? '#333' : '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  surahNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'right',
    marginBottom: 2,
  },
  surahMeta: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    textAlign: 'right',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#333' : '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#2d8a4e',
  },
  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a472a',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d8a4e',
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
  },
  nowPlayingSubtitle: {
    fontSize: 12,
    color: '#a7d5b8',
    textAlign: 'right',
  },
  nowPlayingControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

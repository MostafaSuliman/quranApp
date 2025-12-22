import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { ReciterSelector } from '@/components/audio/ReciterSelector'
import { PlaybackSpeedSelector, RepeatCountSelector } from '@/components/audio/AudioPlayer'
import { SurahList } from '@/components/quran/SurahList'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAudioStore } from '@/stores/audio'
import { useQuranStore } from '@/stores/quran'
import { useSettingsStore } from '@/stores/settings'
import { toArabicIndic, formatPageNumber } from '@/utils/numerals'
import { cn } from '@/utils/cn'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  Music,
  ListMusic,
} from 'lucide-react'

type ListenTab = 'now-playing' | 'surahs' | 'reciters'

export function ListenPage() {
  const [activeTab, setActiveTab] = useState<ListenTab>('now-playing')

  const {
    isPlaying,
    isLoading,
    currentVerse,
    reciters,
    selectedReciterId,
    playbackSpeed,
    repeatMode,
    repeatCount,
    currentRepeat,
    pause,
    resume,
    playNext,
    playPrevious,
    setReciter,
    setPlaybackSpeed,
    setRepeatMode,
    setRepeatCount,
    loadReciters,
    initAudio,
  } = useAudioStore()

  const { surahs, loadSurahs, goToSurah } = useQuranStore()
  const { setSelectedReciterId } = useSettingsStore()

  useEffect(() => {
    initAudio()
    loadReciters()
    loadSurahs()
  }, [initAudio, loadReciters, loadSurahs])

  const handleReciterChange = (reciterId: string) => {
    setReciter(reciterId)
    setSelectedReciterId(reciterId)
  }

  const handleSurahSelect = (surahNumber: number) => {
    goToSurah(surahNumber)
    // Start playing from first ayah
    // playVerse({ surahNumber, ayahNumber: 1, pageNumber: 1, juz: 1 })
    setActiveTab('now-playing')
  }

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="الاستماع"
        description="استمع للقرآن الكريم بأصوات القراء"
      />

      {/* Tab navigation */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex">
          <TabButton
            icon={Music}
            label="التشغيل"
            isActive={activeTab === 'now-playing'}
            onClick={() => setActiveTab('now-playing')}
          />
          <TabButton
            icon={ListMusic}
            label="السور"
            isActive={activeTab === 'surahs'}
            onClick={() => setActiveTab('surahs')}
          />
          <TabButton
            icon={Volume2}
            label="القراء"
            isActive={activeTab === 'reciters'}
            onClick={() => setActiveTab('reciters')}
          />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'now-playing' && (
        <NowPlayingView
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentVerse={currentVerse}
          playbackSpeed={playbackSpeed}
          repeatMode={repeatMode}
          repeatCount={repeatCount}
          currentRepeat={currentRepeat}
          onPlayPause={() => (isPlaying ? pause() : resume())}
          onNext={playNext}
          onPrevious={playPrevious}
          onSpeedChange={setPlaybackSpeed}
          onRepeatModeChange={setRepeatMode}
          onRepeatCountChange={setRepeatCount}
        />
      )}

      {activeTab === 'surahs' && (
        <div className="px-0">
          <SurahList onSurahSelect={handleSurahSelect} />
        </div>
      )}

      {activeTab === 'reciters' && (
        <div className="p-4">
          <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
            اختر القارئ
          </h2>
          <ReciterSelector
            selectedId={selectedReciterId}
            onSelect={handleReciterChange}
          />
        </div>
      )}
    </div>
  )
}

interface TabButtonProps {
  icon: typeof Music
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ icon: Icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
        isActive
          ? 'border-b-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
          : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs arabic-ui">{label}</span>
    </button>
  )
}

interface NowPlayingViewProps {
  isPlaying: boolean
  isLoading: boolean
  currentVerse: { surahNumber: number; ayahNumber: number } | null
  playbackSpeed: number
  repeatMode: 'off' | 'verse' | 'range'
  repeatCount: number
  currentRepeat: number
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSpeedChange: (speed: number) => void
  onRepeatModeChange: (mode: 'off' | 'verse' | 'range') => void
  onRepeatCountChange: (count: number) => void
}

function NowPlayingView({
  isPlaying,
  isLoading,
  currentVerse,
  playbackSpeed,
  repeatMode,
  repeatCount,
  currentRepeat,
  onPlayPause,
  onNext,
  onPrevious,
  onSpeedChange,
  onRepeatModeChange,
  onRepeatCountChange,
}: NowPlayingViewProps) {
  const cycleRepeatMode = () => {
    if (repeatMode === 'off') {
      onRepeatModeChange('verse')
    } else if (repeatMode === 'verse') {
      onRepeatModeChange('range')
    } else {
      onRepeatModeChange('off')
    }
  }

  return (
    <div className="flex flex-col items-center p-6">
      {/* Album art placeholder */}
      <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
        <Music className="h-24 w-24 text-white/50" />
      </div>

      {/* Current playing info */}
      {currentVerse ? (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
            سورة {toArabicIndic(currentVerse.surahNumber)}
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 arabic-ui">
            الآية {toArabicIndic(currentVerse.ayahNumber)}
          </p>
          {repeatMode !== 'off' && (
            <p className="mt-1 text-sm text-primary-600 dark:text-primary-400 arabic-ui">
              تكرار {toArabicIndic(currentRepeat + 1)}/{toArabicIndic(repeatCount)}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-8 text-center">
          <h2 className="text-xl text-neutral-500 dark:text-neutral-400 arabic-ui">
            اختر سورة للاستماع
          </h2>
        </div>
      )}

      {/* Main controls */}
      <div className="mb-8 flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onPrevious}
          disabled={!currentVerse}
        >
          <SkipForward className="h-8 w-8" />
        </Button>

        <Button
          variant="primary"
          size="icon-lg"
          onClick={onPlayPause}
          disabled={isLoading || !currentVerse}
          className="h-20 w-20 rounded-full"
        >
          {isLoading ? (
            <LoadingSpinner size="md" className="text-white" />
          ) : isPlaying ? (
            <Pause className="h-10 w-10" />
          ) : (
            <Play className="h-10 w-10 mr-[-4px]" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onNext}
          disabled={!currentVerse}
        >
          <SkipBack className="h-8 w-8" />
        </Button>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center gap-4">
        <Button
          variant={repeatMode !== 'off' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={cycleRepeatMode}
        >
          {repeatMode === 'verse' ? (
            <Repeat1 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          ) : (
            <Repeat
              className={cn(
                'h-5 w-5',
                repeatMode === 'range' && 'text-primary-600 dark:text-primary-400'
              )}
            />
          )}
        </Button>
      </div>

      {/* Settings cards */}
      <div className="mt-8 w-full max-w-md space-y-4">
        {/* Playback speed */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
              سرعة التشغيل
            </h3>
            <PlaybackSpeedSelector
              value={playbackSpeed}
              onChange={onSpeedChange}
            />
          </CardContent>
        </Card>

        {/* Repeat count */}
        {repeatMode !== 'off' && (
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
                عدد التكرار
              </h3>
              <RepeatCountSelector
                value={repeatCount}
                onChange={onRepeatCountChange}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

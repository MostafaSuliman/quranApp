import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudioDownloadStore, DownloadTask } from '../stores/audioDownloadStore'

interface AudioDownloadManagerProps {
  reciters: Array<{ id: string; name: string }>
  defaultReciterId: string
}

const statusColors: Record<DownloadTask['status'], string> = {
  queued: 'text-amber-600',
  downloading: 'text-blue-600',
  completed: 'text-emerald-600',
  failed: 'text-red-600',
  cancelled: 'text-gray-500'
}

const statusLabels: Record<DownloadTask['status'], string> = {
  queued: 'Queued',
  downloading: 'Downloading',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled'
}

const AudioDownloadManager: React.FC<AudioDownloadManagerProps> = ({ reciters, defaultReciterId }) => {
  const {
    tasks,
    enqueueSurahDownload,
    cancelTask,
    removeTask,
    clearCompleted,
    refreshStorageEstimate,
    storageEstimate
  } = useAudioDownloadStore()

  const [surahInput, setSurahInput] = useState<number>(1)
  const [reciterId, setReciterId] = useState<string>(defaultReciterId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    refreshStorageEstimate().catch(() => undefined)
  }, [refreshStorageEstimate])

  useEffect(() => {
    setReciterId(defaultReciterId)
  }, [defaultReciterId])

  const activeDownloads = useMemo(
    () => tasks.filter((task) => task.status === 'downloading').length,
    [tasks]
  )

  const handleDownload = async () => {
    if (surahInput < 1 || surahInput > 114) {
      setFeedback('Enter a surah number between 1 and 114.')
      return
    }

    try {
      setIsSubmitting(true)
      await enqueueSurahDownload(surahInput, reciterId)
      setFeedback(`Surah ${surahInput} queued for download.`)
    } catch (error: any) {
      setFeedback(error?.message || 'Unable to queue download.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = async (task: DownloadTask) => {
    removeTask(task.id)
    if (task.scope.type === 'surah') {
      try {
        await enqueueSurahDownload(task.scope.surahNumber, task.reciterId)
      } catch (error) {
        console.error('Failed to retry download', error)
      }
    }
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Offline Audio Downloads</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download surahs for offline recitation. Downloads are stored locally on your device.
          </p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Active: {activeDownloads}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="surah-number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Surah number
          </label>
          <input
            id="surah-number"
            type="number"
            min={1}
            max={114}
            value={surahInput}
            onChange={(event) => {
              const next = Number(event.target.value)
              setSurahInput(Number.isNaN(next) ? 1 : next)
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                       px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          />
        </div>

        <div>
          <label htmlFor="reciter-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Reciter
          </label>
          <select
            id="reciter-select"
            value={reciterId}
            onChange={(event) => setReciterId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                       px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          >
            {reciters.map((reciter) => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <motion.button
        onClick={handleDownload}
        disabled={isSubmitting}
        className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium
                   transition-colors disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation active:scale-95"
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
      >
        {isSubmitting ? 'Preparing…' : 'Download Surah'}
      </motion.button>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="text-sm text-emerald-600 dark:text-emerald-400"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {storageEstimate && storageEstimate.quota > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Storage used: {((storageEstimate.usage / storageEstimate.quota) * 100).toFixed(1)}% of {(storageEstimate.quota / (1024 * 1024 * 1024)).toFixed(2)} GB
        </div>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No downloads queued yet.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Surah {task.scope.type === 'surah' ? task.scope.surahNumber : task.scope.juzNumber} • {task.reciterName}
                  </p>
                  <p className={`text-xs ${statusColors[task.status]}`}>
                    {statusLabels[task.status]} {task.progress ? `• ${task.progress}%` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {task.status === 'downloading' || task.status === 'queued' ? (
                    <button
                      onClick={() => cancelTask(task.id)}
                      className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    >
                      Cancel
                    </button>
                  ) : task.status === 'failed' ? (
                    <button
                      onClick={() => handleRetry(task)}
                      className="text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      Retry
                    </button>
                  ) : null}

                  {task.status !== 'downloading' && (
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {task.error && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{task.error}</p>
              )}
            </div>
          ))
        )}
      </div>

      {tasks.some((task) => task.status === 'completed') && (
        <button
          onClick={clearCompleted}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Clear completed
        </button>
      )}
    </div>
  )
}

export default AudioDownloadManager

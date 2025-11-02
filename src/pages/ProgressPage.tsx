import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../stores/progressStore'
import { useAuthStore } from '../stores/authStore'
import { useUIText } from '../utils/uiText'
import { ActivityDay, WeeklyStats } from '../types/quran'

const ProgressPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    streak,
    totalXP,
    level,
    badges,
    dailyGoal,
    weeklyStats: cachedWeeklyStats,
    monthlyStats: cachedMonthlyStats,
    getTodaysStats,
    getLevelProgress,
    getStreakInfo,
    getWeeklyStats,
    getMonthlyStats,
    getLifetimeStats,
    getActivityHeatmap
  } = useProgressStore()
  const { user } = useAuthStore()
  const { text: t, isRTL } = useUIText()

  const weeklySummary = cachedWeeklyStats ?? getWeeklyStats()
  const monthlySummary = cachedMonthlyStats ?? getMonthlyStats()
  const lifetimeSummary = getLifetimeStats()

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week')
  const [selectedTab, setSelectedTab] = useState<'overview' | 'badges' | 'stats'>('overview')

  const activityHeatmap = useMemo(() => {
    const range = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90
    return getActivityHeatmap(range)
  }, [getActivityHeatmap, selectedPeriod])

  const todaysStats = getTodaysStats()
  const levelProgress = getLevelProgress()
  const streakInfo = getStreakInfo()

  const progressPercentage = (todaysStats.ayahsStudied / dailyGoal) * 100

  return (
    <div className="min-h-[100dvh] safe-area-pt safe-area-pb bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 pb-24">
      <div className={`mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl px-4 md:px-8 py-8 ${isRTL ? 'rtl-content' : 'ltr-content'}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
          >
            <span className="text-xl">←</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.yourProgress}
          </h1>
          
          <div className="w-10" /> {/* Spacer */}
        </motion.div>

        {/* User greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-lg text-gray-600 dark:text-gray-400">
            {user?.displayName || t.seekerOfKnowledge}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t.level} {level} • {totalXP} {t.totalXP}
          </p>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: t.overview, icon: '📊' },
            { id: 'badges', label: t.badges, icon: '🏆' },
            { id: 'stats', label: t.stats, icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-gold-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <OverviewTab
              key="overview"
              streak={streak}
              level={level}
              totalXP={totalXP}
              todaysStats={todaysStats}
              dailyGoal={dailyGoal}
              progressPercentage={progressPercentage}
              levelProgress={levelProgress}
              streakInfo={streakInfo}
            />
          )}
          
          {selectedTab === 'badges' && (
            <BadgesTab
              key="badges"
              badges={badges}
            />
          )}
          
          {selectedTab === 'stats' && (
            <StatsTab
              key="stats"
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              weeklyStats={weeklySummary}
              monthlyStats={monthlySummary}
              lifetimeStats={lifetimeSummary}
              activityHeatmap={activityHeatmap}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Overview tab component
const OverviewTab: React.FC<{
  streak: number
  level: number
  totalXP: number
  todaysStats: any
  dailyGoal: number
  progressPercentage: number
  levelProgress: any
  streakInfo: any
}> = ({ 
  streak, 
  level, 
  todaysStats,
  dailyGoal, 
  progressPercentage, 
  levelProgress, 
  streakInfo 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Main stats cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak */}
        <div className="card p-4 text-center">
          <motion.div
            className="text-3xl mb-2"
            animate={streak > 0 ? {
              scale: [1, 1.2, 1],
              rotate: [0, -5, 5, 0]
            } : {}}
            transition={{
              duration: 2,
              repeat: streak > 0 ? Infinity : 0,
              repeatDelay: 3
            }}
          >
            🔥
          </motion.div>
          <p className="text-2xl font-bold text-primary-700 dark:text-gold-400">
            {streak}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.dayStreak}</p>
          {streakInfo.isAtRisk && (
            <p className="text-xs text-orange-500 mt-1">
              ⚠️ {t.atRisk}
            </p>
          )}
        </div>

        {/* Level */}
        <div className="card p-4 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-2xl font-bold text-primary-700 dark:text-gold-400">
            {level}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.level}</p>
        </div>
      </div>

      {/* Level progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.levelProgress}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {levelProgress.currentXP} / {levelProgress.xpNeeded} {t.totalXP}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-gold-500 dark:to-gold-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{t.level} {level}</span>
          <span>{levelProgress.xpRemaining} {t.xpToNextLevel} {level + 1}</span>
        </div>
      </div>

      {/* Today's progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.todaysGoal}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {todaysStats.ayahsStudied} / {dailyGoal} {t.ayahsPerDay}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {progressPercentage >= 100 ? (
          <div className="text-center text-green-600 dark:text-green-400 font-medium">
            {t.alhamdulillahGoalComplete}
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">
            {dailyGoal - todaysStats.ayahsStudied} {t.moreAyahsToGoal}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <div className="text-xl mb-1">📚</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {todaysStats.lessonsCompleted}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.lessonsToday}</p>
        </div>

        <div className="card p-4 text-center">
          <div className="text-xl mb-1">⏱️</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {todaysStats.timeSpent} min
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.timeToday}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Badges tab component
const BadgesTab: React.FC<{
  badges: any[]
}> = ({ badges }) => {
  const { text: t } = useUIText()
  
  const badgeCategories = [
    { id: 'streak', name: t.streakBadges, icon: '🔥' },
    { id: 'learning', name: t.learningBadges, icon: '📚' },
    { id: 'achievement', name: t.achievementBadges, icon: '🏆' },
    { id: 'special', name: t.specialBadges, icon: '✨' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {badgeCategories.map((category) => {
        const categoryBadges = badges.filter(badge => badge.category === category.id)
        
        return (
          <div key={category.id} className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">{category.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({categoryBadges.length})
              </span>
            </div>

            {categoryBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {categoryBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>{t.noBadgesYet}</p>
                <p className="text-sm mt-1">{t.keepLearningUnlockBadges}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Upcoming badges */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🎯 {t.nextBadgeGoals}
        </h3>
        
        <div className="space-y-3">
          {[
            { name: '7-Day Streak', description: 'Study for 7 consecutive days', progress: 70 },
            { name: 'Night Owl', description: 'Study after 9 PM', progress: 30 },
            { name: 'Early Bird', description: 'Study before 7 AM', progress: 0 }
          ].map((goal, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{goal.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-700 dark:text-gold-400">
                  {goal.progress}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Stats tab component
const StatsTab: React.FC<{
  selectedPeriod: 'week' | 'month' | 'all'
  onPeriodChange: (period: 'week' | 'month' | 'all') => void
  weeklyStats: WeeklyStats
  monthlyStats: WeeklyStats
  lifetimeStats: WeeklyStats
  activityHeatmap: ActivityDay[]
}> = ({
  selectedPeriod,
  onPeriodChange,
  weeklyStats,
  monthlyStats,
  lifetimeStats,
  activityHeatmap
}) => {
  const { text: t } = useUIText()

  const periods = [
    { id: 'week' as const, label: t.thisWeek },
    { id: 'month' as const, label: t.thisMonth },
    { id: 'all' as const, label: t.allTime }
  ]

  const statsByPeriod: Record<'week' | 'month' | 'all', WeeklyStats> = {
    week: weeklyStats,
    month: monthlyStats,
    all: lifetimeStats
  }

  const currentStats = statsByPeriod[selectedPeriod]
  const summary = {
    ayahsStudied: currentStats?.totalAyahsStudied ?? 0,
    lessonsCompleted: currentStats?.totalLessonsCompleted ?? 0,
    timeSpent: currentStats?.totalTimeSpent ?? 0,
    xpEarned: currentStats?.totalXpEarned ?? 0
  }
  const hours = Math.floor(summary.timeSpent / 60)
  const minutes = summary.timeSpent % 60

  const trendBase = activityHeatmap.map((day, index) => ({
    index,
    date: day.date,
    value: day.ayahsStudied * 2 + day.timeSpent,
    ayahsStudied: day.ayahsStudied,
    timeSpent: day.timeSpent
  }))
  const bestDayEntry = trendBase.reduce<typeof trendBase[number] | null>((best, current) => {
    if (!best) return current
    return current.value > best.value ? current : best
  }, null)
  const trendData = trendBase.map(({ value, date }) => ({ value, date }))

  const getIntensityClass = (intensity: number) => {
    if (intensity >= 0.75) return 'bg-emerald-600 dark:bg-emerald-500'
    if (intensity >= 0.5) return 'bg-emerald-400 dark:bg-emerald-400/70'
    if (intensity > 0) return 'bg-emerald-200 dark:bg-emerald-300/50'
    return 'bg-gray-200 dark:bg-gray-700'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Period selector */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => onPeriodChange(period.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === period.id
                ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-gold-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <div className="text-xl mb-1">📖</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {summary.ayahsStudied}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.ayahsStudied}</p>
        </div>

        <div className="card p-4 text-center">
          <div className="text-xl mb-1">⏱️</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.timeSpent}</p>
        </div>

        <div className="card p-4 text-center">
          <div className="text-xl mb-1">🎯</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {summary.lessonsCompleted}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.lessonsDone}</p>
        </div>

        <div className="card p-4 text-center">
          <div className="text-xl mb-1">⭐</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {summary.xpEarned}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.xpEarned}</p>
        </div>
      </div>

      {/* Activity chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.dailyActivity}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentStats?.weekStart} → {currentStats?.weekEnd}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {activityHeatmap.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded ${getIntensityClass(day.intensity)}`}
              title={`${day.date} • ${day.ayahsStudied} ${t.ayahsStudied} • ${day.timeSpent} ${t.minutes}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{t.lessActivity}</span>
          <div className="flex space-x-1">
            {[0, 0.35, 0.6, 0.85].map((intensity, index) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded ${getIntensityClass(intensity + 0.001 * index)}`}
              />
            ))}
          </div>
          <span>{t.moreActivity}</span>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.bestDay}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {bestDayEntry
                ? `${new Date(bestDayEntry.date).toLocaleDateString()} • ${bestDayEntry.ayahsStudied} ${t.ayahsStudied}`
                : t.bestDaySubtitle}
            </p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              {t.daysActive}: {currentStats?.daysActive ?? 0}
            </p>
            <p>
              {t.averageSession}: {currentStats?.averageSessionLength ?? 0} {t.minutes}
            </p>
          </div>
        </div>
        <TrendSparkline data={trendData} />
      </div>

      {/* Achievements summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.recentAchievements}
        </h3>
        
        <div className="space-y-3">
          {[
            { text: 'Completed 5 consecutive days of study', date: t.daysAgo, icon: '🔥' },
            { text: 'Reached Level 3', date: t.weekAgo, icon: '⭐' },
            { text: 'First lesson completed', date: t.weeksAgo, icon: '🎯' }
          ].map((achievement, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-xl">{achievement.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {achievement.text}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {achievement.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ProgressPage

const TrendSparkline: React.FC<{ data: Array<{ value: number; date: string }> }> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="h-20 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        —
      </div>
    )
  }

  const height = 80
  const width = Math.max(140, data.length * 12)
  const maxValue = Math.max(...data.map((point) => point.value), 1)
  const points = data.map((point, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * (width - 8) + 4
    const y = height - (point.value / maxValue) * (height - 16) - 8
    return { x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ')
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? width},${height - 6} L ${points[0]?.x ?? 0},${height - 6} Z`

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-white/40 dark:from-emerald-900/20 dark:to-gray-900/40">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trendGradient)" />
        <path d={linePath} fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={2.6} fill="#10b981" />
        ))}
      </svg>
    </div>
  )
}

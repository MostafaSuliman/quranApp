import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { useProgressStore } from '../../../stores/progressStore'

const advanceTo = (isoDate: string) => {
  vi.setSystemTime(new Date(isoDate))
}

describe('useProgressStore analytics', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    advanceTo('2025-01-07T10:00:00Z')
    useProgressStore.getState().reset()
  })

  afterEach(() => {
    vi.useRealTimers()
    useProgressStore.getState().reset()
  })

  it('records study sessions and updates aggregate stats', () => {
    const store = useProgressStore.getState()

    store.recordStudySession(6, 30)
    store.addXP(120)

    const todays = store.getTodaysStats()
    expect(todays.ayahsStudied).toBe(6)
    expect(todays.timeSpent).toBe(30)
    expect(todays.xpEarned).toBe(120)

    const weekly = store.getWeeklyStats()
    expect(weekly.totalAyahsStudied).toBe(6)
    expect(weekly.totalTimeSpent).toBe(30)
    expect(weekly.totalXpEarned).toBe(120)
    expect(weekly.daysActive).toBe(1)

    const heatmap = store.getActivityHeatmap(7)
    expect(heatmap).toHaveLength(7)
    const latestDay = heatmap.at(-1)
    expect(latestDay?.ayahsStudied).toBe(6)
    expect(latestDay?.timeSpent).toBe(30)
    expect(latestDay?.intensity).toBeGreaterThan(0)
  })

  it('aggregates multi-day progress for weekly and monthly summaries', () => {
    const store = useProgressStore.getState()

    // Day 1
    advanceTo('2025-01-01T08:00:00Z')
    store.recordStudySession(4, 20)
    store.addReadingTime(10)
    store.addXP(50)

    // Day 2
    advanceTo('2025-01-02T09:00:00Z')
    store.recordStudySession(3, 15)
    store.completeLesson('lesson-001', 100)

    const weekly = store.getWeeklyStats()
    expect(weekly.totalAyahsStudied).toBe(7)
    expect(weekly.totalTimeSpent).toBe(45)
    expect(weekly.totalLessonsCompleted).toBe(1)
    expect(weekly.totalXpEarned).toBe(150)
    expect(weekly.daysActive).toBe(2)

    const monthly = store.getMonthlyStats()
    expect(monthly.totalAyahsStudied).toBe(7)
    expect(monthly.totalTimeSpent).toBe(45)

    const lifetime = store.getLifetimeStats()
    expect(lifetime.totalXpEarned).toBe(150)
    expect(lifetime.weekStart).toBe('2025-01-01')
  })

  it('resets analytics history when progress is cleared', () => {
    const store = useProgressStore.getState()
    store.recordStudySession(5, 25)

    store.resetProgress()
    const weekly = store.getWeeklyStats()
    expect(weekly.totalAyahsStudied).toBe(0)
    expect(store.getActivityHeatmap(7).every(day => day.ayahsStudied === 0)).toBe(true)
  })
})

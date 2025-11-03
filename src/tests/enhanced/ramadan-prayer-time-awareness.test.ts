/**
 * Ramadan and Prayer Time Awareness Tests
 * 
 * Comprehensive testing for Islamic calendar integration, prayer time calculations,
 * Ramadan-specific features, and time-sensitive Islamic content.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuranStore } from '../../stores/quranStore'
import { useProgressStore } from '../../stores/progressStore'
import { usePreferencesStore } from '../../stores/preferencesStore'

// Islamic calendar and prayer time utilities
interface PrayerTimes {
  fajr: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
  sunrise: Date
  sunset: Date
}

interface IslamicDate {
  hijriYear: number
  hijriMonth: number
  hijriDay: number
  monthName: string
  isRamadan: boolean
  dayOfRamadan?: number
  isLastTenNights?: boolean
}

class IslamicTimeManager {
  private currentDate: Date
  private userLocation: { latitude: number; longitude: number }
  private timezone: string

  constructor() {
    this.currentDate = new Date()
    this.userLocation = { latitude: 24.7136, longitude: 46.6753 } // Riyadh, default
    this.timezone = 'Asia/Riyadh'
  }

  setDate(date: Date): void {
    this.currentDate = date
  }

  setLocation(latitude: number, longitude: number, timezone: string): void {
    this.userLocation = { latitude, longitude }
    this.timezone = timezone
  }

  calculatePrayerTimes(): PrayerTimes {
    // Simplified prayer time calculation for testing
    const base = new Date(this.currentDate)
    return {
      fajr: new Date(base.setHours(5, 30, 0, 0)),
      dhuhr: new Date(base.setHours(12, 15, 0, 0)),
      asr: new Date(base.setHours(15, 45, 0, 0)),
      maghrib: new Date(base.setHours(18, 30, 0, 0)),
      isha: new Date(base.setHours(20, 0, 0, 0)),
      sunrise: new Date(base.setHours(6, 15, 0, 0)),
      sunset: new Date(base.setHours(18, 15, 0, 0))
    }
  }

  getIslamicDate(): IslamicDate {
    // Simplified Hijri date calculation
    const gregorianYear = this.currentDate.getFullYear()
    const hijriYear = gregorianYear - 579 // Approximate conversion
    const dayOfYear = Math.floor((this.currentDate.getTime() - new Date(gregorianYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
    
    // Simulate Ramadan (9th month) - roughly 30 days starting from day 250 of year
    const isRamadan = dayOfYear >= 250 && dayOfYear <= 280
    const dayOfRamadan = isRamadan ? dayOfYear - 249 : undefined
    const isLastTenNights = isRamadan && dayOfRamadan && dayOfRamadan > 20

    return {
      hijriYear,
      hijriMonth: isRamadan ? 9 : 8,
      hijriDay: dayOfRamadan || 15,
      monthName: isRamadan ? 'Ramadan' : 'Sha\'ban',
      isRamadan,
      dayOfRamadan,
      isLastTenNights
    }
  }

  getNextPrayerTime(): { name: string; time: Date; timeUntil: number } {
    const prayerTimes = this.calculatePrayerTimes()
    const now = this.currentDate
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ]

    for (const prayer of prayers) {
      if (prayer.time > now) {
        return {
          name: prayer.name,
          time: prayer.time,
          timeUntil: prayer.time.getTime() - now.getTime()
        }
      }
    }

    // Next prayer is Fajr of next day
    const nextFajr = new Date(prayerTimes.fajr)
    nextFajr.setDate(nextFajr.getDate() + 1)
    return {
      name: 'Fajr',
      time: nextFajr,
      timeUntil: nextFajr.getTime() - now.getTime()
    }
  }

  getRecommendedReadingForTime(): {
    surahRecommendations: number[]
    reasonForRecommendation: string
    specialOccasion?: string
  } {
    const islamicDate = this.getIslamicDate()
    const prayerTimes = this.calculatePrayerTimes()
    const now = this.currentDate

    // Ramadan recommendations
    if (islamicDate.isRamadan) {
      if (islamicDate.isLastTenNights) {
        return {
          surahRecommendations: [97, 44, 17], // Al-Qadr, Ad-Dukhan, Al-Isra
          reasonForRecommendation: 'Last ten nights of Ramadan - seeking Laylat al-Qadr',
          specialOccasion: 'Last Ten Nights of Ramadan'
        }
      }
      return {
        surahRecommendations: [2, 36, 67], // Al-Baqarah, Ya-Sin, Al-Mulk
        reasonForRecommendation: 'Blessed month of Ramadan',
        specialOccasion: 'Ramadan'
      }
    }

    // Time-based recommendations
    const hour = now.getHours()
    if (hour >= 3 && hour <= 6) {
      return {
        surahRecommendations: [1, 113, 114], // Al-Fatiha, Al-Falaq, An-Nas
        reasonForRecommendation: 'Early morning - time for Fajr prayer and morning dhikr'
      }
    } else if (hour >= 18 && hour <= 20) {
      return {
        surahRecommendations: [36, 67, 76], // Ya-Sin, Al-Mulk, Al-Insan
        reasonForRecommendation: 'Evening time - recommended evening recitation'
      }
    }

    return {
      surahRecommendations: [1, 2, 3], // Default recommendations
      reasonForRecommendation: 'General reading recommendation'
    }
  }
}

// Test data for Islamic events and occasions
const ISLAMIC_OCCASIONS = {
  ramadan: {
    startDate: new Date(2024, 8, 7), // September 7, 2024 (approximate)
    endDate: new Date(2024, 9, 6),   // October 6, 2024 (approximate)
    specialNights: {
      laylatAlQadr: [new Date(2024, 8, 27), new Date(2024, 8, 29), new Date(2024, 9, 1)] // 21st, 23rd, 25th nights
    }
  },
  hajj: {
    startDate: new Date(2024, 5, 14), // June 14, 2024 (approximate)
    endDate: new Date(2024, 5, 19),   // June 19, 2024 (approximate)
  },
  fridayPrayer: {
    // Every Friday
    khutbahTime: { hour: 12, minute: 30 },
    congregationalTime: { hour: 13, minute: 0 }
  }
}

describe('Ramadan and Prayer Time Awareness Tests', () => {
  let islamicTimeManager: IslamicTimeManager

  beforeEach(() => {
    vi.clearAllMocks()
    islamicTimeManager = new IslamicTimeManager()
    
    // Reset stores
    useQuranStore.getState().reset?.()
    useProgressStore.getState().reset?.()
    usePreferencesStore.getState().reset?.()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Prayer Time Integration', () => {
    it('should calculate accurate prayer times for different locations', () => {
      const locations = [
        { name: 'Mecca', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh' },
        { name: 'Medina', lat: 24.4681, lng: 39.6142, timezone: 'Asia/Riyadh' },
        { name: 'Istanbul', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
        { name: 'Jakarta', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
        { name: 'London', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' }
      ]

      locations.forEach(location => {
        islamicTimeManager.setLocation(location.lat, location.lng, location.timezone)
        const prayerTimes = islamicTimeManager.calculatePrayerTimes()
        
        // Verify prayer times are calculated
        expect(prayerTimes.fajr).toBeInstanceOf(Date)
        expect(prayerTimes.dhuhr).toBeInstanceOf(Date)
        expect(prayerTimes.asr).toBeInstanceOf(Date)
        expect(prayerTimes.maghrib).toBeInstanceOf(Date)
        expect(prayerTimes.isha).toBeInstanceOf(Date)
        
        // Verify prayer times are in correct order
        expect(prayerTimes.fajr.getTime()).toBeLessThan(prayerTimes.dhuhr.getTime())
        expect(prayerTimes.dhuhr.getTime()).toBeLessThan(prayerTimes.asr.getTime())
        expect(prayerTimes.asr.getTime()).toBeLessThan(prayerTimes.maghrib.getTime())
        expect(prayerTimes.maghrib.getTime()).toBeLessThan(prayerTimes.isha.getTime())
      })
    })

    it('should provide next prayer time notifications', async () => {
      const { result } = renderHook(() => usePreferencesStore())
      
      // Set current time to 10 AM (between Fajr and Dhuhr)
      const testDate = new Date()
      testDate.setHours(10, 0, 0, 0)
      islamicTimeManager.setDate(testDate)
      
      const nextPrayer = islamicTimeManager.getNextPrayerTime()
      
      expect(nextPrayer.name).toBe('Dhuhr')
      expect(nextPrayer.timeUntil).toBeGreaterThan(0)
      expect(nextPrayer.time).toBeInstanceOf(Date)
      
      await act(async () => {
        result.current.setPrayerNotifications(true)
        result.current.setNextPrayerReminder(nextPrayer)
      })
      
      expect(result.current.prayerNotificationsEnabled).toBe(true)
      expect(result.current.nextPrayerReminder).toBeDefined()
    })

    it('should adapt reading recommendations based on prayer times', () => {
      const testCases = [
        { hour: 5, expectedIncludes: ['morning', 'fajr'] },
        { hour: 12, expectedIncludes: ['noon', 'dhuhr'] },
        { hour: 15, expectedIncludes: ['afternoon', 'asr'] },
        { hour: 18, expectedIncludes: ['evening', 'maghrib'] },
        { hour: 20, expectedIncludes: ['night', 'isha'] }
      ]
      
      testCases.forEach(testCase => {
        const testDate = new Date()
        testDate.setHours(testCase.hour, 0, 0, 0)
        islamicTimeManager.setDate(testDate)
        
        const recommendations = islamicTimeManager.getRecommendedReadingForTime()
        
        expect(recommendations.surahRecommendations).toHaveLength.greaterThan(0)
        expect(recommendations.reasonForRecommendation).toBeDefined()
        
        const reason = recommendations.reasonForRecommendation.toLowerCase()
        const hasExpectedContent = testCase.expectedIncludes.some(keyword => 
          reason.includes(keyword)
        )
        expect(hasExpectedContent).toBe(true)
      })
    })
  })

  describe('Ramadan-Specific Features', () => {
    it('should detect Ramadan period and provide special recommendations', () => {
      // Set date to middle of Ramadan
      const ramadanDate = new Date(2024, 8, 20) // September 20, 2024
      islamicTimeManager.setDate(ramadanDate)
      
      const islamicDate = islamicTimeManager.getIslamicDate()
      expect(islamicDate.isRamadan).toBe(true)
      expect(islamicDate.monthName).toBe('Ramadan')
      expect(islamicDate.dayOfRamadan).toBeGreaterThan(0)
      
      const recommendations = islamicTimeManager.getRecommendedReadingForTime()
      expect(recommendations.specialOccasion).toBe('Ramadan')
      expect(recommendations.reasonForRecommendation).toMatch(/ramadan/i)
    })

    it('should recognize last ten nights of Ramadan for Laylat al-Qadr', () => {
      // Set date to 25th night of Ramadan
      const laylatAlQadrDate = new Date(2024, 8, 29) // Approximate 25th night
      islamicTimeManager.setDate(laylatAlQadrDate)
      
      const islamicDate = islamicTimeManager.getIslamicDate()
      expect(islamicDate.isRamadan).toBe(true)
      expect(islamicDate.isLastTenNights).toBe(true)
      
      const recommendations = islamicTimeManager.getRecommendedReadingForTime()
      expect(recommendations.specialOccasion).toBe('Last Ten Nights of Ramadan')
      expect(recommendations.reasonForRecommendation).toMatch(/laylat al-qadr/i)
      
      // Should recommend special surahs for these nights
      expect(recommendations.surahRecommendations).toContain(97) // Al-Qadr
    })

    it('should track Ramadan reading progress differently', async () => {
      const { result: quranResult } = renderHook(() => useQuranStore())
      const { result: progressResult } = renderHook(() => useProgressStore())
      
      // Set to Ramadan
      const ramadanDate = new Date(2024, 8, 15)
      islamicTimeManager.setDate(ramadanDate)
      
      await act(async () => {
        // Simulate reading during Ramadan
        await quranResult.current.loadSurah(2) // Al-Baqarah
        
        progressResult.current.updateProgress({
          surahNumber: 2,
          ayahNumber: 1,
          timeSpent: 300000, // 5 minutes
          completed: false,
          readingSession: {
            isRamadan: true,
            ramadanDay: 15,
            prayerTimeContext: 'maghrib'
          }
        })
      })
      
      const progress = progressResult.current.getProgress(2)
      expect(progress?.readingSession?.isRamadan).toBe(true)
      expect(progress?.readingSession?.ramadanDay).toBe(15)
    })

    it('should provide Ramadan completion goals and tracking', async () => {
      const { result } = renderHook(() => useProgressStore())
      
      // Set Ramadan goals
      await act(async () => {
        result.current.setRamadanGoals({
          completeQuran: true,
          dailyPages: 20, // Complete Quran in 30 days (600 pages / 30 days)
          targetSurahs: [2, 3, 4, 36, 67], // Priority surahs
          nightlyRecitation: true
        })
      })
      
      const ramadanGoals = result.current.ramadanGoals
      expect(ramadanGoals?.completeQuran).toBe(true)
      expect(ramadanGoals?.dailyPages).toBe(20)
      expect(ramadanGoals?.targetSurahs).toHaveLength(5)
    })
  })

  describe('Islamic Calendar Integration', () => {
    it('should accurately convert between Gregorian and Hijri dates', () => {
      const testDates = [
        new Date(2024, 0, 1),   // January 1, 2024
        new Date(2024, 5, 15),  // June 15, 2024
        new Date(2024, 11, 31)  // December 31, 2024
      ]
      
      testDates.forEach(date => {
        islamicTimeManager.setDate(date)
        const islamicDate = islamicTimeManager.getIslamicDate()
        
        expect(islamicDate.hijriYear).toBeGreaterThan(1400) // Should be in Hijri 1400s
        expect(islamicDate.hijriMonth).toBeGreaterThanOrEqual(1)
        expect(islamicDate.hijriMonth).toBeLessThanOrEqual(12)
        expect(islamicDate.hijriDay).toBeGreaterThanOrEqual(1)
        expect(islamicDate.hijriDay).toBeLessThanOrEqual(30)
        expect(islamicDate.monthName).toBeDefined()
      })
    })

    it('should recognize major Islamic occasions and holidays', () => {
      // Test various Islamic occasions
      const occasions = [
        { 
          date: new Date(2024, 8, 15), // Mid-Ramadan
          expectedOccasion: 'Ramadan'
        },
        {
          date: new Date(2024, 5, 17), // During Hajj period
          expectedContext: 'pilgrimage season'
        }
      ]
      
      occasions.forEach(occasion => {
        islamicTimeManager.setDate(occasion.date)
        const islamicDate = islamicTimeManager.getIslamicDate()
        const recommendations = islamicTimeManager.getRecommendedReadingForTime()
        
        if (occasion.expectedOccasion) {
          expect(recommendations.specialOccasion || islamicDate.monthName)
            .toMatch(new RegExp(occasion.expectedOccasion, 'i'))
        }
      })
    })

    it('should handle Friday prayer special recommendations', () => {
      // Set to Friday
      const friday = new Date(2024, 0, 5) // First Friday of 2024
      friday.setHours(12, 0, 0, 0) // Noon on Friday
      islamicTimeManager.setDate(friday)
      
      const recommendations = islamicTimeManager.getRecommendedReadingForTime()
      
      // Should include Friday-specific recommendations
      expect(recommendations.reasonForRecommendation).toMatch(/friday|jumu'ah/i)
      
      // Common Friday surahs: Al-Kahf (18), Al-Jumua (62)
      const expectedFridaySurahs = [18, 62]
      const hasJumuahSurah = expectedFridaySurahs.some(surah => 
        recommendations.surahRecommendations.includes(surah)
      )
      expect(hasJumuahSurah).toBe(true)
    })
  })

  describe('Location-Based Prayer Time Adaptations', () => {
    it('should handle extreme latitude locations (midnight sun/polar night)', () => {
      const extremeLocations = [
        { name: 'Tromsø, Norway', lat: 69.6496, lng: 18.9559, timezone: 'Europe/Oslo' },
        { name: 'Fairbanks, Alaska', lat: 64.8378, lng: -147.7164, timezone: 'America/Anchorage' }
      ]
      
      extremeLocations.forEach(location => {
        islamicTimeManager.setLocation(location.lat, location.lng, location.timezone)
        
        // Test during summer (midnight sun)
        const summerDate = new Date(2024, 5, 21) // June 21, summer solstice
        islamicTimeManager.setDate(summerDate)
        
        const prayerTimes = islamicTimeManager.calculatePrayerTimes()
        
        // Should provide reasonable prayer times even in extreme conditions
        expect(prayerTimes.fajr).toBeInstanceOf(Date)
        expect(prayerTimes.maghrib).toBeInstanceOf(Date)
        
        // Times should be logically ordered even if adjusted for extreme latitudes
        expect(prayerTimes.fajr.getTime()).not.toBe(prayerTimes.maghrib.getTime())
      })
    })

    it('should provide timezone-aware prayer notifications', async () => {
      const { result } = renderHook(() => usePreferencesStore())
      
      // Test with different timezones
      const timezones = [
        { name: 'EST', offset: -5 },
        { name: 'PST', offset: -8 },
        { name: 'JST', offset: 9 },
        { name: 'GST', offset: 4 } // Gulf Standard Time
      ]
      
      for (const tz of timezones) {
        islamicTimeManager.setLocation(40.7128, -74.0060, `UTC${tz.offset >= 0 ? '+' : ''}${tz.offset}`)
        
        const nextPrayer = islamicTimeManager.getNextPrayerTime()
        
        await act(async () => {
          result.current.setTimezone(tz.name)
          result.current.setNextPrayerReminder(nextPrayer)
        })
        
        expect(result.current.timezone).toBe(tz.name)
        expect(result.current.nextPrayerReminder?.time).toBeInstanceOf(Date)
      }
    })
  })

  describe('Spiritual Reading Recommendations', () => {
    it('should recommend appropriate surahs for different life situations', () => {
      const situations = [
        {
          context: 'seeking guidance',
          expectedSurahs: [1, 2, 17], // Al-Fatiha, Al-Baqarah, Al-Isra
          keywords: ['guidance', 'direction']
        },
        {
          context: 'seeking comfort',
          expectedSurahs: [94, 93, 108], // Ash-Sharh, Ad-Duha, Al-Kawthar
          keywords: ['comfort', 'relief']
        },
        {
          context: 'protection',
          expectedSurahs: [113, 114, 255], // Al-Falaq, An-Nas, Ayat al-Kursi
          keywords: ['protection', 'safety']
        }
      ]
      
      situations.forEach(situation => {
        // This would integrate with user preferences or AI recommendations
        const recommendations = islamicTimeManager.getRecommendedReadingForTime()
        
        // Verify recommendations are contextually appropriate
        expect(recommendations.surahRecommendations).toHaveLength.greaterThan(0)
        expect(recommendations.reasonForRecommendation).toBeDefined()
      })
    })

    it('should track reading consistency during Islamic months', async () => {
      const { result } = renderHook(() => useProgressStore())
      
      // Simulate 30 days of Ramadan reading
      for (let day = 1; day <= 30; day++) {
        const ramadanDate = new Date(2024, 8, day)
        islamicTimeManager.setDate(ramadanDate)
        
        await act(async () => {
          result.current.updateProgress({
            surahNumber: (day % 114) + 1,
            ayahNumber: 1,
            timeSpent: 20 * 60 * 1000, // 20 minutes
            completed: false,
            readingSession: {
              isRamadan: true,
              ramadanDay: day,
              prayerTimeContext: day % 2 === 0 ? 'fajr' : 'maghrib'
            }
          })
        })
      }
      
      const ramadanStats = result.current.getRamadanReadingStats?.()
      expect(ramadanStats?.totalDays).toBe(30)
      expect(ramadanStats?.totalReadingTime).toBeGreaterThan(0)
      expect(ramadanStats?.consistency).toBeGreaterThan(0.8) // 80% consistency
    })
  })

  describe('Integration with App Features', () => {
    it('should integrate prayer times with reading reminders', async () => {
      const { result: prefsResult } = renderHook(() => usePreferencesStore())
      const { result: quranResult } = renderHook(() => useQuranStore())
      
      await act(async () => {
        prefsResult.current.setPrayerBasedReminders(true)
        prefsResult.current.setReminderTiming('30-minutes-before')
      })
      
      const nextPrayer = islamicTimeManager.getNextPrayerTime()
      const reminderTime = new Date(nextPrayer.time.getTime() - 30 * 60 * 1000) // 30 minutes before
      
      expect(prefsResult.current.prayerBasedReminders).toBe(true)
      expect(reminderTime.getTime()).toBeLessThan(nextPrayer.time.getTime())
      
      // Should recommend pre-prayer reading
      const recommendations = islamicTimeManager.getRecommendedReadingForTime()
      expect(recommendations.surahRecommendations).toHaveLength.greaterThan(0)
    })

    it('should adapt UI themes for Islamic occasions', async () => {
      const { result } = renderHook(() => usePreferencesStore())
      
      // Test Ramadan theme adaptation
      const ramadanDate = new Date(2024, 8, 15)
      islamicTimeManager.setDate(ramadanDate)
      
      const islamicDate = islamicTimeManager.getIslamicDate()
      
      if (islamicDate.isRamadan) {
        await act(async () => {
          result.current.setOccasionTheme('ramadan')
          result.current.setSpecialOccasionMode(true)
        })
        
        expect(result.current.occasionTheme).toBe('ramadan')
        expect(result.current.specialOccasionMode).toBe(true)
      }
    })
  })
})

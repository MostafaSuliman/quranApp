import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import { IslamicHelpers } from '../helpers/islamic-helpers';

/**
 * E2E tests for Islamic features
 * Tests prayer times, Ramadan mode, Qibla direction, and other Islamic utilities
 */

test.describe('Islamic Features', () => {
  let testHelpers: TestHelpers;
  let islamicHelpers: IslamicHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    islamicHelpers = new IslamicHelpers(page);
    
    await testHelpers.createUserSession({ 
      completedOnboarding: true,
      language: 'en',
      theme: 'light'
    });
    
    await page.goto('/');
    await testHelpers.waitForAppLoad();
  });

  test('should display and calculate prayer times', async ({ page }) => {
    // Navigate to prayer times (might be on home page or dedicated section)
    const prayerTimesSection = page.locator('[data-testid="prayer-times-section"]');
    
    if (!(await prayerTimesSection.isVisible())) {
      // Try to find prayer times button/link
      const prayerTimesButton = page.locator('[data-testid="prayer-times-button"]');
      if (await prayerTimesButton.isVisible()) {
        await prayerTimesButton.click();
      } else {
        // Prayer times might be in settings or home page
        await testHelpers.navigateTo('home');
      }
    }
    
    // Test prayer times calculation with default location
    await islamicHelpers.testPrayerTimes();
    
    // Verify all 5 daily prayers are shown
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    for (const prayer of prayers) {
      const prayerElement = page.locator(`[data-testid="prayer-${prayer}"]`);
      await expect(prayerElement).toBeVisible();
      
      // Verify prayer time format
      const timeText = await prayerElement.textContent();
      expect(timeText).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)?/i);
    }
    
    // Test next prayer indicator
    const nextPrayer = page.locator('[data-testid="next-prayer"]');
    if (await nextPrayer.isVisible()) {
      const nextPrayerText = await nextPrayer.textContent();
      expect(prayers.some(prayer => nextPrayerText?.toLowerCase().includes(prayer))).toBe(true);
    }
  });

  test('should support different prayer time calculation methods', async ({ page }) => {
    // Navigate to prayer time settings
    await testHelpers.navigateTo('settings');
    await page.click('[data-testid="prayer-settings"]');
    
    // Test different calculation methods
    const calculationMethods = [
      'isna', 'mwl', 'egypt', 'makkah', 'karachi', 'tehran'
    ];
    
    const methodSelector = page.locator('[data-testid="calculation-method"]');
    await expect(methodSelector).toBeVisible();
    
    for (const method of calculationMethods) {
      const methodOption = page.locator(`[data-testid="method-${method}"]`);
      if (await methodOption.isVisible()) {
        await methodSelector.click();
        await methodOption.click();
        
        // Verify method is selected
        const selectedMethod = page.locator('[data-testid="selected-method"]');
        await expect(selectedMethod).toContainText(method.toUpperCase());
        break; // Test one method to avoid too many iterations
      }
    }
    
    // Test custom adjustments
    const adjustments = page.locator('[data-testid="prayer-adjustments"]');
    if (await adjustments.isVisible()) {
      await adjustments.click();
      
      // Test Fajr adjustment
      const fajrAdjustment = page.locator('[data-testid="fajr-adjustment"]');
      if (await fajrAdjustment.isVisible()) {
        await fajrAdjustment.fill('5'); // +5 minutes
      }
      
      // Test Maghrib adjustment
      const maghribAdjustment = page.locator('[data-testid="maghrib-adjustment"]');
      if (await maghribAdjustment.isVisible()) {
        await maghribAdjustment.fill('-2'); // -2 minutes
      }
      
      // Save adjustments
      await page.click('[data-testid="save-adjustments"]');
      
      // Verify adjustments saved
      const adjustmentsSaved = page.locator('[data-testid="adjustments-saved"]');
      await expect(adjustmentsSaved).toBeVisible();
    }
  });

  test('should display Qibla direction', async ({ page }) => {
    await islamicHelpers.testQiblaDirection();
    
    // Test compass accuracy indicator
    const accuracyIndicator = page.locator('[data-testid="compass-accuracy"]');
    if (await accuracyIndicator.isVisible()) {
      const accuracyText = await accuracyIndicator.textContent();
      expect(accuracyText).toMatch(/\d+/); // Should show some accuracy value
    }
    
    // Test compass calibration
    const calibrateButton = page.locator('[data-testid="calibrate-compass"]');
    if (await calibrateButton.isVisible()) {
      await calibrateButton.click();
      
      // Verify calibration interface
      const calibrationInterface = page.locator('[data-testid="calibration-interface"]');
      await expect(calibrationInterface).toBeVisible();
      
      // Complete calibration (simplified)
      const calibrationComplete = page.locator('[data-testid="calibration-complete"]');
      if (await calibrationComplete.isVisible()) {
        await calibrationComplete.click();
      }
    }
  });

  test('should display and manage Hijri calendar', async ({ page }) => {
    await islamicHelpers.testHijriCalendar();
    
    // Test Hijri date conversion
    const dateConverter = page.locator('[data-testid="date-converter"]');
    if (await dateConverter.isVisible()) {
      await dateConverter.click();
      
      // Test Gregorian to Hijri conversion
      const gregorianInput = page.locator('[data-testid="gregorian-date-input"]');
      if (await gregorianInput.isVisible()) {
        await gregorianInput.fill('2024-01-01');
        
        // Should show Hijri equivalent
        const hijriOutput = page.locator('[data-testid="hijri-date-output"]');
        await expect(hijriOutput).toBeVisible();
        
        const hijriText = await hijriOutput.textContent();
        expect(hijriText).toMatch(/\d{4}/); // Should contain Hijri year
      }
    }
    
    // Test Islamic events calendar
    const islamicEvents = page.locator('[data-testid="islamic-events"]');
    if (await islamicEvents.isVisible()) {
      await islamicEvents.click();
      
      // Should show upcoming Islamic events
      const eventsList = page.locator('[data-testid="events-list"]');
      await expect(eventsList).toBeVisible();
      
      // Verify at least some events are shown
      const events = page.locator('[data-testid*="event-"]');
      expect(await events.count()).toBeGreaterThan(0);
    }
  });

  test('should support Ramadan mode and features', async ({ page }) => {
    await islamicHelpers.testRamadanMode();
    
    // Test fasting tracker
    const fastingTracker = page.locator('[data-testid="fasting-tracker"]');
    if (await fastingTracker.isVisible()) {
      // Mark today as fasting
      const markFasting = page.locator('[data-testid="mark-fasting-today"]');
      if (await markFasting.isVisible()) {
        await markFasting.click();
        
        // Verify fasting is marked
        const fastingStatus = page.locator('[data-testid="fasting-status-today"]');
        await expect(fastingStatus).toHaveClass(/fasting|completed/);
      }
      
      // Test breaking fast
      const breakFast = page.locator('[data-testid="break-fast"]');
      if (await breakFast.isVisible()) {
        await breakFast.click();
        
        // Should show Iftar time confirmation
        const iftarConfirmation = page.locator('[data-testid="iftar-confirmation"]');
        await expect(iftarConfirmation).toBeVisible();
      }
    }
    
    // Test Ramadan progress
    const ramadanProgress = page.locator('[data-testid="ramadan-progress"]');
    if (await ramadanProgress.isVisible()) {
      // Should show days completed/remaining
      const progressText = await ramadanProgress.textContent();
      expect(progressText).toMatch(/\d+/); // Should contain numbers
    }
    
    // Test special Ramadan Quran reading plan
    const ramadanPlan = page.locator('[data-testid="ramadan-reading-plan"]');
    if (await ramadanPlan.isVisible()) {
      await ramadanPlan.click();
      
      // Should show daily reading portion
      const dailyPortion = page.locator('[data-testid="daily-reading-portion"]');
      await expect(dailyPortion).toBeVisible();
    }
  });

  test('should provide Islamic supplications (Duas)', async ({ page }) => {
    // Navigate to Duas section
    const duasSection = page.locator('[data-testid="duas-section"]');
    
    if (!(await duasSection.isVisible())) {
      // Try to find Duas button/link
      const duasButton = page.locator('[data-testid="duas-button"]');
      if (await duasButton.isVisible()) {
        await duasButton.click();
      }
    }
    
    if (await duasSection.isVisible()) {
      // Test Dua categories
      const duaCategories = [
        'morning', 'evening', 'food', 'travel', 'protection'
      ];
      
      for (const category of duaCategories) {
        const categoryButton = page.locator(`[data-testid="dua-category-${category}"]`);
        if (await categoryButton.isVisible()) {
          await categoryButton.click();
          
          // Verify Duas in this category
          const duasList = page.locator('[data-testid="duas-list"]');
          await expect(duasList).toBeVisible();
          
          // Check first Dua
          const firstDua = page.locator('[data-testid="dua-0"]');
          if (await firstDua.isVisible()) {
            await firstDua.click();
            
            // Should show Arabic text and translation
            const arabicText = page.locator('[data-testid="dua-arabic"]');
            const translation = page.locator('[data-testid="dua-translation"]');
            
            await expect(arabicText).toBeVisible();
            await expect(translation).toBeVisible();
            
            // Verify Arabic text rendering
            await islamicHelpers.verifyArabicTextRendering('[data-testid="dua-arabic"]');
          }
          break; // Test one category to avoid too many iterations
        }
      }
      
      // Test Dua favorites
      const favoriteDua = page.locator('[data-testid="favorite-dua"]');
      if (await favoriteDua.isVisible()) {
        await favoriteDua.click();
        
        // Should be added to favorites
        const favoritesIcon = page.locator('[data-testid="favorites-icon"]');
        await expect(favoritesIcon).toHaveClass(/active|favorited/);
      }
    }
  });

  test('should provide 99 Names of Allah (Asma ul Husna)', async ({ page }) => {
    const asmaUlHusna = page.locator('[data-testid="asma-ul-husna"]');
    
    if (!(await asmaUlHusna.isVisible())) {
      const asmaButton = page.locator('[data-testid="asma-ul-husna-button"]');
      if (await asmaButton.isVisible()) {
        await asmaButton.click();
      }
    }
    
    if (await asmaUlHusna.isVisible()) {
      // Should display all 99 names
      const namesList = page.locator('[data-testid="names-list"]');
      await expect(namesList).toBeVisible();
      
      const namesCount = await page.locator('[data-testid*="name-"]').count();
      expect(namesCount).toBe(99);
      
      // Test a specific name
      const arRahman = page.locator('[data-testid="name-1"]'); // Ar-Rahman
      if (await arRahman.isVisible()) {
        await arRahman.click();
        
        // Should show details
        const nameDetails = page.locator('[data-testid="name-details"]');
        await expect(nameDetails).toBeVisible();
        
        // Should show Arabic name, transliteration, and meaning
        await expect(page.locator('[data-testid="name-arabic"]')).toBeVisible();
        await expect(page.locator('[data-testid="name-transliteration"]')).toBeVisible();
        await expect(page.locator('[data-testid="name-meaning"]')).toBeVisible();
        
        // Verify Arabic text
        await islamicHelpers.verifyArabicTextRendering('[data-testid="name-arabic"]');
      }
      
      // Test audio recitation of names
      const playNameAudio = page.locator('[data-testid="play-name-audio"]');
      if (await playNameAudio.isVisible()) {
        await playNameAudio.click();
        
        // Should start audio playback
        await testHelpers.waitForAudioReady();
      }
    }
  });

  test('should support Tasbih (Digital Counter)', async ({ page }) => {
    const tasbihCounter = page.locator('[data-testid="tasbih-counter"]');
    
    if (!(await tasbihCounter.isVisible())) {
      const tasbihButton = page.locator('[data-testid="tasbih-button"]');
      if (await tasbihButton.isVisible()) {
        await tasbihButton.click();
      }
    }
    
    if (await tasbihCounter.isVisible()) {
      // Test counter functionality
      const counter = page.locator('[data-testid="counter-display"]');
      await expect(counter).toContainText('0');
      
      // Click to increment
      const incrementButton = page.locator('[data-testid="increment-counter"]');
      await incrementButton.click();
      await incrementButton.click();
      await incrementButton.click();
      
      // Should show count
      await expect(counter).toContainText('3');
      
      // Test preset counts (33, 99, etc.)
      const preset33 = page.locator('[data-testid="preset-33"]');
      if (await preset33.isVisible()) {
        await preset33.click();
        
        // Should set target to 33
        const targetDisplay = page.locator('[data-testid="target-count"]');
        await expect(targetDisplay).toContainText('33');
      }
      
      // Test reset
      const resetButton = page.locator('[data-testid="reset-counter"]');
      await resetButton.click();
      
      await expect(counter).toContainText('0');
      
      // Test different Tasbih phrases
      const tasbihPhrase = page.locator('[data-testid="tasbih-phrase"]');
      if (await tasbihPhrase.isVisible()) {
        await tasbihPhrase.click();
        
        // Should show phrase options
        const phraseOptions = page.locator('[data-testid="phrase-options"]');
        await expect(phraseOptions).toBeVisible();
        
        // Select SubhanAllah
        const subhanAllah = page.locator('[data-testid="phrase-subhanallah"]');
        if (await subhanAllah.isVisible()) {
          await subhanAllah.click();
          
          // Should display the phrase
          const currentPhrase = page.locator('[data-testid="current-phrase"]');
          await expect(currentPhrase).toBeVisible();
          await islamicHelpers.verifyArabicTextRendering('[data-testid="current-phrase"]');
        }
      }
    }
  });

  test('should provide Islamic content validation', async ({ page }) => {
    // Test content authenticity features
    await islamicHelpers.verifyIslamicContentCompliance();
    
    // Test source verification
    const contentSources = page.locator('[data-testid="content-sources"]');
    if (await contentSources.isVisible()) {
      await contentSources.click();
      
      // Should show sources information
      const sourcesInfo = page.locator('[data-testid="sources-information"]');
      await expect(sourcesInfo).toBeVisible();
      
      // Should mention reputable Islamic sources
      const sourcesText = await sourcesInfo.textContent();
      expect(sourcesText).toMatch(/(Quran|Hadith|Islamic|Scholar|Authority)/i);
    }
    
    // Test content moderation (if user-generated content exists)
    await islamicHelpers.testContentModeration();
  });

  test('should handle location-based Islamic features', async ({ page }) => {
    // Test location permission request
    await page.evaluate(() => {
      // Mock geolocation
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success: Function) => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 100
              }
            });
          }
        }
      });
    });
    
    // Request location for prayer times
    const enableLocation = page.locator('[data-testid="enable-location"]');
    if (await enableLocation.isVisible()) {
      await enableLocation.click();
      
      // Should calculate prayer times for current location
      await page.waitForTimeout(2000);
      
      const locationStatus = page.locator('[data-testid="location-status"]');
      if (await locationStatus.isVisible()) {
        const statusText = await locationStatus.textContent();
        expect(statusText).toMatch(/(located|found|detected)/i);
      }
    }
    
    // Test nearby mosques feature
    const nearbyMosques = page.locator('[data-testid="nearby-mosques"]');
    if (await nearbyMosques.isVisible()) {
      await nearbyMosques.click();
      
      // Should show mosque finder
      const mosqueFinder = page.locator('[data-testid="mosque-finder"]');
      await expect(mosqueFinder).toBeVisible();
      
      // Would require external API for actual mosque data
      // Test interface elements
      const searchRadius = page.locator('[data-testid="search-radius"]');
      if (await searchRadius.isVisible()) {
        await searchRadius.click();
        await page.click('[data-testid="radius-5km"]');
      }
    }
  });

  test('should support Islamic educational content', async ({ page }) => {
    const islamicEducation = page.locator('[data-testid="islamic-education"]');
    
    if (!(await islamicEducation.isVisible())) {
      const educationButton = page.locator('[data-testid="education-button"]');
      if (await educationButton.isVisible()) {
        await educationButton.click();
      }
    }
    
    if (await islamicEducation.isVisible()) {
      // Test topics
      const topics = ['five-pillars', 'prophets', 'companions', 'islamic-history'];
      
      for (const topic of topics) {
        const topicButton = page.locator(`[data-testid="topic-${topic}"]`);
        if (await topicButton.isVisible()) {
          await topicButton.click();
          
          // Should show educational content
          const topicContent = page.locator('[data-testid="topic-content"]');
          await expect(topicContent).toBeVisible();
          
          // Should have both Arabic and translated content where applicable
          const arabicContent = page.locator('[data-testid="content-arabic"]');
          if (await arabicContent.isVisible()) {
            await islamicHelpers.verifyArabicTextRendering('[data-testid="content-arabic"]');
          }
          
          break; // Test one topic
        }
      }
    }
  });

  test('should maintain Islamic date calculations accuracy', async ({ page }) => {
    await islamicHelpers.verifyIslamicDateCalculations();
    
    // Test moon phase calculations (if available)
    const moonPhase = page.locator('[data-testid="moon-phase"]');
    if (await moonPhase.isVisible()) {
      const phaseText = await moonPhase.textContent();
      const validPhases = ['new moon', 'waxing', 'full moon', 'waning'];
      const hasValidPhase = validPhases.some(phase => 
        phaseText?.toLowerCase().includes(phase)
      );
      expect(hasValidPhase).toBe(true);
    }
    
    // Test Islamic month progression
    const islamicMonth = page.locator('[data-testid="islamic-month"]');
    if (await islamicMonth.isVisible()) {
      const monthText = await islamicMonth.textContent();
      const islamicMonths = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
        'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
      ];
      const hasValidMonth = islamicMonths.some(month => 
        monthText?.includes(month)
      );
      expect(hasValidMonth).toBe(true);
    }
  });
});
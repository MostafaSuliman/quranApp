import { Page, expect } from '@playwright/test';

/**
 * Helper functions for Islamic content and features testing
 */

export class IslamicHelpers {
  constructor(private page: Page) {}

  /**
   * Verify Arabic text rendering and RTL layout
   */
  async verifyArabicTextRendering(selector: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    // Check if text direction is RTL
    const direction = await element.evaluate(el => 
      window.getComputedStyle(el).direction
    );
    expect(direction).toBe('rtl');
    
    // Verify Arabic font is applied
    const fontFamily = await element.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily).toMatch(/arabic|noto|amiri|scheherazade/i);
  }

  /**
   * Verify Quranic text authenticity
   */
  async verifyQuranTextAuthenticity(surah: number, ayah: number, expectedText?: string) {
    const ayahElement = this.page.locator(`[data-testid="ayah-${surah}-${ayah}"]`);
    await expect(ayahElement).toBeVisible();
    
    if (expectedText) {
      await expect(ayahElement).toContainText(expectedText);
    }
    
    // Verify ayah has proper Arabic text structure
    const arabicText = await ayahElement.textContent();
    expect(arabicText).toMatch(/[\u0600-\u06FF]/); // Arabic Unicode range
    
    // Verify ayah number is present
    const ayahNumber = this.page.locator(`[data-testid="ayah-number-${surah}-${ayah}"]`);
    await expect(ayahNumber).toContainText(ayah.toString());
  }

  /**
   * Test prayer time calculations
   */
  async testPrayerTimes(location = { lat: 40.7128, lng: -74.0060 }) { // Default to NYC
    // Navigate to prayer times feature
    await this.page.click('[data-testid="prayer-times-button"]');
    
    // Set location
    await this.page.fill('[data-testid="latitude-input"]', location.lat.toString());
    await this.page.fill('[data-testid="longitude-input"]', location.lng.toString());
    await this.page.click('[data-testid="calculate-prayer-times"]');
    
    // Verify all 5 prayer times are displayed
    const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    for (const prayer of prayerNames) {
      const prayerTime = this.page.locator(`[data-testid="prayer-time-${prayer}"]`);
      await expect(prayerTime).toBeVisible();
      
      // Verify time format (HH:MM)
      const timeText = await prayerTime.textContent();
      expect(timeText).toMatch(/\d{1,2}:\d{2}/);
    }
  }

  /**
   * Test Qibla direction feature
   */
  async testQiblaDirection(location = { lat: 40.7128, lng: -74.0060 }) {
    await this.page.click('[data-testid="qibla-compass-button"]');
    
    // Set location
    await this.page.fill('[data-testid="qibla-latitude"]', location.lat.toString());
    await this.page.fill('[data-testid="qibla-longitude"]', location.lng.toString());
    await this.page.click('[data-testid="calculate-qibla"]');
    
    // Verify compass is displayed
    const compass = this.page.locator('[data-testid="qibla-compass"]');
    await expect(compass).toBeVisible();
    
    // Verify direction angle is calculated
    const direction = this.page.locator('[data-testid="qibla-direction"]');
    await expect(direction).toBeVisible();
    
    const directionText = await direction.textContent();
    expect(directionText).toMatch(/\d+°/);
  }

  /**
   * Test Hijri calendar integration
   */
  async testHijriCalendar() {
    const hijriDate = this.page.locator('[data-testid="hijri-date"]');
    await expect(hijriDate).toBeVisible();
    
    const hijriText = await hijriDate.textContent();
    // Should contain Arabic months and Hijri year
    expect(hijriText).toMatch(/\d{4}|محرم|صفر|ربيع|جمادى|رجب|شعبان|رمضان|شوال|ذو/);
  }

  /**
   * Test Ramadan mode features
   */
  async testRamadanMode() {
    // Enable Ramadan mode
    await this.page.click('[data-testid="settings-button"]');
    await this.page.click('[data-testid="ramadan-mode-toggle"]');
    
    // Verify Ramadan-specific UI elements
    const ramadanBanner = this.page.locator('[data-testid="ramadan-banner"]');
    await expect(ramadanBanner).toBeVisible();
    
    // Test Suhoor and Iftar times
    const suhoorTime = this.page.locator('[data-testid="suhoor-time"]');
    const iftarTime = this.page.locator('[data-testid="iftar-time"]');
    
    await expect(suhoorTime).toBeVisible();
    await expect(iftarTime).toBeVisible();
    
    // Test fasting tracker
    const fastingTracker = this.page.locator('[data-testid="fasting-tracker"]');
    await expect(fastingTracker).toBeVisible();
  }

  /**
   * Verify Islamic content guidelines compliance
   */
  async verifyIslamicContentCompliance() {
    // Check for respectful presentation of Quranic text
    const quranText = this.page.locator('[data-testid*="quran-text"]');
    
    if (await quranText.count() > 0) {
      // Verify proper capitalization and reverence markers
      const textContent = await quranText.first().textContent();
      
      // Should not contain inappropriate content
      const inappropriatePatterns = [
        /\bAllah\b(?!\s*\(SWT\)|swt)/i, // Allah should be followed by respectful notation
        /\bmuhammad\b(?!\s*\(PBUH\)|pbuh)/i, // Prophet's name should have PBUH
      ];
      
      for (const pattern of inappropriatePatterns) {
        expect(textContent).not.toMatch(pattern);
      }
    }
  }

  /**
   * Test Arabic keyboard input support
   */
  async testArabicInput(inputSelector: string, arabicText: string) {
    const input = this.page.locator(inputSelector);
    await input.click();
    
    // Set input method to Arabic
    await this.page.keyboard.press('Alt+Shift'); // Common Arabic keyboard shortcut
    
    // Type Arabic text
    await input.fill(arabicText);
    
    // Verify text was entered correctly
    const value = await input.inputValue();
    expect(value).toBe(arabicText);
    
    // Verify RTL display
    const direction = await input.evaluate(el => 
      window.getComputedStyle(el).direction
    );
    expect(direction).toBe('rtl');
  }

  /**
   * Test reciter pronunciation accuracy indicators
   */
  async testReciterPronunciation(reciterId: string) {
    await this.page.click(`[data-testid="reciter-${reciterId}"]`);
    
    // Verify pronunciation guide is available
    const pronunciationGuide = this.page.locator('[data-testid="pronunciation-guide"]');
    
    if (await pronunciationGuide.isVisible()) {
      // Test pronunciation markers
      const tajweedMarkers = this.page.locator('[data-testid*="tajweed-"]');
      expect(await tajweedMarkers.count()).toBeGreaterThan(0);
    }
  }

  /**
   * Verify Islamic date calculations
   */
  async verifyIslamicDateCalculations() {
    const islamicDate = this.page.locator('[data-testid="islamic-date"]');
    
    if (await islamicDate.isVisible()) {
      const dateText = await islamicDate.textContent();
      
      // Verify Hijri year is reasonable (should be around 1440-1450 range)
      const hijriYear = dateText?.match(/\d{4}/)?.[0];
      if (hijriYear) {
        const year = parseInt(hijriYear);
        expect(year).toBeGreaterThan(1400);
        expect(year).toBeLessThan(1500);
      }
    }
  }

  /**
   * Test Islamic content filtering and moderation
   */
  async testContentModeration() {
    // This would test user-generated content features if they exist
    const commentSection = this.page.locator('[data-testid="comments-section"]');
    
    if (await commentSection.isVisible()) {
      // Test inappropriate content blocking
      const textInput = this.page.locator('[data-testid="comment-input"]');
      
      if (await textInput.isVisible()) {
        // Try to submit inappropriate content
        await textInput.fill('inappropriate test content');
        await this.page.click('[data-testid="submit-comment"]');
        
        // Verify content was filtered
        const warningMessage = this.page.locator('[data-testid="content-warning"]');
        await expect(warningMessage).toBeVisible();
      }
    }
  }
}
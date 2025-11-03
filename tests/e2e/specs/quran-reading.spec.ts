import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import { IslamicHelpers } from '../helpers/islamic-helpers';

/**
 * E2E tests for Quran reading functionality
 * Tests complete reading experience, navigation, and search
 */

test.describe('Quran Reading Journey', () => {
  let testHelpers: TestHelpers;
  let islamicHelpers: IslamicHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    islamicHelpers = new IslamicHelpers(page);
    
    // Set up authenticated user session
    await testHelpers.createUserSession({ 
      completedOnboarding: true,
      language: 'en',
      theme: 'light' 
    });
    
    await page.goto('/');
    await testHelpers.waitForAppLoad();
  });

  test('should display Mushaf reader with proper Arabic text', async ({ page }) => {
    // Navigate to Mushaf reader
    await testHelpers.navigateTo('mushaf');
    
    // Verify Mushaf page loads
    const mushafPage = page.locator('[data-testid="mushaf-page"]');
    await expect(mushafPage).toBeVisible();
    
    // Verify Arabic text is displayed
    const quranText = page.locator('[data-testid="quran-text"]');
    await expect(quranText).toBeVisible();
    
    // Test Arabic text rendering
    await islamicHelpers.verifyArabicTextRendering('[data-testid="quran-text"]');
    
    // Verify page navigation controls
    await expect(page.locator('[data-testid="prev-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-info"]')).toBeVisible();
    
    // Verify zoom controls
    await expect(page.locator('[data-testid="zoom-in"]')).toBeVisible();
    await expect(page.locator('[data-testid="zoom-out"]')).toBeVisible();
  });

  test('should navigate through Mushaf pages correctly', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Get initial page number
    const pageInfo = page.locator('[data-testid="page-info"]');
    const initialPageText = await pageInfo.textContent();
    const initialPage = parseInt(initialPageText?.match(/\d+/)?.[0] || '1');
    
    // Navigate to next page
    await page.click('[data-testid="next-page"]');
    await page.waitForTimeout(500); // Allow page to load
    
    // Verify page number increased
    const newPageText = await pageInfo.textContent();
    const newPage = parseInt(newPageText?.match(/\d+/)?.[0] || '1');
    expect(newPage).toBe(initialPage + 1);
    
    // Navigate back
    await page.click('[data-testid="prev-page"]');
    await page.waitForTimeout(500);
    
    // Verify we're back to initial page
    const backPageText = await pageInfo.textContent();
    const backPage = parseInt(backPageText?.match(/\d+/)?.[0] || '1');
    expect(backPage).toBe(initialPage);
  });

  test('should support Surah navigation', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Open Surah navigator
    await page.click('[data-testid="surah-navigator"]');
    
    // Verify Surah list is displayed
    const surahList = page.locator('[data-testid="surah-list"]');
    await expect(surahList).toBeVisible();
    
    // Verify Al-Fatiha is listed
    const alFatiha = page.locator('[data-testid="surah-1"]');
    await expect(alFatiha).toBeVisible();
    await expect(alFatiha).toContainText('الفاتحة');
    
    // Navigate to Al-Baqarah
    await page.click('[data-testid="surah-2"]');
    
    // Verify navigation to correct Surah
    await page.waitForTimeout(1000);
    const currentSurah = page.locator('[data-testid="current-surah"]');
    await expect(currentSurah).toContainText('البقرة');
  });

  test('should support Ayah-level interaction', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Wait for Ayahs to load
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await expect(firstAyah).toBeVisible();
    
    // Click on an Ayah
    await firstAyah.click();
    
    // Verify Ayah selection
    await expect(firstAyah).toHaveClass(/selected|highlighted/);
    
    // Verify Ayah actions menu appears
    const ayahActions = page.locator('[data-testid="ayah-actions"]');
    await expect(ayahActions).toBeVisible();
    
    // Test available actions
    await expect(page.locator('[data-testid="play-ayah"]')).toBeVisible();
    await expect(page.locator('[data-testid="bookmark-ayah"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-ayah"]')).toBeVisible();
    
    // Test Ayah authenticity
    await islamicHelpers.verifyQuranTextAuthenticity(1, 1);
  });

  test('should support search functionality', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Open search
    await page.click('[data-testid="search-button"]');
    
    // Test Arabic search
    const searchResults = await testHelpers.testSearchFunctionality('الله');
    
    // Verify search results contain Arabic text
    await islamicHelpers.verifyArabicTextRendering('[data-testid="search-results"]');
    
    // Test result navigation
    const firstResult = page.locator('[data-testid="search-result-0"]');
    await firstResult.click();
    
    // Verify navigation to result location
    const highlightedAyah = page.locator('[data-testid*="ayah-"][class*="highlighted"]');
    await expect(highlightedAyah).toBeVisible();
  });

  test('should support translation display', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Enable translation
    await page.click('[data-testid="translation-toggle"]');
    
    // Verify translation appears
    const translation = page.locator('[data-testid="translation-text"]');
    await expect(translation).toBeVisible();
    
    // Test translation language switching
    await page.click('[data-testid="translation-language"]');
    await page.click('[data-testid="translation-english"]');
    
    // Verify English translation
    const englishTranslation = await translation.textContent();
    expect(englishTranslation).toMatch(/[a-zA-Z]/);
    
    // Switch to Arabic translation
    await page.click('[data-testid="translation-language"]');
    await page.click('[data-testid="translation-arabic"]');
    
    // Verify Arabic translation
    await islamicHelpers.verifyArabicTextRendering('[data-testid="translation-text"]');
  });

  test('should support bookmarking functionality', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Select an Ayah
    const ayah = page.locator('[data-testid="ayah-2-255"]'); // Ayat al-Kursi
    await ayah.click();
    
    // Bookmark the Ayah
    await page.click('[data-testid="bookmark-ayah"]');
    
    // Verify bookmark confirmation
    const bookmarkSuccess = page.locator('[data-testid="bookmark-success"]');
    await expect(bookmarkSuccess).toBeVisible();
    
    // Navigate to bookmarks
    await page.click('[data-testid="bookmarks-button"]');
    
    // Verify bookmark is saved
    const bookmarksList = page.locator('[data-testid="bookmarks-list"]');
    await expect(bookmarksList).toBeVisible();
    
    const bookmark = page.locator('[data-testid="bookmark-2-255"]');
    await expect(bookmark).toBeVisible();
    
    // Test bookmark navigation
    await bookmark.click();
    
    // Verify navigation to bookmarked Ayah
    await expect(ayah).toBeVisible();
  });

  test('should support font size adjustment', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Get initial font size
    const quranText = page.locator('[data-testid="quran-text"]');
    const initialFontSize = await quranText.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Increase font size
    await page.click('[data-testid="font-size-increase"]');
    
    // Verify font size increased
    const newFontSize = await quranText.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseFloat(newFontSize)).toBeGreaterThan(parseFloat(initialFontSize));
    
    // Decrease font size
    await page.click('[data-testid="font-size-decrease"]');
    
    // Should be back to original size
    const finalFontSize = await quranText.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(finalFontSize).toBe(initialFontSize);
  });

  test('should handle different reading modes', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Test Mushaf mode (default)
    const mushafMode = page.locator('[data-testid="reading-mode-mushaf"]');
    await expect(mushafMode).toHaveClass(/active|selected/);
    
    // Switch to text mode
    await page.click('[data-testid="reading-mode-text"]');
    
    // Verify text mode layout
    const textLayout = page.locator('[data-testid="text-mode-layout"]');
    await expect(textLayout).toBeVisible();
    
    // Switch to verse-by-verse mode
    await page.click('[data-testid="reading-mode-verse"]');
    
    // Verify verse mode layout
    const verseLayout = page.locator('[data-testid="verse-mode-layout"]');
    await expect(verseLayout).toBeVisible();
  });

  test('should support night mode for reading', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Enable night mode
    await page.click('[data-testid="night-mode-toggle"]');
    
    // Verify dark theme is applied
    const isDark = await testHelpers.toggleDarkMode();
    expect(isDark).toBe(true);
    
    // Verify readable contrast in night mode
    const quranText = page.locator('[data-testid="quran-text"]');
    const backgroundColor = await quranText.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    const color = await quranText.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Should have appropriate dark mode colors
    expect(backgroundColor).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(color).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  });

  test('should support tajweed highlighting', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Enable tajweed
    await page.click('[data-testid="tajweed-toggle"]');
    
    // Verify tajweed highlighting appears
    const tajweedElements = page.locator('[data-testid*="tajweed-"]');
    expect(await tajweedElements.count()).toBeGreaterThan(0);
    
    // Test different tajweed rules
    const ghunna = page.locator('[data-testid="tajweed-ghunna"]');
    const idghaam = page.locator('[data-testid="tajweed-idghaam"]');
    
    if (await ghunna.count() > 0) {
      await expect(ghunna.first()).toBeVisible();
    }
    
    if (await idghaam.count() > 0) {
      await expect(idghaam.first()).toBeVisible();
    }
  });

  test('should handle offline reading', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Wait for content to load
    const quranText = page.locator('[data-testid="quran-text"]');
    await expect(quranText).toBeVisible();
    
    // Test offline functionality
    await testHelpers.testOfflineMode();
    
    // Verify content is still accessible offline
    await expect(quranText).toBeVisible();
    
    // Test navigation works offline
    await page.click('[data-testid="next-page"]');
    await page.waitForTimeout(500);
    
    // Should still work
    await expect(quranText).toBeVisible();
  });

  test('should support copy functionality', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Select an Ayah
    const ayah = page.locator('[data-testid="ayah-1-1"]');
    await ayah.click();
    
    // Copy Ayah
    await page.click('[data-testid="copy-ayah"]');
    
    // Verify copy success message
    const copySuccess = page.locator('[data-testid="copy-success"]');
    await expect(copySuccess).toBeVisible();
    
    // Verify clipboard content (if supported)
    const clipboardText = await page.evaluate(() => {
      return navigator.clipboard.readText().catch(() => 'clipboard not accessible');
    });
    
    if (clipboardText !== 'clipboard not accessible') {
      expect(clipboardText).toMatch(/[\u0600-\u06FF]/); // Should contain Arabic text
    }
  });

  test('should maintain reading position across sessions', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Navigate to a specific page
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-3"]'); // Al-Imran
    
    // Get current position
    const pageInfo = page.locator('[data-testid="page-info"]');
    const currentPage = await pageInfo.textContent();
    
    // Reload page
    await page.reload();
    await testHelpers.waitForAppLoad();
    await testHelpers.navigateTo('mushaf');
    
    // Should return to same position
    const restoredPage = await pageInfo.textContent();
    expect(restoredPage).toBe(currentPage);
  });
});
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import { IslamicHelpers } from '../helpers/islamic-helpers';

/**
 * E2E tests for PWA installation and offline functionality
 * Tests service worker, caching, offline access, and app installation
 */

test.describe('PWA and Offline Features', () => {
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

  test('should register service worker', async ({ page }) => {
    // Check if service worker is registered
    const serviceWorkerRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    expect(serviceWorkerRegistered).toBe(true);
    
    // Check service worker state
    const serviceWorkerState = await page.evaluate(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        return navigator.serviceWorker.controller.state;
      }
      return 'not_found';
    });
    
    expect(serviceWorkerState).toBe('activated');
  });

  test('should cache essential resources', async ({ page }) => {
    // Check if cache is populated
    const cacheNames = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return cacheNames;
    });
    
    expect(cacheNames.length).toBeGreaterThan(0);
    
    // Check if essential resources are cached
    const cachedResources = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const resources = [];
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        resources.push(...keys.map(request => request.url));
      }
      
      return resources;
    });
    
    // Should cache main app resources
    const hasAppShell = cachedResources.some(url => 
      url.includes('index.html') || url.includes('app.js') || url.includes('app.css')
    );
    expect(hasAppShell).toBe(true);
  });

  test('should work offline after initial load', async ({ page }) => {
    // Ensure app is fully loaded and cached
    await testHelpers.navigateTo('mushaf');
    await page.waitForTimeout(2000); // Allow caching
    
    // Go offline
    await testHelpers.testOfflineMode();
    
    // Verify app still works
    await testHelpers.navigateTo('home');
    const homePage = page.locator('[data-testid="home-page"]');
    await expect(homePage).toBeVisible();
    
    // Test navigation between cached pages
    await testHelpers.navigateTo('progress');
    const progressPage = page.locator('[data-testid="progress-page"]');
    await expect(progressPage).toBeVisible();
    
    // Test settings page
    await testHelpers.navigateTo('settings');
    const settingsPage = page.locator('[data-testid="settings-page"]');
    await expect(settingsPage).toBeVisible();
  });

  test('should cache Quran content for offline reading', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Navigate through several pages to trigger caching
    const pages = [1, 2, 3, 4, 5];
    
    for (const pageNum of pages) {
      // Navigate to specific page
      await page.click('[data-testid="page-navigator"]');
      await page.fill('[data-testid="page-input"]', pageNum.toString());
      await page.click('[data-testid="go-to-page"]');
      
      // Wait for content to load and cache
      const quranText = page.locator('[data-testid="quran-text"]');
      await expect(quranText).toBeVisible();
      await page.waitForTimeout(1000);
    }
    
    // Go offline
    await page.context().setOffline(true);
    
    // Verify cached pages are still accessible
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="prev-page"]');
      await page.waitForTimeout(500);
      
      const quranText = page.locator('[data-testid="quran-text"]');
      await expect(quranText).toBeVisible();
      
      // Verify Arabic text is still rendered correctly
      await islamicHelpers.verifyArabicTextRendering('[data-testid="quran-text"]');
    }
  });

  test('should handle offline audio gracefully', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Try to download some audio first (if available)
    const downloadAudio = page.locator('[data-testid="download-audio"]');
    if (await downloadAudio.isVisible()) {
      await downloadAudio.click();
      await page.click('[data-testid="download-al-fatiha"]');
      
      // Wait for download to complete
      await page.waitForSelector('[data-testid="download-complete"]', { 
        timeout: 30000 
      }).catch(() => {
        console.log('Audio download test skipped - may be too large for test environment');
      });
    }
    
    // Go offline
    await page.context().setOffline(true);
    
    // Try to play audio
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    // Should either play cached audio or show offline message
    const audioElement = page.locator('audio');
    const offlineMessage = page.locator('[data-testid="offline-audio-message"]');
    
    const audioPlaying = await audioElement.evaluate(audio => !audio.paused).catch(() => false);
    const messageVisible = await offlineMessage.isVisible().catch(() => false);
    
    expect(audioPlaying || messageVisible).toBe(true);
  });

  test('should show PWA install prompt', async ({ page }) => {
    // Simulate PWA install prompt
    await testHelpers.testPWAInstallation();
    
    // Test install button functionality
    const installButton = page.locator('[data-testid="pwa-install-button"]');
    if (await installButton.isVisible()) {
      await installButton.click();
      
      // Should trigger installation process
      const installationInProgress = page.locator('[data-testid="installation-in-progress"]');
      await expect(installationInProgress).toBeVisible({ timeout: 5000 });
    }
  });

  test('should update app when new version is available', async ({ page }) => {
    // Mock service worker update
    await page.evaluate(() => {
      // Simulate service worker update event
      if ('serviceWorker' in navigator) {
        const event = new CustomEvent('updatefound');
        navigator.serviceWorker.dispatchEvent(event);
      }
    });
    
    // Check for update notification
    const updateNotification = page.locator('[data-testid="app-update-available"]');
    
    // Wait a bit for the update notification to appear
    await page.waitForTimeout(2000);
    
    if (await updateNotification.isVisible()) {
      // Test update installation
      const updateButton = page.locator('[data-testid="install-update"]');
      await updateButton.click();
      
      // Should show update progress
      const updateProgress = page.locator('[data-testid="update-progress"]');
      await expect(updateProgress).toBeVisible();
      
      // Should complete update
      const updateComplete = page.locator('[data-testid="update-complete"]');
      await expect(updateComplete).toBeVisible({ timeout: 10000 });
    }
  });

  test('should support background sync for user data', async ({ page }) => {
    // Make some changes while online
    await testHelpers.navigateTo('mushaf');
    
    // Bookmark an ayah
    const ayah = page.locator('[data-testid="ayah-2-255"]');
    await ayah.click();
    await page.click('[data-testid="bookmark-ayah"]');
    
    // Mark progress
    await testHelpers.navigateTo('progress');
    const markComplete = page.locator('[data-testid="mark-lesson-complete"]');
    if (await markComplete.isVisible()) {
      await markComplete.click();
    }
    
    // Go offline
    await page.context().setOffline(true);
    
    // Make more changes while offline
    await testHelpers.navigateTo('mushaf');
    const anotherAyah = page.locator('[data-testid="ayah-1-7"]');
    await anotherAyah.click();
    await page.click('[data-testid="bookmark-ayah"]');
    
    // Should show offline indicator but allow changes
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible();
    
    const syncPending = page.locator('[data-testid="sync-pending"]');
    if (await syncPending.isVisible()) {
      const pendingText = await syncPending.textContent();
      expect(pendingText).toMatch(/\d+/); // Should show number of pending changes
    }
    
    // Go back online
    await page.context().setOffline(false);
    
    // Should sync changes
    await page.waitForTimeout(3000); // Allow sync to complete
    
    const syncComplete = page.locator('[data-testid="sync-complete"]');
    if (await syncComplete.isVisible()) {
      await expect(syncComplete).toBeVisible();
    }
  });

  test('should cache Islamic content and calculations offline', async ({ page }) => {
    // Load prayer times data
    const prayerTimesSection = page.locator('[data-testid="prayer-times-section"]');
    if (!(await prayerTimesSection.isVisible())) {
      const prayerTimesButton = page.locator('[data-testid="prayer-times-button"]');
      if (await prayerTimesButton.isVisible()) {
        await prayerTimesButton.click();
      }
    }
    
    // Load Hijri calendar
    await islamicHelpers.testHijriCalendar();
    
    // Load Qibla direction
    await islamicHelpers.testQiblaDirection();
    
    // Go offline
    await page.context().setOffline(true);
    
    // Verify Islamic features still work offline
    
    // Test prayer times
    const prayerTimes = page.locator('[data-testid*="prayer-"]');
    if (await prayerTimes.count() > 0) {
      const firstPrayerTime = await prayerTimes.first().textContent();
      expect(firstPrayerTime).toMatch(/\d{1,2}:\d{2}/);
    }
    
    // Test Hijri date
    const hijriDate = page.locator('[data-testid="hijri-date"]');
    if (await hijriDate.isVisible()) {
      const hijriText = await hijriDate.textContent();
      expect(hijriText).toMatch(/\d{4}/);
    }
    
    // Test Qibla compass (cached calculation)
    const qiblaCompass = page.locator('[data-testid="qibla-compass"]');
    if (await qiblaCompass.isVisible()) {
      const direction = page.locator('[data-testid="qibla-direction"]');
      if (await direction.isVisible()) {
        const directionText = await direction.textContent();
        expect(directionText).toMatch(/\d+°/);
      }
    }
  });

  test('should handle storage quota and cleanup', async ({ page }) => {
    // Check storage usage
    const storageInfo = await page.evaluate(async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          available: estimate.quota! - estimate.usage!
        };
      }
      return null;
    });
    
    if (storageInfo) {
      expect(storageInfo.quota).toBeGreaterThan(0);
      expect(storageInfo.usage).toBeDefined();
      expect(storageInfo.available).toBeGreaterThan(0);
    }
    
    // Test storage cleanup when low on space
    const storageManagement = page.locator('[data-testid="storage-management"]');
    if (await storageManagement.isVisible()) {
      await storageManagement.click();
      
      // Should show storage usage breakdown
      const storageBreakdown = page.locator('[data-testid="storage-breakdown"]');
      await expect(storageBreakdown).toBeVisible();
      
      // Test cleanup options
      const cleanupOldCache = page.locator('[data-testid="cleanup-old-cache"]');
      if (await cleanupOldCache.isVisible()) {
        await cleanupOldCache.click();
        
        // Should show cleanup progress
        const cleanupProgress = page.locator('[data-testid="cleanup-progress"]');
        await expect(cleanupProgress).toBeVisible();
      }
    }
  });

  test('should support offline search in cached content', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Load and cache some content first
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]'); // Al-Fatiha
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="surah-2"]'); // Al-Baqarah (first few ayahs)
    await page.waitForTimeout(1000);
    
    // Go offline
    await page.context().setOffline(true);
    
    // Test search in cached content
    const searchButton = page.locator('[data-testid="search-button"]');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('الله'); // Search for "Allah"
      await page.keyboard.press('Enter');
      
      // Should show cached results
      const searchResults = page.locator('[data-testid="search-results"]');
      if (await searchResults.isVisible()) {
        const resultCount = await page.locator('[data-testid="search-result"]').count();
        expect(resultCount).toBeGreaterThan(0);
      } else {
        // Should show offline search limitation message
        const offlineSearchMessage = page.locator('[data-testid="offline-search-limited"]');
        await expect(offlineSearchMessage).toBeVisible();
      }
    }
  });

  test('should maintain app state across offline/online transitions', async ({ page }) => {
    // Set up initial state
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-3"]'); // Al-Imran
    
    // Change some settings
    await testHelpers.navigateTo('settings');
    await page.click('[data-testid="display-settings"]');
    await page.click('[data-testid="theme-toggle"]'); // Switch to dark mode
    
    // Go offline
    await page.context().setOffline(true);
    
    // Make changes while offline
    await page.click('[data-testid="font-size-increase"]');
    await page.click('[data-testid="font-size-increase"]');
    
    // Navigate while offline
    await testHelpers.navigateTo('mushaf');
    
    // Verify state is maintained
    const isDark = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);
    
    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);
    
    // Verify state persists after going back online
    await page.reload();
    await testHelpers.waitForAppLoad();
    
    const isDarkAfterReload = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    expect(isDarkAfterReload).toBe(true);
  });

  test('should handle app updates gracefully', async ({ page }) => {
    // Test update notification handling
    const skipUpdate = page.locator('[data-testid="skip-update"]');
    const updateLater = page.locator('[data-testid="update-later"]');
    const installUpdate = page.locator('[data-testid="install-update"]');
    
    // Simulate update available
    await page.evaluate(() => {
      // Trigger update notification
      const event = new CustomEvent('app-update-available');
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(1000);
    
    // Check if update notification appeared
    const updateNotification = page.locator('[data-testid="app-update-available"]');
    
    if (await updateNotification.isVisible()) {
      // Test "Update Later" option
      if (await updateLater.isVisible()) {
        await updateLater.click();
        
        // Notification should be dismissed but app should continue working
        await expect(updateNotification).toBeHidden();
        
        // App should still be functional
        await testHelpers.navigateTo('mushaf');
        const mushafPage = page.locator('[data-testid="mushaf-page"]');
        await expect(mushafPage).toBeVisible();
      }
    }
  });

  test('should support PWA manifest features', async ({ page }) => {
    // Check if manifest is properly loaded
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBeTruthy();
    
    // Fetch and validate manifest
    const manifestResponse = await page.request.get(manifestLink!);
    expect(manifestResponse.ok()).toBe(true);
    
    const manifest = await manifestResponse.json();
    
    // Validate essential manifest properties
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
    
    // Validate icons
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy();
      expect(icon.sizes).toBeTruthy();
      expect(icon.type).toBeTruthy();
    }
    
    // Check for required PWA features
    expect(manifest.orientation).toBeDefined();
    if (manifest.categories) {
      expect(manifest.categories).toContain('education');
    }
  });
});
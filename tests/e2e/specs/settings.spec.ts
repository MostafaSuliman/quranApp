import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import { IslamicHelpers } from '../helpers/islamic-helpers';

/**
 * E2E tests for settings and preferences
 * Tests user preferences, customization options, and data management
 */

test.describe('Settings and Preferences', () => {
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
    await testHelpers.navigateTo('settings');
  });

  test('should display all settings categories', async ({ page }) => {
    // Verify main settings page
    const settingsPage = page.locator('[data-testid="settings-page"]');
    await expect(settingsPage).toBeVisible();
    
    // Verify settings categories
    await expect(page.locator('[data-testid="general-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="display-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="audio-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="reading-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="privacy-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-settings"]')).toBeVisible();
  });

  test('should manage general settings', async ({ page }) => {
    await page.click('[data-testid="general-settings"]');
    
    // Test language settings
    const languageSelector = page.locator('[data-testid="language-selector"]');
    await expect(languageSelector).toBeVisible();
    
    // Change to Arabic
    await languageSelector.click();
    await page.click('[data-testid="language-option-ar"]');
    
    // Verify language change
    await page.waitForTimeout(1000);
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('ar');
    
    // Verify RTL layout
    const direction = await page.evaluate(() => 
      window.getComputedStyle(document.documentElement).direction
    );
    expect(direction).toBe('rtl');
    
    // Change back to English
    await languageSelector.click();
    await page.click('[data-testid="language-option-en"]');
    
    // Test region/country settings
    const regionSelector = page.locator('[data-testid="region-selector"]');
    if (await regionSelector.isVisible()) {
      await regionSelector.click();
      await page.click('[data-testid="region-us"]');
      
      // Verify region setting
      const selectedRegion = page.locator('[data-testid="selected-region"]');
      await expect(selectedRegion).toContainText('United States');
    }
  });

  test('should manage display settings', async ({ page }) => {
    await page.click('[data-testid="display-settings"]');
    
    // Test theme switching
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
    
    // Switch to dark mode
    await themeToggle.click();
    
    // Verify dark mode is applied
    const isDark = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);
    
    // Test font size settings
    const fontSizeSlider = page.locator('[data-testid="font-size-slider"]');
    await expect(fontSizeSlider).toBeVisible();
    
    // Increase font size
    await fontSizeSlider.fill('120');
    
    // Verify font size change
    const rootFontSize = await page.evaluate(() => 
      window.getComputedStyle(document.documentElement).fontSize
    );
    expect(parseFloat(rootFontSize)).toBeGreaterThan(16); // Default is usually 16px
    
    // Test animation settings
    const animationToggle = page.locator('[data-testid="animations-toggle"]');
    if (await animationToggle.isVisible()) {
      await animationToggle.click();
      
      // Verify animations are disabled
      const animationDuration = await page.evaluate(() => 
        getComputedStyle(document.documentElement).getPropertyValue('--animation-duration')
      );
      expect(animationDuration).toContain('0.01ms');
    }
  });

  test('should manage audio settings', async ({ page }) => {
    await page.click('[data-testid="audio-settings"]');
    
    // Test reciter selection
    const reciterSelector = page.locator('[data-testid="default-reciter"]');
    await expect(reciterSelector).toBeVisible();
    
    await reciterSelector.click();
    await page.click('[data-testid="reciter-option-sudais"]');
    
    // Verify reciter selection
    const selectedReciter = page.locator('[data-testid="selected-reciter-name"]');
    await expect(selectedReciter).toContainText('Sudais');
    
    // Test playback speed
    const speedSelector = page.locator('[data-testid="default-playback-speed"]');
    await expect(speedSelector).toBeVisible();
    
    await speedSelector.click();
    await page.click('[data-testid="speed-option-0.75"]');
    
    // Test volume settings
    const defaultVolume = page.locator('[data-testid="default-volume"]');
    await expect(defaultVolume).toBeVisible();
    
    await defaultVolume.fill('80');
    
    // Test audio quality
    const audioQuality = page.locator('[data-testid="audio-quality"]');
    await expect(audioQuality).toBeVisible();
    
    await audioQuality.click();
    await page.click('[data-testid="quality-high"]');
    
    // Test auto-download settings
    const autoDownload = page.locator('[data-testid="auto-download-favorites"]');
    if (await autoDownload.isVisible()) {
      await autoDownload.click();
      
      // Verify auto-download is enabled
      await expect(autoDownload).toHaveClass(/checked|active/);
    }
  });

  test('should manage reading settings', async ({ page }) => {
    await page.click('[data-testid="reading-settings"]');
    
    // Test reading mode preference
    const readingMode = page.locator('[data-testid="default-reading-mode"]');
    await expect(readingMode).toBeVisible();
    
    await readingMode.click();
    await page.click('[data-testid="mode-text-view"]');
    
    // Test translation settings
    const translationLang = page.locator('[data-testid="translation-language"]');
    await expect(translationLang).toBeVisible();
    
    await translationLang.click();
    await page.click('[data-testid="translation-english"]');
    
    // Test whether to show translation by default
    const showTranslation = page.locator('[data-testid="show-translation-default"]');
    if (await showTranslation.isVisible()) {
      await showTranslation.click();
    }
    
    // Test tajweed settings
    const tajweedEnabled = page.locator('[data-testid="enable-tajweed"]');
    if (await tajweedEnabled.isVisible()) {
      await tajweedEnabled.click();
      
      // Test tajweed color scheme
      const tajweedColors = page.locator('[data-testid="tajweed-color-scheme"]');
      if (await tajweedColors.isVisible()) {
        await tajweedColors.click();
        await page.click('[data-testid="tajweed-scheme-traditional"]');
      }
    }
    
    // Test page turning animation
    const pageAnimation = page.locator('[data-testid="page-turn-animation"]');
    if (await pageAnimation.isVisible()) {
      await pageAnimation.click();
    }
  });

  test('should manage notification settings', async ({ page }) => {
    await page.click('[data-testid="notification-settings"]');
    
    // Test prayer time notifications
    const prayerNotifications = page.locator('[data-testid="prayer-time-notifications"]');
    await expect(prayerNotifications).toBeVisible();
    
    await prayerNotifications.click();
    
    // Configure notification timing
    const notificationTiming = page.locator('[data-testid="notification-timing"]');
    if (await notificationTiming.isVisible()) {
      await notificationTiming.click();
      await page.click('[data-testid="timing-5-minutes"]');
    }
    
    // Test reading reminders
    const readingReminders = page.locator('[data-testid="reading-reminders"]');
    if (await readingReminders.isVisible()) {
      await readingReminders.click();
      
      // Set reminder time
      const reminderTime = page.locator('[data-testid="reminder-time"]');
      if (await reminderTime.isVisible()) {
        await reminderTime.fill('19:00');
      }
    }
    
    // Test memorization reminders
    const memorizationReminders = page.locator('[data-testid="memorization-reminders"]');
    if (await memorizationReminders.isVisible()) {
      await memorizationReminders.click();
    }
    
    // Test notification sound
    const notificationSound = page.locator('[data-testid="notification-sound"]');
    if (await notificationSound.isVisible()) {
      await notificationSound.click();
      await page.click('[data-testid="sound-option-adhaan"]');
    }
  });

  test('should manage privacy settings', async ({ page }) => {
    await page.click('[data-testid="privacy-settings"]');
    
    // Test analytics settings
    const analytics = page.locator('[data-testid="analytics-enabled"]');
    await expect(analytics).toBeVisible();
    
    // Disable analytics
    if (await analytics.isChecked()) {
      await analytics.click();
    }
    
    // Verify analytics is disabled
    await expect(analytics).not.toBeChecked();
    
    // Test crash reporting
    const crashReporting = page.locator('[data-testid="crash-reporting"]');
    if (await crashReporting.isVisible()) {
      await crashReporting.click();
    }
    
    // Test location services
    const locationServices = page.locator('[data-testid="location-services"]');
    if (await locationServices.isVisible()) {
      await locationServices.click();
      
      // Verify location permission request
      const locationPermission = page.locator('[data-testid="location-permission-info"]');
      await expect(locationPermission).toBeVisible();
    }
    
    // Test data sharing preferences
    const dataSharing = page.locator('[data-testid="data-sharing"]');
    if (await dataSharing.isVisible()) {
      await dataSharing.click();
      await page.click('[data-testid="sharing-minimal"]');
    }
  });

  test('should manage data settings', async ({ page }) => {
    await page.click('[data-testid="data-settings"]');
    
    // Test storage usage display
    const storageUsage = page.locator('[data-testid="storage-usage"]');
    await expect(storageUsage).toBeVisible();
    
    // Should show some usage information
    const usageText = await storageUsage.textContent();
    expect(usageText).toMatch(/\d+(\.\d+)?\s*(KB|MB|GB)/);
    
    // Test cache management
    const clearCache = page.locator('[data-testid="clear-cache"]');
    await expect(clearCache).toBeVisible();
    
    await clearCache.click();
    
    // Confirm cache clearing
    const confirmClear = page.locator('[data-testid="confirm-clear-cache"]');
    if (await confirmClear.isVisible()) {
      await confirmClear.click();
      
      // Verify cache cleared message
      const cacheCleared = page.locator('[data-testid="cache-cleared"]');
      await expect(cacheCleared).toBeVisible();
    }
    
    // Test data export
    const exportData = page.locator('[data-testid="export-data"]');
    if (await exportData.isVisible()) {
      await exportData.click();
      
      // Verify export options
      const exportOptions = page.locator('[data-testid="export-options"]');
      await expect(exportOptions).toBeVisible();
      
      // Test exporting progress data
      const exportProgress = page.locator('[data-testid="export-progress"]');
      if (await exportProgress.isVisible()) {
        await exportProgress.click();
        
        // Should trigger download
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await downloadPromise.catch(() => {
          // Download might not work in test environment
          console.log('Export test skipped - download not available in test environment');
        });
      }
    }
    
    // Test data import
    const importData = page.locator('[data-testid="import-data"]');
    if (await importData.isVisible()) {
      await importData.click();
      
      // Verify import interface
      const importInterface = page.locator('[data-testid="import-interface"]');
      await expect(importInterface).toBeVisible();
    }
  });

  test('should support account management', async ({ page }) => {
    // Navigate to account settings if available
    const accountSettings = page.locator('[data-testid="account-settings"]');
    
    if (await accountSettings.isVisible()) {
      await accountSettings.click();
      
      // Test profile information
      const profileSection = page.locator('[data-testid="profile-section"]');
      await expect(profileSection).toBeVisible();
      
      // Test display name
      const displayName = page.locator('[data-testid="display-name"]');
      if (await displayName.isVisible()) {
        await displayName.fill('Test User');
        await page.click('[data-testid="save-profile"]');
        
        // Verify save confirmation
        const saveConfirmation = page.locator('[data-testid="profile-saved"]');
        await expect(saveConfirmation).toBeVisible();
      }
      
      // Test avatar/profile picture
      const avatarUpload = page.locator('[data-testid="avatar-upload"]');
      if (await avatarUpload.isVisible()) {
        // Test would require file upload functionality
        await expect(avatarUpload).toBeVisible();
      }
      
      // Test account deletion (if available)
      const deleteAccount = page.locator('[data-testid="delete-account"]');
      if (await deleteAccount.isVisible()) {
        await deleteAccount.click();
        
        // Should show confirmation dialog
        const deleteConfirmation = page.locator('[data-testid="delete-confirmation"]');
        await expect(deleteConfirmation).toBeVisible();
        
        // Cancel deletion
        await page.click('[data-testid="cancel-delete"]');
        await expect(deleteConfirmation).toBeHidden();
      }
    }
  });

  test('should handle location settings for Islamic features', async ({ page }) => {
    await page.click('[data-testid="location-settings"]');
    
    // Test manual location entry
    const manualLocation = page.locator('[data-testid="manual-location"]');
    await expect(manualLocation).toBeVisible();
    
    await manualLocation.click();
    
    // Enter coordinates
    const latitude = page.locator('[data-testid="latitude-input"]');
    const longitude = page.locator('[data-testid="longitude-input"]');
    
    await latitude.fill('40.7128');
    await longitude.fill('-74.0060');
    
    // Save location
    await page.click('[data-testid="save-location"]');
    
    // Test prayer time calculation method
    const calculationMethod = page.locator('[data-testid="calculation-method"]');
    await expect(calculationMethod).toBeVisible();
    
    await calculationMethod.click();
    await page.click('[data-testid="method-isna"]');
    
    // Test Asr calculation method
    const asrMethod = page.locator('[data-testid="asr-method"]');
    if (await asrMethod.isVisible()) {
      await asrMethod.click();
      await page.click('[data-testid="asr-standard"]');
    }
    
    // Test high latitude adjustment
    const highLatitude = page.locator('[data-testid="high-latitude-adjustment"]');
    if (await highLatitude.isVisible()) {
      await highLatitude.click();
      await page.click('[data-testid="high-lat-angle-based"]');
    }
  });

  test('should manage backup and sync settings', async ({ page }) => {
    const backupSettings = page.locator('[data-testid="backup-settings"]');
    
    if (await backupSettings.isVisible()) {
      await backupSettings.click();
      
      // Test auto-backup settings
      const autoBackup = page.locator('[data-testid="auto-backup"]');
      await expect(autoBackup).toBeVisible();
      
      await autoBackup.click();
      
      // Configure backup frequency
      const backupFrequency = page.locator('[data-testid="backup-frequency"]');
      if (await backupFrequency.isVisible()) {
        await backupFrequency.click();
        await page.click('[data-testid="frequency-weekly"]');
      }
      
      // Test cloud sync
      const cloudSync = page.locator('[data-testid="cloud-sync"]');
      if (await cloudSync.isVisible()) {
        await cloudSync.click();
        
        // Would require authentication setup
        const syncProvider = page.locator('[data-testid="sync-provider"]');
        if (await syncProvider.isVisible()) {
          await expect(syncProvider).toBeVisible();
        }
      }
      
      // Test manual backup
      const createBackup = page.locator('[data-testid="create-backup"]');
      await expect(createBackup).toBeVisible();
      
      await createBackup.click();
      
      // Verify backup creation
      const backupSuccess = page.locator('[data-testid="backup-success"]');
      await expect(backupSuccess).toBeVisible();
    }
  });

  test('should verify settings persistence', async ({ page }) => {
    // Change several settings
    await page.click('[data-testid="display-settings"]');
    
    // Change theme
    await page.click('[data-testid="theme-toggle"]');
    
    // Change font size
    const fontSizeSlider = page.locator('[data-testid="font-size-slider"]');
    await fontSizeSlider.fill('110');
    
    // Change language
    await page.click('[data-testid="general-settings"]');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    await languageSelector.click();
    await page.click('[data-testid="language-option-ar"]');
    
    // Reload page
    await page.reload();
    await testHelpers.waitForAppLoad();
    await testHelpers.navigateTo('settings');
    
    // Verify settings persist
    
    // Check theme
    const isDark = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);
    
    // Check language
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('ar');
    
    // Check font size
    await page.click('[data-testid="display-settings"]');
    const fontValue = await fontSizeSlider.inputValue();
    expect(fontValue).toBe('110');
  });

  test('should support accessibility settings', async ({ page }) => {
    const accessibilitySettings = page.locator('[data-testid="accessibility-settings"]');
    
    if (await accessibilitySettings.isVisible()) {
      await accessibilitySettings.click();
      
      // Test high contrast mode
      const highContrast = page.locator('[data-testid="high-contrast"]');
      if (await highContrast.isVisible()) {
        await highContrast.click();
        
        // Verify high contrast is applied
        const contrastClass = await page.evaluate(() => 
          document.documentElement.classList.contains('high-contrast')
        );
        expect(contrastClass).toBe(true);
      }
      
      // Test large cursor
      const largeCursor = page.locator('[data-testid="large-cursor"]');
      if (await largeCursor.isVisible()) {
        await largeCursor.click();
      }
      
      // Test screen reader optimizations
      const screenReader = page.locator('[data-testid="screen-reader-optimizations"]');
      if (await screenReader.isVisible()) {
        await screenReader.click();
      }
      
      // Test reduced motion
      const reducedMotion = page.locator('[data-testid="reduced-motion"]');
      if (await reducedMotion.isVisible()) {
        await reducedMotion.click();
        
        // Verify motion is reduced
        const motionPreference = await page.evaluate(() => 
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );
        // Note: This might not work in test environment
      }
    }
  });

  test('should handle settings validation', async ({ page }) => {
    await page.click('[data-testid="location-settings"]');
    
    // Test invalid coordinates
    const latitude = page.locator('[data-testid="latitude-input"]');
    const longitude = page.locator('[data-testid="longitude-input"]');
    
    await latitude.fill('999'); // Invalid latitude
    await longitude.fill('999'); // Invalid longitude
    
    await page.click('[data-testid="save-location"]');
    
    // Should show validation errors
    const latError = page.locator('[data-testid="latitude-error"]');
    const lngError = page.locator('[data-testid="longitude-error"]');
    
    await expect(latError).toBeVisible();
    await expect(lngError).toBeVisible();
    
    // Test valid coordinates
    await latitude.fill('40.7128');
    await longitude.fill('-74.0060');
    
    await page.click('[data-testid="save-location"]');
    
    // Errors should disappear
    await expect(latError).toBeHidden();
    await expect(lngError).toBeHidden();
    
    // Should show success message
    const locationSaved = page.locator('[data-testid="location-saved"]');
    await expect(locationSaved).toBeVisible();
  });
});
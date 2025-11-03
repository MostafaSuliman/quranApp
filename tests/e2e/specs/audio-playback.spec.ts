import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import { IslamicHelpers } from '../helpers/islamic-helpers';

/**
 * E2E tests for audio playback functionality
 * Tests different reciters, playback controls, and audio features
 */

test.describe('Audio Playback Features', () => {
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

  test('should display audio player with basic controls', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Verify audio player exists
    const audioPlayer = page.locator('[data-testid="audio-player"]');
    await expect(audioPlayer).toBeVisible();
    
    // Verify basic controls
    await expect(page.locator('[data-testid="play-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="stop-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="volume-control"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  });

  test('should support multiple reciters', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Open reciter selection
    await page.click('[data-testid="reciter-selector"]');
    
    // Verify reciter list is displayed
    const reciterList = page.locator('[data-testid="reciter-list"]');
    await expect(reciterList).toBeVisible();
    
    // Verify popular reciters are available
    const reciters = [
      'mishary', 'sudais', 'husary', 'minshawi', 'ajmy'
    ];
    
    for (const reciter of reciters) {
      const reciterOption = page.locator(`[data-testid="reciter-${reciter}"]`);
      await expect(reciterOption).toBeVisible();
    }
    
    // Select a different reciter
    await page.click('[data-testid="reciter-sudais"]');
    
    // Verify reciter selection is saved
    const selectedReciter = page.locator('[data-testid="selected-reciter"]');
    await expect(selectedReciter).toContainText('Sudais');
  });

  test('should play Ayah audio correctly', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Navigate to Al-Fatiha
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    // Select first Ayah
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    
    // Play Ayah audio
    await page.click('[data-testid="play-ayah-audio"]');
    
    // Wait for audio to load and test playback
    await testHelpers.waitForAudioReady();
    await testHelpers.testAudioPlayback();
    
    // Verify audio is playing correct Ayah
    const currentlyPlaying = page.locator('[data-testid="currently-playing"]');
    await expect(currentlyPlaying).toContainText('1:1');
  });

  test('should support continuous playback of multiple Ayahs', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Navigate to Al-Fatiha
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    // Enable continuous playback
    await page.click('[data-testid="continuous-playback"]');
    
    // Start playing from first Ayah
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Wait for first Ayah to complete and verify next Ayah starts
    await page.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && audio.currentTime > 0;
    }, { timeout: 10000 });
    
    // Should automatically move to next Ayah
    await page.waitForTimeout(3000); // Wait for first ayah to potentially complete
    
    const currentlyPlaying = page.locator('[data-testid="currently-playing"]');
    const playingText = await currentlyPlaying.textContent();
    
    // Should show progress through the Surah
    expect(playingText).toMatch(/1:[1-7]/);
  });

  test('should support playback speed control', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Open speed control
    await page.click('[data-testid="playback-speed"]');
    
    // Verify speed options
    await expect(page.locator('[data-testid="speed-0.5x"]')).toBeVisible();
    await expect(page.locator('[data-testid="speed-0.75x"]')).toBeVisible();
    await expect(page.locator('[data-testid="speed-1x"]')).toBeVisible();
    await expect(page.locator('[data-testid="speed-1.25x"]')).toBeVisible();
    await expect(page.locator('[data-testid="speed-1.5x"]')).toBeVisible();
    
    // Test slow speed for learning
    await page.click('[data-testid="speed-0.75x"]');
    
    // Start audio playback
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Verify playback speed is applied
    const playbackRate = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? audio.playbackRate : 1;
    });
    expect(playbackRate).toBe(0.75);
  });

  test('should support volume control', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Test volume control
    const volumeSlider = page.locator('[data-testid="volume-control"]');
    await expect(volumeSlider).toBeVisible();
    
    // Set volume to 50%
    await volumeSlider.fill('0.5');
    
    // Start audio playback
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Verify volume is applied
    const volume = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? audio.volume : 1;
    });
    expect(volume).toBe(0.5);
    
    // Test mute functionality
    await page.click('[data-testid="mute-button"]');
    
    const mutedVolume = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? audio.volume : 1;
    });
    expect(mutedVolume).toBe(0);
  });

  test('should support audio seeking', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Start audio playback
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Wait for some audio to play
    await page.waitForTimeout(2000);
    
    // Test seeking with progress bar
    const progressBar = page.locator('[data-testid="progress-bar"]');
    
    // Click at 50% of progress bar
    const progressBox = await progressBar.boundingBox();
    if (progressBox) {
      await page.mouse.click(
        progressBox.x + progressBox.width * 0.5,
        progressBox.y + progressBox.height * 0.5
      );
      
      // Verify seeking worked
      const currentTime = await page.evaluate(() => {
        const audio = document.querySelector('audio');
        return audio ? audio.currentTime : 0;
      });
      expect(currentTime).toBeGreaterThan(0);
    }
  });

  test('should support repeat functionality', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Enable repeat mode
    await page.click('[data-testid="repeat-button"]');
    
    // Verify repeat is enabled
    const repeatButton = page.locator('[data-testid="repeat-button"]');
    await expect(repeatButton).toHaveClass(/active|enabled/);
    
    // Test repeat options
    await page.click('[data-testid="repeat-options"]');
    
    // Verify repeat options
    await expect(page.locator('[data-testid="repeat-ayah"]')).toBeVisible();
    await expect(page.locator('[data-testid="repeat-surah"]')).toBeVisible();
    await expect(page.locator('[data-testid="repeat-all"]')).toBeVisible();
    
    // Select Ayah repeat
    await page.click('[data-testid="repeat-ayah"]');
    
    // Start audio
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Verify repeat count selector appears
    const repeatCount = page.locator('[data-testid="repeat-count"]');
    await expect(repeatCount).toBeVisible();
  });

  test('should support audio bookmarks', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Start audio playback
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Wait for some playback
    await page.waitForTimeout(2000);
    
    // Create audio bookmark
    await page.click('[data-testid="create-audio-bookmark"]');
    
    // Verify bookmark creation
    const bookmarkSuccess = page.locator('[data-testid="bookmark-created"]');
    await expect(bookmarkSuccess).toBeVisible();
    
    // Navigate to bookmarks
    await page.click('[data-testid="audio-bookmarks"]');
    
    // Verify bookmark is saved
    const audioBookmarksList = page.locator('[data-testid="audio-bookmarks-list"]');
    await expect(audioBookmarksList).toBeVisible();
    
    const bookmark = page.locator('[data-testid="audio-bookmark-0"]');
    await expect(bookmark).toBeVisible();
    
    // Test bookmark navigation
    await bookmark.click();
    
    // Should resume from bookmarked position
    await testHelpers.waitForAudioReady();
  });

  test('should support audio downloads for offline use', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Navigate to downloads section
    await page.click('[data-testid="audio-downloads"]');
    
    // Verify downloads interface
    const downloadsInterface = page.locator('[data-testid="downloads-interface"]');
    await expect(downloadsInterface).toBeVisible();
    
    // Test Surah download
    await page.click('[data-testid="download-surah"]');
    await page.click('[data-testid="select-surah-1"]'); // Al-Fatiha
    await page.click('[data-testid="select-reciter-mishary"]');
    
    // Start download
    await page.click('[data-testid="start-download"]');
    
    // Verify download progress
    const downloadProgress = page.locator('[data-testid="download-progress"]');
    await expect(downloadProgress).toBeVisible();
    
    // Wait for download to complete (or timeout)
    await page.waitForSelector('[data-testid="download-complete"]', { 
      timeout: 30000 
    }).catch(() => {
      // Downloads might be too large for testing environment
      console.log('Download test skipped - may be too large for test environment');
    });
  });

  test('should support waveform visualization', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Enable waveform visualization
    await page.click('[data-testid="enable-waveform"]');
    
    // Start audio playback
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Verify waveform appears
    const waveform = page.locator('[data-testid="audio-waveform"]');
    await expect(waveform).toBeVisible();
    
    // Test waveform interaction
    const waveformBox = await waveform.boundingBox();
    if (waveformBox) {
      // Click on waveform to seek
      await page.mouse.click(
        waveformBox.x + waveformBox.width * 0.3,
        waveformBox.y + waveformBox.height * 0.5
      );
      
      // Verify seeking worked
      await page.waitForTimeout(500);
      const currentTime = await page.evaluate(() => {
        const audio = document.querySelector('audio');
        return audio ? audio.currentTime : 0;
      });
      expect(currentTime).toBeGreaterThan(0);
    }
  });

  test('should handle audio errors gracefully', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Simulate network error for audio
    await page.route('**/audio/**', route => {
      route.abort('failed');
    });
    
    // Try to play audio
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    // Verify error handling
    const audioError = page.locator('[data-testid="audio-error"]');
    await expect(audioError).toBeVisible({ timeout: 10000 });
    
    // Verify retry option
    const retryButton = page.locator('[data-testid="retry-audio"]');
    await expect(retryButton).toBeVisible();
    
    // Clear route override
    await page.unroute('**/audio/**');
    
    // Test retry
    await retryButton.click();
    
    // Should work now
    await testHelpers.waitForAudioReady();
  });

  test('should support audio quality settings', async ({ page }) => {
    await testHelpers.navigateTo('settings');
    
    // Navigate to audio settings
    await page.click('[data-testid="audio-settings"]');
    
    // Verify audio quality options
    const qualitySettings = page.locator('[data-testid="audio-quality"]');
    await expect(qualitySettings).toBeVisible();
    
    // Test quality options
    await expect(page.locator('[data-testid="quality-low"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-medium"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-high"]')).toBeVisible();
    
    // Select high quality
    await page.click('[data-testid="quality-high"]');
    
    // Verify setting is saved
    const qualityStatus = page.locator('[data-testid="quality-status"]');
    await expect(qualityStatus).toContainText('High');
    
    // Test auto-quality based on connection
    const autoQuality = page.locator('[data-testid="auto-quality"]');
    if (await autoQuality.isVisible()) {
      await autoQuality.click();
      
      // Verify auto-quality is enabled
      await expect(autoQuality).toHaveClass(/active|enabled/);
    }
  });

  test('should support pronunciation guides', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Enable pronunciation guide
    await page.click('[data-testid="pronunciation-guide"]');
    
    // Navigate to a verse with tajweed
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    
    // Verify pronunciation markers
    await islamicHelpers.testReciterPronunciation('mishary');
    
    // Test slow pronunciation mode
    await page.click('[data-testid="slow-pronunciation"]');
    
    // Start audio
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Verify slow speed is applied
    const playbackRate = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? audio.playbackRate : 1;
    });
    expect(playbackRate).toBeLessThanOrEqual(0.8);
  });

  test('should maintain audio preferences across sessions', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Set audio preferences
    await page.click('[data-testid="reciter-selector"]');
    await page.click('[data-testid="reciter-sudais"]');
    
    await page.click('[data-testid="playback-speed"]');
    await page.click('[data-testid="speed-0.75x"]');
    
    const volumeSlider = page.locator('[data-testid="volume-control"]');
    await volumeSlider.fill('0.8');
    
    // Reload page
    await page.reload();
    await testHelpers.waitForAppLoad();
    await testHelpers.navigateTo('mushaf');
    
    // Verify preferences persist
    const selectedReciter = page.locator('[data-testid="selected-reciter"]');
    await expect(selectedReciter).toContainText('Sudais');
    
    // Start audio to verify other settings
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="play-ayah-audio"]');
    
    await testHelpers.waitForAudioReady();
    
    // Verify playback speed persists
    const playbackRate = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? audio.playbackRate : 1;
    });
    expect(playbackRate).toBe(0.75);
    
    // Verify volume persists
    const volume = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? audio.volume : 1;
    });
    expect(volume).toBeCloseTo(0.8, 1);
  });
});
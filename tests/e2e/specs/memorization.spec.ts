import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import { IslamicHelpers } from '../helpers/islamic-helpers';

/**
 * E2E tests for Quran memorization features
 * Tests memorization tools, progress tracking, and spaced repetition
 */

test.describe('Memorization Features', () => {
  let testHelpers: TestHelpers;
  let islamicHelpers: IslamicHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    islamicHelpers = new IslamicHelpers(page);
    
    // Set up user session with memorization goals
    await testHelpers.createUserSession({ 
      completedOnboarding: true,
      language: 'en',
      theme: 'light'
    });
    
    await page.goto('/');
    await testHelpers.waitForAppLoad();
  });

  test('should access memorization mode from Mushaf reader', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    
    // Switch to memorization mode
    await page.click('[data-testid="memorization-mode"]');
    
    // Verify memorization interface appears
    const memorizationPanel = page.locator('[data-testid="memorization-panel"]');
    await expect(memorizationPanel).toBeVisible();
    
    // Verify memorization controls
    await expect(page.locator('[data-testid="hide-text-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="reveal-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="practice-mode"]')).toBeVisible();
    await expect(page.locator('[data-testid="memorization-progress"]')).toBeVisible();
  });

  test('should support text hiding and revealing for memorization', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Select Al-Fatiha for memorization
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    // Hide text for memorization practice
    await page.click('[data-testid="hide-text-button"]');
    
    // Verify text is hidden
    const hiddenText = page.locator('[data-testid="quran-text-hidden"]');
    await expect(hiddenText).toBeVisible();
    
    // Test partial reveal (word by word)
    await page.click('[data-testid="reveal-word"]');
    
    // Verify first word is revealed
    const revealedWord = page.locator('[data-testid="revealed-word-0"]');
    await expect(revealedWord).toBeVisible();
    
    // Reveal next word
    await page.click('[data-testid="reveal-next-word"]');
    
    // Verify second word is revealed
    const secondWord = page.locator('[data-testid="revealed-word-1"]');
    await expect(secondWord).toBeVisible();
    
    // Reveal entire verse
    await page.click('[data-testid="reveal-verse"]');
    
    // Verify full verse is visible
    const fullVerse = page.locator('[data-testid="ayah-1-1"]');
    await expect(fullVerse).toBeVisible();
    await expect(fullVerse).not.toHaveClass(/hidden/);
  });

  test('should track memorization progress', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Start memorizing Al-Fatiha
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    // Mark verse as memorized
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    await page.click('[data-testid="mark-memorized"]');
    
    // Verify memorization status is saved
    const memorizedIndicator = page.locator('[data-testid="memorized-indicator-1-1"]');
    await expect(memorizedIndicator).toBeVisible();
    
    // Check progress tracking
    const progressBar = page.locator('[data-testid="memorization-progress-bar"]');
    const progressText = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(progressText || '0')).toBeGreaterThan(0);
    
    // Navigate to progress page
    await testHelpers.navigateTo('progress');
    
    // Verify memorization progress is displayed
    const memorizationSection = page.locator('[data-testid="memorization-progress-section"]');
    await expect(memorizationSection).toBeVisible();
    
    const progressDisplay = page.locator('[data-testid="verses-memorized"]');
    await expect(progressDisplay).toContainText('1'); // 1 verse memorized
  });

  test('should support spaced repetition system', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Mark several verses as memorized
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    // Mark multiple ayahs
    for (let i = 1; i <= 3; i++) {
      const ayah = page.locator(`[data-testid="ayah-1-${i}"]`);
      await ayah.click();
      await page.click('[data-testid="mark-memorized"]');
      await page.waitForTimeout(500);
    }
    
    // Open review scheduler
    await page.click('[data-testid="review-scheduler"]');
    
    // Verify review items are scheduled
    const reviewItems = page.locator('[data-testid="review-items"]');
    await expect(reviewItems).toBeVisible();
    
    const reviewCount = await page.locator('[data-testid="review-item"]').count();
    expect(reviewCount).toBeGreaterThan(0);
    
    // Start review session
    await page.click('[data-testid="start-review"]');
    
    // Verify review interface
    const reviewInterface = page.locator('[data-testid="review-interface"]');
    await expect(reviewInterface).toBeVisible();
    
    // Test review options
    await expect(page.locator('[data-testid="review-easy"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-good"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-hard"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-again"]')).toBeVisible();
  });

  test('should support different memorization techniques', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Test repetition mode
    await page.click('[data-testid="memorization-technique"]');
    await page.click('[data-testid="technique-repetition"]');
    
    // Verify repetition controls
    await expect(page.locator('[data-testid="repeat-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="repeat-audio"]')).toBeVisible();
    
    // Test chunking mode (breaking verses into smaller parts)
    await page.click('[data-testid="memorization-technique"]');
    await page.click('[data-testid="technique-chunking"]');
    
    // Verify chunking interface
    const chunkControls = page.locator('[data-testid="chunk-controls"]');
    await expect(chunkControls).toBeVisible();
    
    await expect(page.locator('[data-testid="chunk-size"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-chunk"]')).toBeVisible();
    
    // Test progressive revelation
    await page.click('[data-testid="memorization-technique"]');
    await page.click('[data-testid="technique-progressive"]');
    
    // Verify progressive interface
    const progressiveMode = page.locator('[data-testid="progressive-mode"]');
    await expect(progressiveMode).toBeVisible();
  });

  test('should integrate with audio for memorization', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Select verse for memorization
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    const firstAyah = page.locator('[data-testid="ayah-1-1"]');
    await firstAyah.click();
    
    // Test audio repetition for memorization
    await page.click('[data-testid="memorization-audio"]');
    
    // Verify audio controls for memorization
    await expect(page.locator('[data-testid="repeat-audio-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="slow-recitation"]')).toBeVisible();
    await expect(page.locator('[data-testid="repeat-count-selector"]')).toBeVisible();
    
    // Set repeat count
    await page.click('[data-testid="repeat-count-selector"]');
    await page.click('[data-testid="repeat-count-3"]');
    
    // Start repetitive audio
    await page.click('[data-testid="repeat-audio-button"]');
    
    // Wait for audio to load and start
    await testHelpers.waitForAudioReady();
    
    // Verify audio is playing
    await page.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && !audio.paused;
    }, { timeout: 5000 });
    
    // Test slow recitation mode
    await page.click('[data-testid="slow-recitation"]');
    
    // Verify playback speed is reduced
    const playbackSpeed = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? audio.playbackRate : 1;
    });
    expect(playbackSpeed).toBeLessThan(1);
  });

  test('should support memorization challenges and goals', async ({ page }) => {
    await testHelpers.navigateTo('progress');
    
    // Navigate to memorization goals
    await page.click('[data-testid="memorization-goals"]');
    
    // Verify goals interface
    const goalsSection = page.locator('[data-testid="goals-section"]');
    await expect(goalsSection).toBeVisible();
    
    // Set a new memorization goal
    await page.click('[data-testid="add-goal"]');
    await page.click('[data-testid="goal-type-surah"]');
    await page.click('[data-testid="select-surah"]');
    await page.click('[data-testid="surah-option-67"]'); // Al-Mulk
    
    // Set deadline
    await page.fill('[data-testid="goal-deadline"]', '2024-12-31');
    await page.click('[data-testid="save-goal"]');
    
    // Verify goal is created
    const newGoal = page.locator('[data-testid="goal-surah-67"]');
    await expect(newGoal).toBeVisible();
    
    // Test daily challenge
    await page.click('[data-testid="daily-challenge"]');
    
    // Verify challenge is displayed
    const challengeCard = page.locator('[data-testid="challenge-card"]');
    await expect(challengeCard).toBeVisible();
    
    // Complete challenge
    await page.click('[data-testid="start-challenge"]');
    
    // Verify challenge interface
    const challengeInterface = page.locator('[data-testid="challenge-interface"]');
    await expect(challengeInterface).toBeVisible();
  });

  test('should track memorization streaks and statistics', async ({ page }) => {
    await testHelpers.navigateTo('progress');
    
    // Navigate to memorization statistics
    await page.click('[data-testid="memorization-stats"]');
    
    // Verify statistics are displayed
    const statsSection = page.locator('[data-testid="stats-section"]');
    await expect(statsSection).toBeVisible();
    
    // Check streak counter
    const streakCounter = page.locator('[data-testid="memorization-streak"]');
    await expect(streakCounter).toBeVisible();
    
    // Check verses per day chart
    const versesChart = page.locator('[data-testid="verses-per-day-chart"]');
    await expect(versesChart).toBeVisible();
    
    // Check accuracy metrics
    const accuracyMetrics = page.locator('[data-testid="accuracy-metrics"]');
    await expect(accuracyMetrics).toBeVisible();
    
    // Test time-based statistics
    await page.click('[data-testid="time-period-week"]');
    await page.waitForTimeout(500);
    
    // Verify chart updates
    await expect(versesChart).toBeVisible();
    
    // Test monthly view
    await page.click('[data-testid="time-period-month"]');
    await page.waitForTimeout(500);
    
    await expect(versesChart).toBeVisible();
  });

  test('should support collaborative memorization features', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Check if study groups feature exists
    const studyGroups = page.locator('[data-testid="study-groups"]');
    
    if (await studyGroups.isVisible()) {
      await studyGroups.click();
      
      // Verify study groups interface
      const groupsInterface = page.locator('[data-testid="groups-interface"]');
      await expect(groupsInterface).toBeVisible();
      
      // Test joining a group
      const joinButton = page.locator('[data-testid="join-group"]').first();
      if (await joinButton.isVisible()) {
        await joinButton.click();
        
        // Verify join confirmation
        const joinConfirmation = page.locator('[data-testid="join-confirmation"]');
        await expect(joinConfirmation).toBeVisible();
      }
    }
    
    // Test memorization buddy feature
    const buddyFeature = page.locator('[data-testid="memorization-buddy"]');
    
    if (await buddyFeature.isVisible()) {
      await buddyFeature.click();
      
      // Verify buddy interface
      const buddyInterface = page.locator('[data-testid="buddy-interface"]');
      await expect(buddyInterface).toBeVisible();
    }
  });

  test('should handle memorization assessment and testing', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Navigate to assessment
    await page.click('[data-testid="memorization-test"]');
    
    // Verify assessment interface
    const assessmentInterface = page.locator('[data-testid="assessment-interface"]');
    await expect(assessmentInterface).toBeVisible();
    
    // Select test type
    await page.click('[data-testid="test-type-completion"]');
    
    // Select test scope
    await page.click('[data-testid="test-scope-surah"]');
    await page.click('[data-testid="select-test-surah"]');
    await page.click('[data-testid="surah-option-1"]'); // Al-Fatiha
    
    // Start test
    await page.click('[data-testid="start-test"]');
    
    // Verify test interface
    const testInterface = page.locator('[data-testid="test-interface"]');
    await expect(testInterface).toBeVisible();
    
    // Test partial text with missing words
    const missingWords = page.locator('[data-testid="missing-word"]');
    expect(await missingWords.count()).toBeGreaterThan(0);
    
    // Fill in missing word
    const firstMissingWord = missingWords.first();
    await firstMissingWord.click();
    await page.keyboard.type('بِسْمِ');
    
    // Submit test
    await page.click('[data-testid="submit-test"]');
    
    // Verify results
    const testResults = page.locator('[data-testid="test-results"]');
    await expect(testResults).toBeVisible();
    
    // Check score
    const score = page.locator('[data-testid="test-score"]');
    await expect(score).toBeVisible();
  });

  test('should support memorization backup and sync', async ({ page }) => {
    await testHelpers.navigateTo('settings');
    
    // Navigate to memorization settings
    await page.click('[data-testid="memorization-settings"]');
    
    // Verify backup options
    const backupSection = page.locator('[data-testid="backup-section"]');
    await expect(backupSection).toBeVisible();
    
    // Test manual backup
    await page.click('[data-testid="create-backup"]');
    
    // Verify backup creation
    const backupSuccess = page.locator('[data-testid="backup-success"]');
    await expect(backupSuccess).toBeVisible();
    
    // Test restore functionality
    const restoreSection = page.locator('[data-testid="restore-section"]');
    await expect(restoreSection).toBeVisible();
    
    // Check auto-sync settings
    const autoSync = page.locator('[data-testid="auto-sync-toggle"]');
    if (await autoSync.isVisible()) {
      await autoSync.click();
      
      // Verify sync status
      const syncStatus = page.locator('[data-testid="sync-status"]');
      await expect(syncStatus).toBeVisible();
    }
  });

  test('should maintain memorization data across sessions', async ({ page }) => {
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Mark a verse as memorized
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    const ayah = page.locator('[data-testid="ayah-1-2"]');
    await ayah.click();
    await page.click('[data-testid="mark-memorized"]');
    
    // Verify memorization is marked
    const memorizedIndicator = page.locator('[data-testid="memorized-indicator-1-2"]');
    await expect(memorizedIndicator).toBeVisible();
    
    // Reload page
    await page.reload();
    await testHelpers.waitForAppLoad();
    await testHelpers.navigateTo('mushaf');
    await page.click('[data-testid="memorization-mode"]');
    
    // Verify memorization persists
    await page.click('[data-testid="surah-navigator"]');
    await page.click('[data-testid="surah-1"]');
    
    const persistedIndicator = page.locator('[data-testid="memorized-indicator-1-2"]');
    await expect(persistedIndicator).toBeVisible();
  });
});
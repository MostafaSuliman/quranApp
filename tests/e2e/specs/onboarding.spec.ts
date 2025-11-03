import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import { IslamicHelpers } from '../helpers/islamic-helpers';

/**
 * E2E tests for QuranApp onboarding flow
 * Tests the complete user onboarding experience
 */

test.describe('Onboarding Flow', () => {
  let testHelpers: TestHelpers;
  let islamicHelpers: IslamicHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    islamicHelpers = new IslamicHelpers(page);
    
    // Start fresh for each test
    await page.goto('/');
    await testHelpers.waitForAppLoad();
  });

  test('should complete onboarding flow for new user', async ({ page }) => {
    // Verify splash screen appears and disappears
    const splashScreen = page.locator('[data-testid="splash-screen"]');
    await expect(splashScreen).toBeVisible();
    await expect(splashScreen).toBeHidden({ timeout: 5000 });
    
    // Should show onboarding for new user
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Step 1: Welcome and language selection
    await expect(page.locator('[data-testid="onboarding-welcome"]')).toBeVisible();
    await expect(page.locator('[data-testid="language-selection"]')).toBeVisible();
    
    // Test language options
    await expect(page.locator('[data-testid="language-english"]')).toBeVisible();
    await expect(page.locator('[data-testid="language-arabic"]')).toBeVisible();
    
    // Select English
    await page.click('[data-testid="language-english"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Step 2: Experience level selection
    await expect(page.locator('[data-testid="experience-selection"]')).toBeVisible();
    
    // Test experience options
    await expect(page.locator('[data-testid="experience-beginner"]')).toBeVisible();
    await expect(page.locator('[data-testid="experience-intermediate"]')).toBeVisible();
    await expect(page.locator('[data-testid="experience-advanced"]')).toBeVisible();
    
    // Select beginner
    await page.click('[data-testid="experience-beginner"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Step 3: Goals and interests
    await expect(page.locator('[data-testid="goals-selection"]')).toBeVisible();
    
    // Test goal options
    await expect(page.locator('[data-testid="goal-memorization"]')).toBeVisible();
    await expect(page.locator('[data-testid="goal-recitation"]')).toBeVisible();
    await expect(page.locator('[data-testid="goal-understanding"]')).toBeVisible();
    await expect(page.locator('[data-testid="goal-reflection"]')).toBeVisible();
    
    // Select multiple goals
    await page.click('[data-testid="goal-memorization"]');
    await page.click('[data-testid="goal-recitation"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Step 4: Daily commitment
    await expect(page.locator('[data-testid="commitment-selection"]')).toBeVisible();
    
    // Select commitment level
    await page.click('[data-testid="commitment-15min"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Step 5: Notification preferences
    await expect(page.locator('[data-testid="notification-preferences"]')).toBeVisible();
    
    // Enable prayer time notifications
    await page.click('[data-testid="enable-prayer-notifications"]');
    await page.click('[data-testid="enable-study-reminders"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Step 6: Complete onboarding
    await expect(page.locator('[data-testid="onboarding-complete"]')).toBeVisible();
    await page.click('[data-testid="complete-onboarding"]');
    
    // Verify onboarding completion
    await expect(onboardingPage).toBeHidden({ timeout: 5000 });
    
    // Should navigate to home page
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    
    // Verify user preferences were saved
    const preferences = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('user-preferences') || '{}');
    });
    
    expect(preferences.language).toBe('en');
    expect(preferences.experience).toBe('beginner');
    expect(preferences.goals).toContain('memorization');
    expect(preferences.goals).toContain('recitation');
  });

  test('should handle Arabic language onboarding', async ({ page }) => {
    // Complete onboarding in Arabic
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Select Arabic language
    await page.click('[data-testid="language-arabic"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Verify UI switches to RTL
    const direction = await page.evaluate(() => 
      window.getComputedStyle(document.documentElement).direction
    );
    expect(direction).toBe('rtl');
    
    // Continue with Arabic interface
    await page.click('[data-testid="experience-intermediate"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Verify Arabic text is displayed correctly
    await islamicHelpers.verifyArabicTextRendering('[data-testid="goals-title"]');
    
    // Complete onboarding
    await page.click('[data-testid="goal-understanding"]');
    await page.click('[data-testid="onboarding-next"]');
    await page.click('[data-testid="commitment-30min"]');
    await page.click('[data-testid="onboarding-next"]');
    await page.click('[data-testid="enable-prayer-notifications"]');
    await page.click('[data-testid="onboarding-next"]');
    await page.click('[data-testid="complete-onboarding"]');
    
    // Verify completion
    await expect(onboardingPage).toBeHidden({ timeout: 5000 });
    
    // Verify language persists
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('ar');
  });

  test('should allow skipping onboarding', async ({ page }) => {
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Check if skip option is available
    const skipButton = page.locator('[data-testid="skip-onboarding"]');
    
    if (await skipButton.isVisible()) {
      await skipButton.click();
      
      // Confirm skip
      const confirmSkip = page.locator('[data-testid="confirm-skip"]');
      if (await confirmSkip.isVisible()) {
        await confirmSkip.click();
      }
      
      // Should go to home with default settings
      await expect(onboardingPage).toBeHidden({ timeout: 5000 });
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    }
  });

  test('should handle navigation between onboarding steps', async ({ page }) => {
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Go through first step
    await page.click('[data-testid="language-english"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Go to next step
    await page.click('[data-testid="experience-beginner"]');
    await page.click('[data-testid="onboarding-next"]');
    
    // Test back navigation
    const backButton = page.locator('[data-testid="onboarding-back"]');
    if (await backButton.isVisible()) {
      await backButton.click();
      
      // Should be back at experience selection
      await expect(page.locator('[data-testid="experience-selection"]')).toBeVisible();
      
      // Go forward again
      await page.click('[data-testid="onboarding-next"]');
      await expect(page.locator('[data-testid="goals-selection"]')).toBeVisible();
    }
  });

  test('should validate required selections', async ({ page }) => {
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Try to proceed without selecting language
    const nextButton = page.locator('[data-testid="onboarding-next"]');
    await nextButton.click();
    
    // Should show validation message
    const validationMessage = page.locator('[data-testid="validation-message"]');
    await expect(validationMessage).toBeVisible();
    
    // Select language and proceed
    await page.click('[data-testid="language-english"]');
    await nextButton.click();
    
    // Should proceed to next step
    await expect(page.locator('[data-testid="experience-selection"]')).toBeVisible();
  });

  test('should show progress indicator', async ({ page }) => {
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Verify progress indicator exists
    const progressIndicator = page.locator('[data-testid="onboarding-progress"]');
    await expect(progressIndicator).toBeVisible();
    
    // Check initial progress
    const progress = await progressIndicator.getAttribute('aria-valuenow');
    expect(parseInt(progress || '0')).toBeGreaterThanOrEqual(0);
    
    // Proceed through steps and verify progress increases
    await page.click('[data-testid="language-english"]');
    await page.click('[data-testid="onboarding-next"]');
    
    const newProgress = await progressIndicator.getAttribute('aria-valuenow');
    expect(parseInt(newProgress || '0')).toBeGreaterThan(parseInt(progress || '0'));
  });

  test('should support accessibility features', async ({ page }) => {
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Verify focus management
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test ARIA labels
    const languageOptions = page.locator('[data-testid*="language-"]');
    const firstOption = languageOptions.first();
    const ariaLabel = await firstOption.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    
    // Test screen reader announcements
    const announcement = page.locator('[aria-live="polite"]');
    if (await announcement.isVisible()) {
      const text = await announcement.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should persist partial progress', async ({ page }) => {
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Make some selections
    await page.click('[data-testid="language-english"]');
    await page.click('[data-testid="onboarding-next"]');
    await page.click('[data-testid="experience-intermediate"]');
    
    // Reload page to simulate browser refresh
    await page.reload();
    await testHelpers.waitForAppLoad();
    
    // Should resume from where we left off
    if (await onboardingPage.isVisible()) {
      // Check if progress was saved
      const experienceSelection = page.locator('[data-testid="experience-selection"]');
      const selectedExperience = page.locator('[data-testid="experience-intermediate"][aria-selected="true"]');
      
      await expect(experienceSelection).toBeVisible();
      await expect(selectedExperience).toBeVisible();
    }
  });

  test('should handle different device orientations on mobile', async ({ page, browserName }) => {
    // Skip on desktop browsers
    if (browserName !== 'Mobile Chrome' && browserName !== 'Mobile Safari') {
      test.skip();
    }
    
    const onboardingPage = page.locator('[data-testid="onboarding-page"]');
    await expect(onboardingPage).toBeVisible();
    
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(onboardingPage).toBeVisible();
    
    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(onboardingPage).toBeVisible();
    
    // Verify layout adapts
    const title = page.locator('[data-testid="onboarding-title"]');
    await expect(title).toBeVisible();
  });
});
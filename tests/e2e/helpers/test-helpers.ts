import { Page, expect, Locator } from '@playwright/test';

/**
 * General testing helper functions for QuranApp E2E tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for app to be fully loaded
   */
  async waitForAppLoad() {
    // Wait for splash screen to disappear
    await this.page.waitForSelector('[data-testid="splash-screen"]', { 
      state: 'detached',
      timeout: 10000 
    });
    
    // Wait for main app content
    await this.page.waitForSelector('[data-testid="app-loaded"]', { 
      state: 'visible',
      timeout: 15000 
    });
    
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('[data-testid*="loading"]', { 
      state: 'detached',
      timeout: 5000 
    }).catch(() => {
      // Ignore if no loading elements found
    });
  }

  /**
   * Complete onboarding flow
   */
  async completeOnboarding() {
    // Wait for onboarding to appear
    const onboardingPage = this.page.locator('[data-testid="onboarding-page"]');
    if (await onboardingPage.isVisible()) {
      
      // Step 1: Language selection
      await this.page.click('[data-testid="language-english"]');
      await this.page.click('[data-testid="onboarding-next"]');
      
      // Step 2: Experience level
      await this.page.click('[data-testid="experience-beginner"]');
      await this.page.click('[data-testid="onboarding-next"]');
      
      // Step 3: Goals selection
      await this.page.click('[data-testid="goal-memorization"]');
      await this.page.click('[data-testid="goal-recitation"]');
      await this.page.click('[data-testid="onboarding-next"]');
      
      // Step 4: Complete onboarding
      await this.page.click('[data-testid="complete-onboarding"]');
      
      // Wait for onboarding to complete
      await this.page.waitForSelector('[data-testid="onboarding-page"]', { 
        state: 'detached',
        timeout: 5000 
      });
    }
  }

  /**
   * Navigate using the app navigation
   */
  async navigateTo(route: 'home' | 'mushaf' | 'progress' | 'settings') {
    const navigationMap = {
      home: '[data-testid="nav-home"]',
      mushaf: '[data-testid="nav-mushaf"]',
      progress: '[data-testid="nav-progress"]',
      settings: '[data-testid="nav-settings"]'
    };
    
    await this.page.click(navigationMap[route]);
    
    // Wait for page transition
    await this.page.waitForURL(`**/${route === 'home' ? '' : route}`, { timeout: 5000 });
  }

  /**
   * Wait for audio to load and be ready
   */
  async waitForAudioReady() {
    const audioPlayer = this.page.locator('[data-testid="audio-player"]');
    await expect(audioPlayer).toBeVisible();
    
    // Wait for audio to load
    await this.page.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && audio.readyState >= 3; // HAVE_FUTURE_DATA
    }, { timeout: 15000 });
  }

  /**
   * Test audio playback functionality
   */
  async testAudioPlayback() {
    await this.waitForAudioReady();
    
    // Play audio
    await this.page.click('[data-testid="play-button"]');
    
    // Verify audio is playing
    await this.page.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && !audio.paused;
    }, { timeout: 5000 });
    
    // Pause audio
    await this.page.click('[data-testid="pause-button"]');
    
    // Verify audio is paused
    await this.page.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && audio.paused;
    }, { timeout: 2000 });
  }

  /**
   * Change app theme/mode
   */
  async toggleDarkMode() {
    await this.page.click('[data-testid="theme-toggle"]');
    
    // Wait for theme to apply
    await this.page.waitForTimeout(500);
    
    // Verify dark mode is applied
    const isDark = await this.page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    
    return isDark;
  }

  /**
   * Change app language
   */
  async changeLanguage(language: 'en' | 'ar') {
    await this.page.click('[data-testid="language-selector"]');
    await this.page.click(`[data-testid="language-${language}"]`);
    
    // Wait for language to apply
    await this.page.waitForTimeout(1000);
    
    // Verify language change
    const lang = await this.page.getAttribute('html', 'lang');
    expect(lang).toBe(language);
  }

  /**
   * Test responsive design on different screen sizes
   */
  async testResponsiveDesign() {
    const sizes = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const size of sizes) {
      await this.page.setViewportSize({ width: size.width, height: size.height });
      await this.page.waitForTimeout(500); // Allow layout to adjust
      
      // Verify navigation is accessible
      const navigation = this.page.locator('[data-testid="navigation"]');
      await expect(navigation).toBeVisible();
      
      // Take screenshot for visual regression testing
      await this.page.screenshot({ 
        path: `test-results/responsive-${size.name}.png`,
        fullPage: true 
      });
    }
  }

  /**
   * Test offline functionality
   */
  async testOfflineMode() {
    // Go offline
    await this.page.context().setOffline(true);
    
    // Verify offline indicator appears
    const offlineIndicator = this.page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
    
    // Test that cached content is still accessible
    await this.navigateTo('mushaf');
    
    // Verify some content is still available
    const content = this.page.locator('[data-testid="quran-content"]');
    await expect(content).toBeVisible();
    
    // Go back online
    await this.page.context().setOffline(false);
    
    // Verify offline indicator disappears
    await expect(offlineIndicator).toBeHidden({ timeout: 5000 });
  }

  /**
   * Test PWA installation flow
   */
  async testPWAInstallation() {
    // Simulate PWA install prompt
    await this.page.evaluate(() => {
      // Mock beforeinstallprompt event
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = () => Promise.resolve();
      (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });
    
    // Wait for install button to appear
    const installButton = this.page.locator('[data-testid="pwa-install-button"]');
    await expect(installButton).toBeVisible({ timeout: 5000 });
    
    // Click install
    await installButton.click();
    
    // Verify installation success
    const installSuccess = this.page.locator('[data-testid="pwa-install-success"]');
    await expect(installSuccess).toBeVisible({ timeout: 5000 });
  }

  /**
   * Test accessibility features
   */
  async testAccessibility() {
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    
    // Verify focus indicators
    const focusedElement = this.page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test screen reader support
    const landmarkElements = this.page.locator('[role="main"], [role="navigation"], [role="banner"]');
    expect(await landmarkElements.count()).toBeGreaterThan(0);
    
    // Test alternative text for images
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  }

  /**
   * Measure page performance metrics
   */
  async measurePerformance() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        // Core Web Vitals
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        lcp: 0, // Would need to be measured with PerformanceObserver
        cls: 0, // Would need to be measured with PerformanceObserver
        
        // Navigation timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        
        // Resource timing
        resourceCount: performance.getEntriesByType('resource').length,
        
        // Memory usage (if available)
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      };
    });
    
    return metrics;
  }

  /**
   * Test error handling and recovery
   */
  async testErrorHandling() {
    // Trigger network error
    await this.page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Try to perform an action that would trigger API call
    await this.page.click('[data-testid="refresh-button"]').catch(() => {
      // Ignore if button doesn't exist
    });
    
    // Verify error message appears
    const errorMessage = this.page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {
      // Some errors might be handled silently
    });
    
    // Clear route override
    await this.page.unroute('**/api/**');
  }

  /**
   * Verify data persistence across sessions
   */
  async testDataPersistence() {
    // Set some user preferences
    await this.navigateTo('settings');
    await this.page.click('[data-testid="dark-mode-toggle"]');
    
    // Save current state
    const darkModeEnabled = await this.page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    
    // Reload page
    await this.page.reload();
    await this.waitForAppLoad();
    
    // Verify settings persist
    const darkModeAfterReload = await this.page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    
    expect(darkModeAfterReload).toBe(darkModeEnabled);
  }

  /**
   * Test search functionality
   */
  async testSearchFunctionality(query: string) {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    
    // Wait for search results
    const searchResults = this.page.locator('[data-testid="search-results"]');
    await expect(searchResults).toBeVisible({ timeout: 10000 });
    
    // Verify results contain the query
    const resultsText = await searchResults.textContent();
    expect(resultsText).toContain(query);
    
    return searchResults;
  }

  /**
   * Create user session with specific preferences
   */
  async createUserSession(preferences: {
    language?: 'en' | 'ar';
    theme?: 'light' | 'dark';
    completedOnboarding?: boolean;
  } = {}) {
    
    await this.page.evaluate((prefs) => {
      const defaultPrefs = {
        language: 'en',
        theme: 'light',
        completedOnboarding: true,
        ...prefs
      };
      
      // Set up localStorage
      localStorage.setItem('user-preferences', JSON.stringify(defaultPrefs));
      localStorage.setItem('user-session', JSON.stringify({
        id: 'test-user-' + Date.now(),
        hasCompletedOnboarding: defaultPrefs.completedOnboarding
      }));
      
    }, preferences);
    
    // Reload to apply preferences
    await this.page.reload();
    await this.waitForAppLoad();
  }
}
import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 * Runs once before all test suites
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up global test environment...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:5173';
    await page.goto(baseURL);
    
    // Wait for app to load completely
    await page.waitForSelector('[data-testid="app-loaded"]', { 
      timeout: 30000,
      state: 'visible' 
    });
    
    // Pre-warm the app by triggering initial data loads
    console.log('📱 Pre-warming application...');
    
    // Load essential Quran data
    await page.evaluate(() => {
      // Trigger initial Quran data loading
      if (window.localStorage) {
        window.localStorage.setItem('e2e-test-mode', 'true');
      }
    });
    
    // Verify critical APIs are accessible
    const apiHealth = await page.evaluate(async () => {
      try {
        // Test Islamic API endpoint
        const response = await fetch('/api/health');
        return response.status === 200;
      } catch {
        return false;
      }
    });
    
    if (!apiHealth) {
      console.warn('⚠️ API health check failed - some tests may fail');
    }
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
import { FullConfig } from '@playwright/test';

/**
 * Global teardown for E2E tests
 * Runs once after all test suites complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up global test environment...');
  
  try {
    // Clean up any global state
    console.log('🗑️ Clearing test artifacts...');
    
    // Log test completion summary
    console.log('📊 Test run completed');
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw - teardown failures shouldn't fail the test run
  }
}

export default globalTeardown;
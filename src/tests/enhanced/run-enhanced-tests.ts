/**
 * Enhanced Test Execution Script
 *
 * Main entry point for running all enhanced test suites with comprehensive
 * reporting and Islamic content validation.
 */

import { EnhancedTestRunner, ENHANCED_TEST_CONFIG } from './enhanced-test-runner';

async function runEnhancedTestSuite() {
  console.log('🕌 QuranApp Enhanced Test Suite');
  console.log('🚀 Testing with Islamic Content Validation');
  console.log('='.repeat(50));

  try {
    // Initialize the enhanced test runner
    const testRunner = new EnhancedTestRunner(ENHANCED_TEST_CONFIG);

    // Run all test suites
    console.log('🔄 Initializing test environment...');
    const results = await testRunner.runAllSuites();

    // Get summary
    const summary = testRunner.getSummary();

    // Final summary
    console.log('\n🏁 Final Results Summary');
    console.log('='.repeat(30));
    console.log(`⏱️  Total Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    console.log(`📊 Success Rate: ${summary.successRate.toFixed(1)}%`);
    console.log(`🕌 Islamic Compliance: ${summary.islamicCompliance.toFixed(1)}%`);
    console.log(`🎯 Overall Status: ${summary.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);

    // Exit with appropriate code
    process.exit(summary.overallPassed ? 0 : 1);
  } catch (error) {
    console.error('💥 Enhanced test suite execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runEnhancedTestSuite().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runEnhancedTestSuite };

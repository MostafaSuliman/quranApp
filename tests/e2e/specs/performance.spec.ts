import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import { IslamicHelpers } from '../helpers/islamic-helpers';

/**
 * E2E tests for performance benchmarking
 * Tests loading times, responsiveness, memory usage, and performance metrics
 */

test.describe('Performance Benchmarking', () => {
  let testHelpers: TestHelpers;
  let islamicHelpers: IslamicHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    islamicHelpers = new IslamicHelpers(page);
    
    // Clear any existing performance data
    await page.evaluate(() => {
      performance.clearMarks();
      performance.clearMeasures();
      performance.clearResourceTimings();
    });
  });

  test('should meet Core Web Vitals benchmarks', async ({ page, browserName }) => {
    // Skip on certain browsers where performance APIs might not be fully supported
    if (browserName === 'webkit') {
      test.skip();
    }

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Collect Core Web Vitals metrics
        const metrics: any = {};
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay would need user interaction
        // Cumulative Layout Shift (CLS)
        new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          metrics.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // First Contentful Paint (FCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            metrics.fcp = fcpEntry.startTime;
          }
        }).observe({ entryTypes: ['paint'] });
        
        // Give some time for metrics to be collected
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
          metrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
          resolve(metrics);
        }, 3000);
      });
    });

    await page.goto('/');
    await testHelpers.waitForAppLoad();
    
    const coreWebVitals = await testHelpers.measurePerformance();
    
    // Core Web Vitals thresholds (Good ratings)
    // LCP should be < 2.5s (2500ms)
    if (coreWebVitals.lcp > 0) {
      expect(coreWebVitals.lcp).toBeLessThan(2500);
    }
    
    // FCP should be < 1.8s (1800ms)
    if (coreWebVitals.fcp > 0) {
      expect(coreWebVitals.fcp).toBeLessThan(1800);
    }
    
    // DOM Content Loaded should be < 1.5s
    expect(coreWebVitals.domContentLoaded).toBeLessThan(1500);
    
    // Full load should be < 3s
    expect(coreWebVitals.loadComplete).toBeLessThan(3000);
    
    console.log('Performance Metrics:', coreWebVitals);
  });

  test('should have efficient resource loading', async ({ page }) => {
    await page.goto('/');
    await testHelpers.waitForAppLoad();
    
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const metrics = {
        totalResources: resources.length,
        imageResources: 0,
        scriptResources: 0,
        stylesheetResources: 0,
        fontResources: 0,
        totalSize: 0,
        slowResources: [],
        blockedTime: 0
      };
      
      resources.forEach(resource => {
        const loadTime = resource.responseEnd - resource.requestStart;
        
        // Categorize resources
        if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
          metrics.imageResources++;
        } else if (resource.name.match(/\.(js|ts)$/)) {
          metrics.scriptResources++;
        } else if (resource.name.match(/\.(css)$/)) {
          metrics.stylesheetResources++;
        } else if (resource.name.match(/\.(woff|woff2|ttf|eot)$/)) {
          metrics.fontResources++;
        }
        
        // Track slow resources (>1s)
        if (loadTime > 1000) {
          metrics.slowResources.push({
            name: resource.name.split('/').pop(),
            loadTime: Math.round(loadTime)
          });
        }
        
        // Estimate blocked time
        if (resource.renderBlockingStatus === 'blocking') {
          metrics.blockedTime += loadTime;
        }
        
        // Estimate size (transfer size if available)
        if (resource.transferSize) {
          metrics.totalSize += resource.transferSize;
        }
      });
      
      return metrics;
    });
    
    console.log('Resource Metrics:', resourceMetrics);
    
    // Performance assertions
    expect(resourceMetrics.totalResources).toBeLessThan(100); // Reasonable resource count
    expect(resourceMetrics.slowResources.length).toBeLessThan(5); // Max 5 slow resources
    expect(resourceMetrics.blockedTime).toBeLessThan(1000); // Max 1s of blocking time
    
    // Bundle size should be reasonable (estimate)
    const estimatedBundleSize = resourceMetrics.totalSize / 1024; // KB
    expect(estimatedBundleSize).toBeLessThan(2048); // Max 2MB total
  });

  test('should handle large Quran content efficiently', async ({ page }) => {
    await page.goto('/');
    await testHelpers.waitForAppLoad();
    await testHelpers.navigateTo('mushaf');
    
    // Measure memory usage before loading content
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    // Load multiple pages of Quran content
    const pages = [1, 2, 3, 4, 5, 10, 50, 100, 200];
    
    for (const pageNum of pages) {
      await page.click('[data-testid="page-navigator"]');
      await page.fill('[data-testid="page-input"]', pageNum.toString());
      await page.click('[data-testid="go-to-page"]');
      
      // Wait for content to load
      const quranText = page.locator('[data-testid="quran-text"]');
      await expect(quranText).toBeVisible();
      
      // Measure rendering time
      const renderTime = await page.evaluate(() => {
        performance.mark('content-start');
        return new Promise(resolve => {
          requestAnimationFrame(() => {
            performance.mark('content-end');
            performance.measure('content-render', 'content-start', 'content-end');
            const measure = performance.getEntriesByName('content-render').pop();
            resolve(measure ? measure.duration : 0);
          });
        });
      });
      
      // Content should render quickly
      expect(renderTime).toBeLessThan(100); // 100ms max render time
      
      // Don't check every page to speed up test
      if (pageNum > 10) break;
    }
    
    // Measure memory usage after loading content
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.used - initialMemory.used;
      const memoryIncreaseKB = memoryIncrease / 1024;
      
      console.log(`Memory increase: ${Math.round(memoryIncreaseKB)}KB`);
      
      // Memory increase should be reasonable
      expect(memoryIncreaseKB).toBeLessThan(10240); // Max 10MB increase
    }
  });

  test('should have responsive navigation and interactions', async ({ page }) => {
    await page.goto('/');
    await testHelpers.waitForAppLoad();
    
    // Test navigation responsiveness
    const routes = ['mushaf', 'progress', 'settings', 'home'];
    
    for (const route of routes) {
      const startTime = Date.now();
      
      await testHelpers.navigateTo(route as any);
      
      // Wait for page to be visible
      const pageElement = page.locator(`[data-testid="${route}-page"]`);
      await expect(pageElement).toBeVisible();
      
      const navigationTime = Date.now() - startTime;
      
      // Navigation should be fast
      expect(navigationTime).toBeLessThan(500); // 500ms max navigation time
      
      console.log(`${route} navigation: ${navigationTime}ms`);
    }
    
    // Test interaction responsiveness
    await testHelpers.navigateTo('mushaf');
    
    // Test page turning
    const pageNavigationTimes = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();
      
      await page.click('[data-testid="next-page"]');
      await page.waitForTimeout(100); // Allow page to load
      
      const endTime = performance.now();
      pageNavigationTimes.push(endTime - startTime);
    }
    
    const avgPageNavTime = pageNavigationTimes.reduce((a, b) => a + b, 0) / pageNavigationTimes.length;
    expect(avgPageNavTime).toBeLessThan(300); // 300ms average page navigation
  });

  test('should handle audio playback performance', async ({ page }) => {
    await page.goto('/');
    await testHelpers.waitForAppLoad();
    await testHelpers.navigateTo('mushaf');
    
    // Test audio loading performance
    const audioLoadTimes = [];
    
    // Test multiple ayahs
    for (let ayah = 1; ayah <= 3; ayah++) {
      const ayahElement = page.locator(`[data-testid="ayah-1-${ayah}"]`);
      await ayahElement.click();
      
      const startTime = Date.now();
      
      await page.click('[data-testid="play-ayah-audio"]');
      
      // Wait for audio to be ready
      await page.waitForFunction(() => {
        const audio = document.querySelector('audio');
        return audio && audio.readyState >= 3; // HAVE_FUTURE_DATA
      }, { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      audioLoadTimes.push(loadTime);
      
      // Stop audio
      await page.click('[data-testid="pause-button"]');
      await page.waitForTimeout(500);
    }
    
    const avgAudioLoadTime = audioLoadTimes.reduce((a, b) => a + b, 0) / audioLoadTimes.length;
    console.log(`Average audio load time: ${avgAudioLoadTime}ms`);
    
    // Audio should load reasonably quickly
    expect(avgAudioLoadTime).toBeLessThan(3000); // 3s max audio load time
    
    // No single audio should take too long
    audioLoadTimes.forEach(time => {
      expect(time).toBeLessThan(5000); // 5s max for any single audio
    });
  });

  test('should maintain performance across different device sizes', async ({ page }) => {
    const deviceSizes = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    const performanceResults = [];
    
    for (const device of deviceSizes) {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      const startTime = Date.now();
      
      await page.goto('/');
      await testHelpers.waitForAppLoad();
      
      const loadTime = Date.now() - startTime;
      
      // Navigate to content-heavy page
      await testHelpers.navigateTo('mushaf');
      
      const contentStartTime = Date.now();
      const quranText = page.locator('[data-testid="quran-text"]');
      await expect(quranText).toBeVisible();
      const contentLoadTime = Date.now() - contentStartTime;
      
      performanceResults.push({
        device: device.name,
        loadTime,
        contentLoadTime
      });
      
      console.log(`${device.name} - Load: ${loadTime}ms, Content: ${contentLoadTime}ms`);
    }
    
    // Performance should be consistent across devices
    performanceResults.forEach(result => {
      expect(result.loadTime).toBeLessThan(3000); // 3s max load time
      expect(result.contentLoadTime).toBeLessThan(1000); // 1s max content load time
    });
    
    // Performance variance shouldn't be too large
    const loadTimes = performanceResults.map(r => r.loadTime);
    const maxLoadTime = Math.max(...loadTimes);
    const minLoadTime = Math.min(...loadTimes);
    const variance = maxLoadTime - minLoadTime;
    
    expect(variance).toBeLessThan(2000); // Max 2s variance between devices
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    await page.goto('/');
    await testHelpers.waitForAppLoad();
    await testHelpers.navigateTo('mushaf');
    
    // Simulate concurrent operations
    const startTime = Date.now();
    
    const operations = [
      // Search operation
      (async () => {
        await page.click('[data-testid="search-button"]');
        await page.fill('[data-testid="search-input"]', 'الله');
        await page.keyboard.press('Enter');
      })(),
      
      // Navigation operation
      (async () => {
        await page.click('[data-testid="next-page"]');
        await page.waitForTimeout(200);
        await page.click('[data-testid="next-page"]');
      })(),
      
      // Bookmark operation
      (async () => {
        const ayah = page.locator('[data-testid="ayah-1-1"]');
        await ayah.click();
        await page.click('[data-testid="bookmark-ayah"]');
      })(),
      
      // Settings change
      (async () => {
        await page.click('[data-testid="font-size-increase"]');
        await page.waitForTimeout(100);
        await page.click('[data-testid="font-size-decrease"]');
      })()
    ];
    
    // Execute operations concurrently
    await Promise.all(operations);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`Concurrent operations completed in: ${totalTime}ms`);
    
    // Concurrent operations should complete reasonably quickly
    expect(totalTime).toBeLessThan(5000); // 5s max for all concurrent operations
    
    // Verify app is still responsive
    const quranText = page.locator('[data-testid="quran-text"]');
    await expect(quranText).toBeVisible();
  });

  test('should have efficient search performance', async ({ page }) => {
    await page.goto('/');
    await testHelpers.waitForAppLoad();
    await testHelpers.navigateTo('mushaf');
    
    // Test search performance with different query lengths
    const queries = ['ا', 'الله', 'بسم الله', 'الحمد لله رب العالمين'];
    
    for (const query of queries) {
      const startTime = Date.now();
      
      await page.click('[data-testid="search-button"]');
      await page.fill('[data-testid="search-input"]', query);
      await page.keyboard.press('Enter');
      
      // Wait for search results
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible({ timeout: 10000 });
      
      const searchTime = Date.now() - startTime;
      
      console.log(`Search "${query}" took: ${searchTime}ms`);
      
      // Search should be fast
      expect(searchTime).toBeLessThan(2000); // 2s max search time
      
      // Clear search for next iteration
      await page.click('[data-testid="clear-search"]');
    }
  });

  test('should handle memory cleanup properly', async ({ page }) => {
    // Skip on browsers without memory API
    const hasMemoryAPI = await page.evaluate(() => 'memory' in performance);
    if (!hasMemoryAPI) {
      test.skip();
    }

    await page.goto('/');
    await testHelpers.waitForAppLoad();
    
    // Get initial memory
    const initialMemory = await page.evaluate(() => ({
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize
    }));
    
    // Perform memory-intensive operations
    await testHelpers.navigateTo('mushaf');
    
    // Load lots of content
    for (let i = 1; i <= 20; i++) {
      await page.click('[data-testid="next-page"]');
      await page.waitForTimeout(100);
    }
    
    // Navigate away and back
    await testHelpers.navigateTo('settings');
    await testHelpers.navigateTo('progress');
    await testHelpers.navigateTo('home');
    await testHelpers.navigateTo('mushaf');
    
    // Trigger potential garbage collection
    await page.evaluate(() => {
      if ('gc' in window) {
        (window as any).gc();
      }
    });
    
    await page.waitForTimeout(2000); // Allow cleanup
    
    // Check final memory
    const finalMemory = await page.evaluate(() => ({
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize
    }));
    
    const memoryIncrease = finalMemory.used - initialMemory.used;
    const memoryIncreaseKB = memoryIncrease / 1024;
    
    console.log(`Memory increase after operations: ${Math.round(memoryIncreaseKB)}KB`);
    
    // Memory increase should be reasonable (accounting for legitimate caching)
    expect(memoryIncreaseKB).toBeLessThan(5120); // Max 5MB increase
  });

  test('should maintain performance during extended usage', async ({ page }) => {
    await page.goto('/');
    await testHelpers.waitForAppLoad();
    
    const performanceSnapshots = [];
    
    // Simulate extended usage session
    for (let session = 0; session < 5; session++) {
      const sessionStart = Date.now();
      
      // Typical user journey
      await testHelpers.navigateTo('mushaf');
      await page.click('[data-testid="next-page"]');
      await page.waitForTimeout(200);
      
      const ayah = page.locator('[data-testid="ayah-1-1"]');
      await ayah.click();
      await page.click('[data-testid="bookmark-ayah"]');
      
      await testHelpers.navigateTo('progress');
      await page.waitForTimeout(300);
      
      await testHelpers.navigateTo('settings');
      await page.click('[data-testid="display-settings"]');
      await page.waitForTimeout(200);
      
      await testHelpers.navigateTo('home');
      
      const sessionTime = Date.now() - sessionStart;
      performanceSnapshots.push(sessionTime);
      
      console.log(`Session ${session + 1}: ${sessionTime}ms`);
    }
    
    // Performance should remain consistent
    performanceSnapshots.forEach((time, index) => {
      expect(time).toBeLessThan(5000); // Each session < 5s
      
      // Performance shouldn't degrade significantly over time
      if (index > 0) {
        const previousTime = performanceSnapshots[index - 1];
        const degradation = time - previousTime;
        expect(degradation).toBeLessThan(1000); // Max 1s degradation per session
      }
    });
  });
});
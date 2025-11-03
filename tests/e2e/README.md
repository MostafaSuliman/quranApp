# QuranApp E2E Testing Suite

Comprehensive end-to-end testing suite for QuranApp using Playwright, covering all user journeys, Islamic features, and cross-browser compatibility.

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Running Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (visual test runner)
npm run test:e2e:ui

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run mobile tests
npm run test:e2e:mobile

# Run specific test categories
npm run test:e2e:performance
npm run test:e2e:pwa
npm run test:e2e:islamic

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## 📋 Test Coverage

### Core User Journeys
- **Onboarding Flow** (`onboarding.spec.ts`)
  - Language selection and RTL support
  - Experience level and goals setup
  - Notification preferences
  - Progress tracking and validation

- **Quran Reading** (`quran-reading.spec.ts`)
  - Mushaf navigation and page turning
  - Surah and Ayah navigation
  - Arabic text rendering and RTL layout
  - Translation and transliteration
  - Search functionality
  - Bookmarking and annotations

- **Memorization Features** (`memorization.spec.ts`)
  - Text hiding and revealing
  - Progress tracking and statistics
  - Spaced repetition system
  - Assessment and testing
  - Goal setting and achievements

- **Audio Playback** (`audio-playback.spec.ts`)
  - Multiple reciter support
  - Playback controls and speed adjustment
  - Continuous playback
  - Audio downloads for offline use
  - Waveform visualization

- **Settings & Preferences** (`settings.spec.ts`)
  - Theme and display options
  - Audio and reading preferences
  - Privacy and data management
  - Backup and synchronization
  - Accessibility settings

### Islamic Features
- **Prayer Times** (`islamic-features.spec.ts`)
  - Calculation methods and adjustments
  - Location-based timing
  - Notification system

- **Ramadan Mode**
  - Fasting tracker
  - Special reading plans
  - Suhoor and Iftar times

- **Qibla Direction**
  - Compass functionality
  - Location accuracy

- **Islamic Calendar**
  - Hijri date conversion
  - Islamic events calendar

- **Religious Content**
  - Duas and supplications
  - 99 Names of Allah (Asma ul Husna)
  - Tasbih counter
  - Content authenticity validation

### Technical Features
- **PWA & Offline** (`pwa-offline.spec.ts`)
  - Service worker registration
  - Offline functionality
  - App installation
  - Background sync
  - Cache management

- **Performance** (`performance.spec.ts`)
  - Core Web Vitals benchmarking
  - Loading time optimization
  - Memory usage monitoring
  - Cross-device performance
  - Concurrent operations

## 🌐 Cross-Browser Testing

### Desktop Browsers
- **Chromium/Chrome** - Latest stable
- **Firefox** - Latest stable  
- **WebKit/Safari** - Latest stable
- **Edge** - Latest stable

### Mobile Testing
- **Mobile Chrome** - Android simulation
- **Mobile Safari** - iOS simulation
- **Samsung Galaxy** - Android device
- **iPad** - Tablet experience

### Special Configurations
- **Dark Mode** - Theme testing
- **RTL Languages** - Arabic interface
- **Accessibility** - Screen reader support
- **Performance** - Throttled conditions
- **Offline** - Network disconnection
- **PWA** - App installation

## 📱 Device & Accessibility Testing

### Responsive Design
- Mobile devices (375x667, 360x640)
- Tablets (768x1024, 1024x768)
- Desktop (1920x1080, 1366x768)
- Orientation changes

### Accessibility Features
- Keyboard navigation
- Screen reader compatibility
- High contrast mode
- Reduced motion
- Focus management
- ARIA labels and roles

### Performance Metrics
- First Contentful Paint (FCP) < 1.8s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- Total load time < 3s
- Memory usage monitoring

## 🏗️ Test Architecture

### Project Structure
```
tests/e2e/
├── fixtures/           # Test data and fixtures
│   └── test-data.ts    # Islamic content, user data
├── helpers/            # Reusable test utilities
│   ├── test-helpers.ts # General app helpers
│   └── islamic-helpers.ts # Islamic feature helpers
├── pages/             # Page Object Models (future)
├── specs/             # Test specifications
│   ├── onboarding.spec.ts
│   ├── quran-reading.spec.ts
│   ├── memorization.spec.ts
│   ├── audio-playback.spec.ts
│   ├── settings.spec.ts
│   ├── islamic-features.spec.ts
│   ├── pwa-offline.spec.ts
│   └── performance.spec.ts
├── global-setup.ts    # Global test setup
└── global-teardown.ts # Global test cleanup
```

### Test Helpers

#### TestHelpers Class
- `waitForAppLoad()` - Wait for app initialization
- `completeOnboarding()` - Skip onboarding flow
- `navigateTo(route)` - App navigation
- `testAudioPlayback()` - Audio testing
- `toggleDarkMode()` - Theme switching
- `testOfflineMode()` - Offline functionality
- `testPWAInstallation()` - PWA features
- `measurePerformance()` - Performance metrics

#### IslamicHelpers Class
- `verifyArabicTextRendering()` - RTL and font validation
- `verifyQuranTextAuthenticity()` - Content verification
- `testPrayerTimes()` - Prayer time calculations
- `testQiblaDirection()` - Compass functionality
- `testRamadanMode()` - Ramadan features
- `verifyIslamicContentCompliance()` - Content standards

### Configuration

#### Playwright Config Features
- **Multiple Projects** - Browser and device configurations
- **Global Setup/Teardown** - Environment preparation
- **Retry Logic** - Automatic test retries on CI
- **Parallel Execution** - Optimized test performance
- **Visual Regression** - Screenshot comparison
- **Network Simulation** - Offline/slow connection testing

#### Reporter Configuration
- HTML report with screenshots and videos
- JSON results for CI integration
- JUnit XML for test reporting
- GitHub Actions annotations
- Allure reporting support

## 🔧 CI/CD Integration

### GitHub Actions Workflow
- **Multi-browser testing** - Parallel execution
- **Mobile device simulation** - Cross-platform testing
- **Accessibility compliance** - WCAG validation
- **Performance benchmarking** - Core Web Vitals
- **PWA testing** - Offline and installation
- **Result consolidation** - Unified reporting

### Test Execution Matrix
```yaml
Browser Tests: [chromium, firefox, webkit, edge]
Mobile Tests: [Mobile Chrome, Mobile Safari, Samsung Galaxy, iPad]
Special Tests: [Accessibility, Performance, PWA, Offline]
```

### Reporting and Artifacts
- Test reports with videos and screenshots
- Performance metrics and benchmarks
- Accessibility compliance reports
- Failed test debugging information
- Cross-browser compatibility matrix

## 📊 Test Data Management

### Islamic Content Fixtures
- **Quran Data** - Sample Ayahs and Surahs
- **Prayer Times** - Multiple locations and methods
- **Islamic Calendar** - Hijri date conversions
- **Religious Content** - Duas, Names of Allah
- **Audio Data** - Reciter information

### User Test Profiles
- **Beginner** - New user experience
- **Intermediate** - Regular user with progress
- **Advanced** - Power user with customization

### Performance Benchmarks
- Load time thresholds
- Memory usage limits
- Bundle size constraints
- Core Web Vitals targets

## 🚨 Error Handling & Debugging

### Test Failures
- Automatic screenshot capture
- Video recording of failures
- Console log collection
- Network request monitoring
- Performance timeline capture

### Debugging Tools
- Playwright Inspector (`--debug`)
- Headed mode (`--headed`)
- UI mode (`--ui`)
- Trace viewer
- Network monitoring

### Common Issues
- **Timing Issues** - Use proper waits
- **Flaky Tests** - Implement retry logic
- **Cross-Browser** - Account for differences
- **Mobile Testing** - Device-specific behavior
- **Performance** - Environment variations

## 📈 Performance Monitoring

### Core Web Vitals
- **First Contentful Paint (FCP)** - Visual rendering
- **Largest Contentful Paint (LCP)** - Main content
- **Cumulative Layout Shift (CLS)** - Visual stability
- **First Input Delay (FID)** - Interactivity

### Custom Metrics
- **Navigation Speed** - Route transitions
- **Search Performance** - Query response time
- **Audio Loading** - Recitation readiness
- **Memory Usage** - JavaScript heap size
- **Bundle Analysis** - Asset optimization

## 🔒 Security Testing

### Content Security
- Islamic content authenticity
- User data protection
- Privacy compliance
- Content moderation

### Technical Security
- XSS prevention
- CSRF protection
- Data sanitization
- Secure storage

## 🌍 Internationalization Testing

### Language Support
- **Arabic** - RTL layout and typography
- **English** - Default language
- **Mixed Content** - Bidirectional text

### Cultural Considerations
- Prayer time accuracy
- Islamic calendar compliance
- Regional calculation methods
- Content appropriateness

## 📚 Best Practices

### Test Writing
1. **Descriptive Names** - Clear test intentions
2. **Independent Tests** - No test dependencies
3. **Proper Cleanup** - Reset state between tests
4. **Error Handling** - Graceful failure handling
5. **Performance Awareness** - Optimized test execution

### Maintenance
1. **Regular Updates** - Keep tests current
2. **Flaky Test Management** - Address instability
3. **Performance Monitoring** - Track test execution
4. **Documentation Updates** - Keep guides current

### Islamic Content Guidelines
1. **Respectful Testing** - Appropriate test data
2. **Authentic Content** - Verified Islamic sources
3. **Cultural Sensitivity** - Respectful implementation
4. **Accuracy Validation** - Correct religious content

## 📞 Support & Contributing

### Getting Help
- Check test output and screenshots
- Review Playwright documentation
- Use debugging tools and modes
- Check GitHub Actions logs

### Contributing Tests
1. Follow existing patterns
2. Include proper documentation
3. Add appropriate test data
4. Ensure cross-browser compatibility
5. Validate Islamic content accuracy

---

This E2E testing suite ensures QuranApp delivers a high-quality, accessible, and culturally appropriate Islamic education experience across all platforms and devices.
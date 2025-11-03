# QuranApp Testing Suite

Comprehensive test scenarios created specifically for preventing all identified issues from recurring in future development of the QuranApp.

## 🎯 Testing Mission

This testing suite ensures that the QuranApp maintains:
- **Islamic Content Integrity**: Authentic Arabic text and proper citations
- **Settings Functionality**: Immediate effect and proper persistence
- **Arabic-First UI**: RTL layout and bilingual content management
- **API Integration**: Reliable Quran.com API usage
- **Icon Consistency**: Appropriate Islamic iconography
- **Reference Standards**: Proper Islamic citation format

## 📁 Test Structure

```
src/tests/
├── unit/                           # Unit Tests (4 files)
│   ├── islamic-content.test.ts     # Arabic text authenticity & hierarchy
│   ├── settings-functionality.test.ts  # Settings immediate effect & persistence
│   ├── language-switching.test.ts  # Arabic-first behavior & RTL layout
│   └── api-integration.test.ts     # Quran.com API reliability
├── integration/                    # Integration Tests (3 files)
│   ├── quran-display.test.ts       # Complete Quran functionality
│   ├── settings-flow.test.ts       # Complete settings user journey
│   └── arabic-ui.test.ts           # Complete Arabic-first UI experience
├── regression/                     # Regression Tests (3 files)
│   ├── icon-consistency.test.ts    # Icon preservation & consistency
│   ├── islamic-references.test.ts  # Citation format & terminology
│   └── content-authenticity.test.ts # Content authenticity & Arabic primacy
├── test-setup.ts                   # Test configuration & utilities
├── vitest.config.ts               # Vitest configuration
└── README.md                      # This file
```

## 🧪 Test Categories

### Unit Tests
- **Islamic Content Integrity**: Validates Arabic text authenticity, proper content hierarchy, and Islamic standards
- **Settings Functionality**: Tests immediate effect of all settings and proper persistence across sessions
- **Language Switching**: Ensures Arabic-first behavior and proper RTL layout implementation
- **API Integration**: Verifies reliable Quran.com API usage and authentic content retrieval

### Integration Tests
- **Quran Display**: Complete user journey from API to UI display with all features working together
- **Settings Flow**: End-to-end settings experience including persistence and immediate effects
- **Arabic UI**: Comprehensive Arabic-first UI experience with RTL layout and bilingual support

### Regression Tests
- **Icon Consistency**: Prevents inappropriate icon changes, maintains Islamic iconography
- **Islamic References**: Enforces proper citation format, prevents biblical-style references
- **Content Authenticity**: Prevents English text as primary content, maintains Arabic authenticity

## 🔧 Test Configuration

### Setup Files
- **test-setup.ts**: Global test configuration with mocks and utilities
- **vitest.config.ts**: Vitest configuration optimized for Islamic content testing

### Test Utilities
The test suite includes specialized utilities for:
- Arabic text validation (script detection, diacritics, Uthmani characteristics)
- Citation format validation (Islamic vs biblical format detection)
- RTL layout validation (direction, alignment, document state)
- Islamic content hierarchy (Arabic primacy, proper sizing, DOM order)
- Icon and symbol validation (appropriate Islamic iconography)
- API and data validation (authentic source verification)

## 🚀 Running Tests

### Prerequisites
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Regression tests only
npm run test:regression
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npx vitest src/tests/unit/islamic-content.test.ts
```

## 📊 Coverage Requirements

The test suite enforces high coverage standards:
- **Global Coverage**: 80% minimum (branches, functions, lines, statements)
- **Islamic Content Components**: 90% minimum coverage
- **API Integration**: 85% minimum coverage

Critical components have higher coverage requirements:
- QuranText.tsx: 90% coverage
- AyahDisplay.tsx: 90% coverage
- quranApi.ts: 85% coverage

## 🕌 Islamic Content Testing Standards

### Arabic Text Authenticity
- ✅ All Arabic text from Quran.com API
- ✅ Proper diacritics preservation
- ✅ Uthmani script characteristics
- ✅ No encoding corruption
- ❌ English text as primary Quranic content

### Citation Format Standards
- ✅ "Surah Name • Ayah Number" format
- ✅ Islamic terminology (Surah, Ayah, Mushaf)
- ❌ Biblical format "Quran X:Y"
- ❌ Non-Islamic terminology (Chapter, Verse, Book)

### Content Hierarchy
- ✅ Arabic text larger than translations
- ✅ Arabic text appears first in DOM order
- ✅ Arabic maintains primacy with translations enabled
- ❌ Translations overshadowing Arabic content

### RTL Layout Requirements
- ✅ Proper RTL layout activation with Arabic
- ✅ Document direction set correctly
- ✅ Arabic text right-aligned
- ✅ Navigation and controls adapt to RTL

## 🎨 Icon and Visual Standards

### Required Icons
- 📖 Book emoji for Mushaf consistently
- 🔊 Speaker icons for audio controls
- ⚙️ Gear icon for settings
- Appropriate Islamic symbols where used

### Prohibited Elements
- ❌ Inappropriate emoji or symbols
- ❌ Non-Islamic religious iconography
- ❌ Mixing of religious symbols
- ❌ Casual or disrespectful presentation

## 🔄 Settings Testing Standards

### Immediate Effect Requirements
- ✅ All settings apply without page refresh
- ✅ Real-time feedback for all controls
- ✅ Language changes affect UI immediately
- ✅ Theme changes apply instantly

### Persistence Requirements
- ✅ Settings survive browser close/reopen
- ✅ Settings maintained across tabs
- ✅ Reset functionality works completely
- ✅ Invalid settings handled gracefully

## 📱 Cross-Platform Requirements

### Browser Support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Arabic font rendering across all browsers
- RTL layout support verification

### Device Support
- Mobile devices (iOS, Android)
- Tablet interfaces
- Desktop browsers
- Touch interaction compatibility

## 🔍 Manual Testing Integration

The automated tests are complemented by manual test checklists:

### Manual Test Checklists
- **Islamic Content Checklist**: `/docs/testing/islamic-content-checklist.md`
- **Settings Verification**: `/docs/testing/settings-verification.md`
- **Arabic UI Validation**: `/docs/testing/arabic-ui-validation.md`

These provide comprehensive human verification of:
- Visual presentation quality
- User experience flows
- Cross-browser compatibility
- Accessibility compliance
- Performance characteristics

## ⚡ Performance Standards

### Test Performance
- Maximum test timeout: 10 seconds
- Average test execution: <2 seconds
- Memory usage monitoring enabled
- Performance regression detection

### App Performance Requirements
- Maximum load time: 2 seconds
- Maximum render time: 100ms
- Arabic font loading optimization
- Responsive layout performance

## 🔧 Debugging and Development

### Test Debugging
- Use `npm run test:debug` for debugging specific tests
- Browser developer tools integration
- Detailed error reporting with Islamic content context
- Visual regression detection

### Development Integration
- Tests run automatically on file changes in watch mode
- Pre-commit hooks ensure all tests pass
- CI/CD integration for automated testing
- Coverage reports for code quality monitoring

## 📋 Test Maintenance

### Regular Maintenance Tasks
1. **Monthly**: Review and update test scenarios based on new features
2. **Quarterly**: Validate all Islamic content standards against latest requirements
3. **Before Releases**: Run complete test suite including manual checklists
4. **After API Changes**: Verify all Quran.com API integration tests

### Updating Tests
When adding new features:
1. Add corresponding unit tests for the feature
2. Update integration tests if the feature affects user journeys
3. Add regression tests if the feature could impact Islamic content standards
4. Update manual test checklists as needed

## 🎯 Quality Assurance Goals

This testing suite ensures:
- **Zero Regression**: Islamic content standards never regress
- **Immediate Feedback**: All settings work instantly
- **Authentic Experience**: Only authentic Islamic content displayed
- **Accessible Design**: RTL layout and Arabic typography work perfectly
- **Cross-Platform Consistency**: Experience consistent across all devices

The comprehensive nature of these tests prevents the recurrence of all identified issues and maintains the highest standards for Islamic content integrity.
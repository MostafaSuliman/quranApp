# QuranApp - Testing Strategy

## Document Information

| Field | Value |
|-------|-------|
| **Document Type** | Testing Strategy |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Last Updated** | November 2025 |
| **Owner** | QA/Testing Team |
| **Related Documents** | MVP.md, PRD.md |

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Unit Testing Strategy](#unit-testing-strategy)
3. [Integration Testing Plan](#integration-testing-plan)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Accessibility Testing](#accessibility-testing)
7. [Islamic Content Verification](#islamic-content-verification)
8. [Test Coverage Requirements](#test-coverage-requirements)
9. [Test Automation Setup](#test-automation-setup)
10. [Testing Timeline](#testing-timeline)
11. [Quality Gates](#quality-gates)

---

## Testing Philosophy

### Core Principles

**Test Pyramid Approach**:
```
         /\
        /E2E\      ← Few (20%) - High-value user journeys
       /------\
      /Integr.\   ← Moderate (30%) - Component interactions
     /----------\
    /   Unit     \ ← Many (50%) - Business logic, utilities
   /--------------\
```

**Quality Standards**:
- **Prevention Over Detection**: Catch issues early in development
- **Evidence-Based Testing**: All claims supported by test results
- **Comprehensive Coverage**: >80% code coverage, 100% critical paths
- **Continuous Validation**: Automated testing on every commit
- **Islamic Authenticity**: 100% Quranic content accuracy

### Testing Objectives

| Objective | Target | Success Criteria |
|-----------|--------|------------------|
| **Code Coverage** | >80% | Unit tests cover all business logic |
| **Critical Path Coverage** | 100% | All user journeys E2E tested |
| **Bug Escape Rate** | <5% | Less than 5% of bugs reach production |
| **Performance Compliance** | 100% | All performance benchmarks met |
| **Accessibility Compliance** | WCAG 2.1 AA | Zero critical accessibility issues |
| **Content Accuracy** | 100% | Zero errors in Quranic content |

---

## Unit Testing Strategy

### Framework: Vitest + React Testing Library

**Rationale**:
- Vitest: Fast, Vite-native, ESM support, TypeScript-first
- React Testing Library: User-centric testing, best practices

### Scope and Coverage

#### 1. Utility Functions (100% Coverage)

**Test Categories**:

**Arabic Text Processing**:
```typescript
// src/utils/arabic.test.ts
describe('Arabic Text Utilities', () => {
  describe('removeHarakat', () => {
    it('should remove all diacritical marks', () => {
      const input = 'بِسْمِ ٱللَّهِ';
      const expected = 'بسم الله';
      expect(removeHarakat(input)).toBe(expected);
    });

    it('should preserve Arabic letters and spaces', () => {
      const input = 'اَلْحَمْدُ لِلَّهِ';
      expect(removeHarakat(input)).toBe('الحمد لله');
    });

    it('should handle empty strings', () => {
      expect(removeHarakat('')).toBe('');
    });
  });

  describe('normalizeArabic', () => {
    it('should normalize hamza variations', () => {
      const input = 'أإآءئؤ';
      const expected = 'ااااءا';
      expect(normalizeArabic(input)).toBe(expected);
    });
  });

  describe('isValidArabic', () => {
    it('should return true for valid Arabic text', () => {
      expect(isValidArabic('بِسْمِ ٱللَّهِ')).toBe(true);
    });

    it('should return false for non-Arabic text', () => {
      expect(isValidArabic('Hello World')).toBe(false);
    });

    it('should handle mixed content', () => {
      expect(isValidArabic('Surah 1:1')).toBe(false);
    });
  });
});
```

**Quran Navigation Utilities**:
```typescript
// src/utils/navigation.test.ts
describe('Quran Navigation', () => {
  describe('getPageBySurahVerse', () => {
    it('should return correct page for Surah 1, Verse 1', () => {
      expect(getPageBySurahVerse(1, 1)).toBe(1);
    });

    it('should return correct page for Surah 114, Verse 6', () => {
      expect(getPageBySurahVerse(114, 6)).toBe(604);
    });

    it('should handle invalid surah numbers', () => {
      expect(() => getPageBySurahVerse(115, 1)).toThrow('Invalid surah');
    });

    it('should handle invalid verse numbers', () => {
      expect(() => getPageBySurahVerse(1, 8)).toThrow('Invalid verse');
    });
  });

  describe('getJuzBySurahVerse', () => {
    it('should return Juz 1 for Al-Fatiha', () => {
      expect(getJuzBySurahVerse(1, 1)).toBe(1);
    });

    it('should return Juz 30 for last Surah', () => {
      expect(getJuzBySurahVerse(114, 1)).toBe(30);
    });
  });

  describe('getVerseId', () => {
    it('should generate unique verse ID', () => {
      expect(getVerseId(1, 1)).toBe('1:1');
      expect(getVerseId(2, 255)).toBe('2:255');
    });

    it('should parse verse ID back to surah and verse', () => {
      const verseId = '2:255';
      expect(parseVerseId(verseId)).toEqual({ surah: 2, verse: 255 });
    });
  });
});
```

**Audio Utilities**:
```typescript
// src/utils/audio.test.ts
describe('Audio Utilities', () => {
  describe('getAudioUrl', () => {
    it('should generate correct URL for reciter and verse', () => {
      const url = getAudioUrl('mishary', 1, 1);
      expect(url).toMatch(/mishary.*001001\.mp3/);
    });

    it('should handle different reciters', () => {
      const url1 = getAudioUrl('abdul_basit', 2, 1);
      const url2 = getAudioUrl('saad_alghamdi', 2, 1);
      expect(url1).toContain('abdul_basit');
      expect(url2).toContain('saad_alghamdi');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatDuration(65)).toBe('01:05');
      expect(formatDuration(3661)).toBe('61:01');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('00:00');
    });
  });

  describe('calculateRepetitionDuration', () => {
    it('should calculate total duration for repetitions', () => {
      const verseDuration = 10; // 10 seconds
      const repetitions = 3;
      expect(calculateRepetitionDuration(verseDuration, repetitions)).toBe(30);
    });
  });
});
```

**Memorization Algorithms**:
```typescript
// src/utils/memorization.test.ts
describe('Memorization Utilities', () => {
  describe('calculateNextReview (Spaced Repetition)', () => {
    it('should schedule new verses for 1 day review', () => {
      const lastReview = new Date('2025-01-01');
      const status = 'new';
      const nextReview = calculateNextReview(lastReview, status);
      expect(nextReview).toEqual(new Date('2025-01-02'));
    });

    it('should schedule learning verses for 3 days', () => {
      const lastReview = new Date('2025-01-01');
      const status = 'learning';
      const nextReview = calculateNextReview(lastReview, status, 1);
      expect(nextReview).toEqual(new Date('2025-01-04'));
    });

    it('should schedule mastered verses for 30 days', () => {
      const lastReview = new Date('2025-01-01');
      const status = 'mastered';
      const nextReview = calculateNextReview(lastReview, status);
      expect(nextReview).toEqual(new Date('2025-01-31'));
    });
  });

  describe('calculateProgress', () => {
    it('should calculate correct percentage for memorized verses', () => {
      const totalVerses = 6236; // Total Quran verses
      const memorizedVerses = 623; // 10%
      expect(calculateProgress(memorizedVerses, totalVerses)).toBe(10);
    });

    it('should handle 100% completion', () => {
      expect(calculateProgress(6236, 6236)).toBe(100);
    });

    it('should handle zero progress', () => {
      expect(calculateProgress(0, 6236)).toBe(0);
    });
  });

  describe('getVersesDueForReview', () => {
    it('should return verses due today', () => {
      const verses = [
        { id: '1:1', nextReview: new Date('2025-01-01'), status: 'learning' },
        { id: '1:2', nextReview: new Date('2025-01-02'), status: 'learning' },
        { id: '1:3', nextReview: new Date('2024-12-31'), status: 'learning' },
      ];
      const today = new Date('2025-01-01');
      const dueVerses = getVersesDueForReview(verses, today);
      expect(dueVerses).toHaveLength(2); // '1:1' and '1:3'
    });
  });
});
```

#### 2. Custom Hooks (100% Coverage)

**Quran Hooks**:
```typescript
// src/hooks/useQuranText.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useQuranText } from './useQuranText';

describe('useQuranText', () => {
  it('should fetch verse text successfully', async () => {
    const { result } = renderHook(() => useQuranText(1, 1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.text).toBe('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    // Mock API failure
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useQuranText(1, 1));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.text).toBeNull();
  });

  it('should refetch on surah/verse change', async () => {
    const { result, rerender } = renderHook(
      ({ surah, verse }) => useQuranText(surah, verse),
      { initialProps: { surah: 1, verse: 1 } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ surah: 2, verse: 1 });

    expect(result.current.loading).toBe(true);
  });
});
```

**Audio Hooks**:
```typescript
// src/hooks/useAudioPlayer.test.tsx
describe('useAudioPlayer', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioPlayer());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBe(0);
  });

  it('should play audio', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.play('test-audio-url.mp3');
    });

    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });
  });

  it('should pause audio', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.play('test-audio-url.mp3');
    });

    await waitFor(() => expect(result.current.isPlaying).toBe(true));

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should adjust playback speed', () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.setPlaybackSpeed(1.5);
    });

    expect(result.current.playbackSpeed).toBe(1.5);
  });
});
```

**Memorization Hooks**:
```typescript
// src/hooks/useMemorization.test.tsx
describe('useMemorization', () => {
  it('should track memorized verses', () => {
    const { result } = renderHook(() => useMemorization());

    expect(result.current.memorizedVerses).toEqual([]);

    act(() => {
      result.current.markAsMemorized('1:1');
    });

    expect(result.current.memorizedVerses).toContain('1:1');
  });

  it('should calculate daily progress', () => {
    const { result } = renderHook(() => useMemorization());

    act(() => {
      result.current.setDailyGoal(5);
      result.current.markAsMemorized('1:1');
      result.current.markAsMemorized('1:2');
    });

    expect(result.current.dailyProgress).toBe(2);
    expect(result.current.dailyGoal).toBe(5);
    expect(result.current.dailyProgressPercentage).toBe(40);
  });

  it('should schedule verse reviews', () => {
    const { result } = renderHook(() => useMemorization());

    act(() => {
      result.current.markAsMemorized('1:1');
    });

    const verse = result.current.getVerseStatus('1:1');
    expect(verse?.nextReview).toBeInstanceOf(Date);
  });
});
```

#### 3. Zustand Stores (100% Coverage)

**Quran Store**:
```typescript
// src/stores/quranStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useQuranStore } from './quranStore';

describe('quranStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useQuranStore.setState({
      currentSurah: 1,
      currentVerse: 1,
      currentPage: 1,
      bookmarks: [],
    });
  });

  it('should update current position', () => {
    const { result } = renderHook(() => useQuranStore());

    act(() => {
      result.current.setCurrentPosition(2, 255);
    });

    expect(result.current.currentSurah).toBe(2);
    expect(result.current.currentVerse).toBe(255);
  });

  it('should add and remove bookmarks', () => {
    const { result } = renderHook(() => useQuranStore());

    const bookmark = {
      id: 'bookmark-1',
      surah: 2,
      verse: 255,
      label: 'Ayat Al-Kursi',
      createdAt: new Date(),
    };

    act(() => {
      result.current.addBookmark(bookmark);
    });

    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].label).toBe('Ayat Al-Kursi');

    act(() => {
      result.current.removeBookmark('bookmark-1');
    });

    expect(result.current.bookmarks).toHaveLength(0);
  });

  it('should navigate to next/previous page', () => {
    const { result } = renderHook(() => useQuranStore());

    act(() => {
      result.current.setCurrentPage(1);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should not go below page 1 or above page 604', () => {
    const { result } = renderHook(() => useQuranStore());

    act(() => {
      result.current.setCurrentPage(1);
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.setCurrentPage(604);
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(604);
  });
});
```

**Audio Store**:
```typescript
// src/stores/audioStore.test.ts
describe('audioStore', () => {
  it('should manage reciter selection', () => {
    const { result } = renderHook(() => useAudioStore());

    act(() => {
      result.current.setReciter('abdul_basit');
    });

    expect(result.current.currentReciter).toBe('abdul_basit');
  });

  it('should manage repeat mode', () => {
    const { result } = renderHook(() => useAudioStore());

    act(() => {
      result.current.setRepeatMode('verse');
    });

    expect(result.current.repeatMode).toBe('verse');
  });

  it('should track playback state', () => {
    const { result } = renderHook(() => useAudioStore());

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.setIsPlaying(true);
    });

    expect(result.current.isPlaying).toBe(true);
  });
});
```

### Unit Test Patterns

**Arrange-Act-Assert (AAA) Pattern**:
```typescript
it('should calculate correct percentage', () => {
  // Arrange
  const memorizedVerses = 623;
  const totalVerses = 6236;

  // Act
  const percentage = calculateProgress(memorizedVerses, totalVerses);

  // Assert
  expect(percentage).toBe(10);
});
```

**Test Data Builders**:
```typescript
// src/test-utils/builders.ts
export const buildVerse = (overrides?: Partial<Verse>): Verse => ({
  id: 1,
  surah: 1,
  verse: 1,
  text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  page: 1,
  juz: 1,
  hizb: 1,
  manzil: 1,
  ...overrides,
});

export const buildSurah = (overrides?: Partial<Surah>): Surah => ({
  id: 1,
  name: 'الفاتحة',
  nameArabic: 'الفاتحة',
  nameEnglish: 'The Opening',
  transliteration: 'Al-Fatihah',
  totalVerses: 7,
  revelationLocation: 'Meccan',
  revelationOrder: 5,
  ...overrides,
});
```

### Coverage Requirements

| Category | Target Coverage | Priority |
|----------|----------------|----------|
| **Utilities** | 100% | Critical |
| **Hooks** | 100% | Critical |
| **Stores** | 100% | Critical |
| **Components** | 80% | High |
| **Services** | 90% | High |
| **Overall** | 85%+ | Critical |

---

## Integration Testing Plan

### Framework: React Testing Library

**Philosophy**: Test components as users interact with them, not implementation details.

### Integration Test Scenarios

#### 1. Quran Reading Flow

**Test: User reads Quran from Surah list**:
```typescript
// src/components/Quran/__tests__/QuranReadingFlow.test.tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';

describe('Quran Reading Flow', () => {
  it('should allow user to navigate from Surah list to verse view', async () => {
    render(<App />);

    // 1. User opens Surah list
    const surahListButton = screen.getByRole('button', { name: /surah list/i });
    await userEvent.click(surahListButton);

    // 2. User selects Al-Fatiha
    const alFatiha = await screen.findByText(/Al-Fatihah/i);
    await userEvent.click(alFatiha);

    // 3. Verify verse text is displayed
    await waitFor(() => {
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument();
    });

    // 4. Verify page number is correct
    expect(screen.getByText(/Page 1/i)).toBeInTheDocument();
  });

  it('should highlight verse on tap', async () => {
    render(<App />);

    // Navigate to verse view
    const verse = await screen.findByTestId('verse-1-1');

    // Tap verse
    await userEvent.click(verse);

    // Verify highlighting
    expect(verse).toHaveClass('verse-highlighted');
  });

  it('should allow verse bookmarking', async () => {
    render(<App />);

    const verse = await screen.findByTestId('verse-2-255');
    await userEvent.click(verse);

    // Open verse menu
    const moreButton = screen.getByRole('button', { name: /more options/i });
    await userEvent.click(moreButton);

    // Bookmark verse
    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
    await userEvent.click(bookmarkButton);

    // Verify bookmark added
    const bookmarksButton = screen.getByRole('button', { name: /bookmarks/i });
    await userEvent.click(bookmarksButton);

    expect(await screen.findByText(/Ayat Al-Kursi/i)).toBeInTheDocument();
  });
});
```

#### 2. Audio Playback Integration

**Test: Audio playback with verse synchronization**:
```typescript
// src/components/Audio/__tests__/AudioPlayback.test.tsx
describe('Audio Playback Integration', () => {
  it('should play audio and highlight verses', async () => {
    render(<App />);

    // Navigate to Al-Fatiha
    await navigateToSurah(1);

    // Open audio player
    const audioButton = screen.getByRole('button', { name: /play audio/i });
    await userEvent.click(audioButton);

    // Select reciter
    const reciterSelect = screen.getByLabelText(/select reciter/i);
    await userEvent.selectOptions(reciterSelect, 'mishary');

    // Play audio
    const playButton = screen.getByRole('button', { name: /play/i });
    await userEvent.click(playButton);

    // Wait for first verse to play
    await waitFor(() => {
      const verse1 = screen.getByTestId('verse-1-1');
      expect(verse1).toHaveClass('verse-playing');
    }, { timeout: 5000 });

    // Verify audio controls are active
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    expect(pauseButton).toBeInTheDocument();
  });

  it('should support playback speed adjustment', async () => {
    render(<App />);

    const speedControl = await screen.findByLabelText(/playback speed/i);
    await userEvent.click(speedControl);

    const speed1_5x = screen.getByRole('option', { name: /1.5x/i });
    await userEvent.click(speed1_5x);

    expect(speedControl).toHaveTextContent('1.5x');
  });

  it('should support repeat modes', async () => {
    render(<App />);

    const repeatButton = await screen.findByRole('button', { name: /repeat/i });
    await userEvent.click(repeatButton);

    // Select verse repeat
    const verseRepeat = screen.getByRole('option', { name: /repeat verse/i });
    await userEvent.click(verseRepeat);

    // Verify repeat mode active
    expect(repeatButton).toHaveAttribute('aria-pressed', 'true');
  });
});
```

#### 3. Memorization Flow Integration

**Test: Complete memorization workflow**:
```typescript
// src/components/Memorization/__tests__/MemorizationFlow.test.tsx
describe('Memorization Flow', () => {
  it('should enable memorization mode and track progress', async () => {
    render(<App />);

    // Navigate to memorization section
    const memorizationTab = screen.getByRole('tab', { name: /memorization/i });
    await userEvent.click(memorizationTab);

    // Set daily goal
    const goalInput = screen.getByLabelText(/daily goal/i);
    await userEvent.clear(goalInput);
    await userEvent.type(goalInput, '5');

    // Select verses to memorize
    const startMemorizingButton = screen.getByRole('button', {
      name: /start memorizing/i
    });
    await userEvent.click(startMemorizingButton);

    // Choose Surah 78 (Juz Amma)
    const surah78 = screen.getByText(/An-Naba/i);
    await userEvent.click(surah78);

    // Set repetition count
    const repetitionSelect = screen.getByLabelText(/repetitions/i);
    await userEvent.selectOptions(repetitionSelect, '3');

    // Start practice
    const startButton = screen.getByRole('button', { name: /start practice/i });
    await userEvent.click(startButton);

    // Verify audio plays and verse is displayed
    await waitFor(() => {
      expect(screen.getByTestId('verse-78-1')).toBeInTheDocument();
    });

    // Mark verse as memorized
    const markMemorizedButton = screen.getByRole('button', {
      name: /mark memorized/i
    });
    await userEvent.click(markMemorizedButton);

    // Verify progress updated
    const progressText = await screen.findByText(/1 of 5 verses/i);
    expect(progressText).toBeInTheDocument();
  });

  it('should test memorization without showing text', async () => {
    render(<App />);

    // Navigate to practice test
    await navigateToMemorization();

    const testButton = screen.getByRole('button', { name: /test memorization/i });
    await userEvent.click(testButton);

    // Select hide text mode
    const hideTextOption = screen.getByLabelText(/hide text/i);
    await userEvent.click(hideTextOption);

    // Start test
    const startTestButton = screen.getByRole('button', { name: /start test/i });
    await userEvent.click(startTestButton);

    // Verify text is hidden
    const verseText = screen.queryByTestId('verse-text');
    expect(verseText).not.toBeVisible();

    // Audio should still play
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();

    // User can reveal verse
    const revealButton = screen.getByRole('button', { name: /reveal verse/i });
    await userEvent.click(revealButton);

    expect(screen.getByTestId('verse-text')).toBeVisible();
  });
});
```

#### 4. Translation and Search Integration

**Test: Search with translation**:
```typescript
// src/components/Search/__tests__/SearchIntegration.test.tsx
describe('Search Integration', () => {
  it('should search Quran text in Arabic', async () => {
    render(<App />);

    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText(/search quran/i);
    await userEvent.type(searchInput, 'الرحمن');

    const searchSubmit = screen.getByRole('button', { name: /submit search/i });
    await userEvent.click(searchSubmit);

    // Wait for results
    await waitFor(() => {
      const results = screen.getAllByTestId(/search-result/);
      expect(results.length).toBeGreaterThan(0);
    });

    // Verify result contains search term
    const firstResult = screen.getAllByTestId(/search-result/)[0];
    expect(firstResult).toHaveTextContent('الرحمن');
  });

  it('should search in translations', async () => {
    render(<App />);

    await openSearch();

    // Switch to translation search
    const translationTab = screen.getByRole('tab', { name: /translation/i });
    await userEvent.click(translationTab);

    const searchInput = screen.getByPlaceholderText(/search translation/i);
    await userEvent.type(searchInput, 'mercy');

    await submitSearch();

    // Verify results show translations
    const results = await screen.findAllByTestId(/search-result/);
    expect(results[0]).toHaveTextContent(/mercy/i);
  });

  it('should filter search by Surah', async () => {
    render(<App />);

    await openSearch();

    // Open advanced filters
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await userEvent.click(filtersButton);

    // Select Surah 2
    const surahFilter = screen.getByLabelText(/filter by surah/i);
    await userEvent.selectOptions(surahFilter, '2');

    // Search for 'Allah'
    const searchInput = screen.getByPlaceholderText(/search quran/i);
    await userEvent.type(searchInput, 'الله');

    await submitSearch();

    // Verify all results are from Surah 2
    const results = await screen.findAllByTestId(/search-result/);
    results.forEach(result => {
      expect(within(result).getByText(/Surah 2/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Test Checklist

- [ ] Quran text loading and display
- [ ] Navigation between Surahs, Juz', pages
- [ ] Audio playback with verse synchronization
- [ ] Audio controls (play, pause, speed, repeat)
- [ ] Memorization mode activation
- [ ] Progress tracking and statistics
- [ ] Bookmark management
- [ ] Translation switching
- [ ] Search functionality (Arabic and translation)
- [ ] Settings persistence
- [ ] Offline mode transitions
- [ ] Theme switching (dark/light mode)

---

## End-to-End Testing

### Framework: Playwright

**Why Playwright**:
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device emulation
- Network throttling for performance testing
- Screenshot and video recording
- Parallel test execution

### E2E Test Scenarios

#### Critical User Journeys

**Journey 1: First-Time User Onboarding**:
```typescript
// e2e/tests/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('First-Time User Onboarding', () => {
  test('should complete onboarding flow', async ({ page }) => {
    await page.goto('/');

    // 1. Welcome screen
    await expect(page.getByRole('heading', { name: /welcome to quranapp/i }))
      .toBeVisible();

    const startButton = page.getByRole('button', { name: /get started/i });
    await startButton.click();

    // 2. Language selection
    await expect(page.getByText(/select your language/i)).toBeVisible();
    await page.getByRole('option', { name: /english/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // 3. Reciter selection
    await expect(page.getByText(/choose default reciter/i)).toBeVisible();
    await page.getByRole('option', { name: /mishary rashid/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // 4. Permission requests (optional)
    const notificationPrompt = page.getByText(/enable notifications/i);
    if (await notificationPrompt.isVisible()) {
      await page.getByRole('button', { name: /maybe later/i }).click();
    }

    // 5. Main app should load
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText(/Al-Fatihah/i)).toBeVisible();
  });

  test('should show Quran text immediately after onboarding', async ({ page }) => {
    await page.goto('/');
    await completeOnboarding(page);

    // Verify Quran text is visible
    const verseText = page.getByTestId('verse-1-1');
    await expect(verseText).toBeVisible();
    await expect(verseText).toContainText(/بِسْمِ/);
  });
});
```

**Journey 2: Daily Quran Reading**:
```typescript
// e2e/tests/daily-reading.spec.ts
test.describe('Daily Quran Reading', () => {
  test('should read and bookmark verses', async ({ page }) => {
    await page.goto('/');

    // 1. Navigate to a specific Surah
    await page.getByRole('button', { name: /surah list/i }).click();
    await page.getByText(/Al-Baqarah/i).click();

    // 2. Read verses
    await expect(page.getByTestId('verse-2-1')).toBeVisible();

    // 3. Scroll to Ayat Al-Kursi (2:255)
    await page.getByTestId('verse-2-255').scrollIntoViewIfNeeded();

    // 4. Tap verse to highlight
    await page.getByTestId('verse-2-255').click();
    await expect(page.getByTestId('verse-2-255')).toHaveClass(/highlighted/);

    // 5. Bookmark verse
    await page.getByRole('button', { name: /bookmark/i }).click();

    // 6. Add bookmark label
    await page.getByLabel(/bookmark name/i).fill('Ayat Al-Kursi');
    await page.getByRole('button', { name: /save bookmark/i }).click();

    // 7. Verify bookmark saved
    await page.getByRole('button', { name: /bookmarks/i }).click();
    await expect(page.getByText(/Ayat Al-Kursi/i)).toBeVisible();
  });

  test('should resume reading from last position', async ({ page, context }) => {
    // First session: Read to page 10
    await page.goto('/');
    await page.getByRole('button', { name: /page/i }).click();
    await page.getByPlaceholder(/enter page number/i).fill('10');
    await page.keyboard.press('Enter');

    await expect(page.getByText(/Page 10/i)).toBeVisible();

    // Close and reopen app
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Should automatically open to page 10
    await expect(newPage.getByText(/Page 10/i)).toBeVisible();
  });
});
```

**Journey 3: Memorization Practice**:
```typescript
// e2e/tests/memorization.spec.ts
test.describe('Memorization Practice', () => {
  test('should memorize verses with repetition', async ({ page }) => {
    await page.goto('/');

    // 1. Navigate to memorization section
    await page.getByRole('tab', { name: /memorization/i }).click();

    // 2. Start new memorization session
    await page.getByRole('button', { name: /start memorizing/i }).click();

    // 3. Select Juz Amma (easy for beginners)
    await page.getByText(/Juz 30/i).click();
    await page.getByText(/An-Naba/i).click();

    // 4. Configure repetition
    await page.getByLabel(/repetitions/i).selectOption('3');
    await page.getByLabel(/auto-advance delay/i).selectOption('3'); // 3 seconds

    // 5. Start practice
    await page.getByRole('button', { name: /start/i }).click();

    // 6. First verse plays
    await expect(page.getByTestId('verse-78-1')).toBeVisible();
    const audioPlayer = page.getByRole('region', { name: /audio player/i });
    await expect(audioPlayer.getByText(/playing/i)).toBeVisible();

    // 7. Wait for repetitions (3 times)
    await expect(page.getByText(/repetition 1 of 3/i)).toBeVisible();
    await page.waitForTimeout(10000); // Wait for audio to play

    // 8. Mark as memorized
    await page.getByRole('button', { name: /mark memorized/i }).click();

    // 9. Verify progress
    await expect(page.getByText(/1 verse memorized/i)).toBeVisible();
  });

  test('should test memorization recall', async ({ page }) => {
    await page.goto('/memorization');

    // Assume user has memorized some verses
    await page.getByRole('button', { name: /test memorization/i }).click();

    // Select hide text mode
    await page.getByLabel(/hide text/i).check();

    // Start test
    await page.getByRole('button', { name: /start test/i }).click();

    // Audio plays but text is hidden
    const verseText = page.getByTestId('verse-text');
    await expect(verseText).toBeHidden();

    // User can reveal to check
    await page.getByRole('button', { name: /reveal/i }).click();
    await expect(verseText).toBeVisible();

    // Mark as correct or incorrect
    await page.getByRole('button', { name: /correct/i }).click();

    // Next verse
    await expect(page.getByText(/verse 2/i)).toBeVisible();
  });
});
```

**Journey 4: Audio Listening Session**:
```typescript
// e2e/tests/audio-listening.spec.ts
test.describe('Audio Listening', () => {
  test('should listen to full Surah with verse highlighting', async ({ page }) => {
    await page.goto('/');

    // 1. Navigate to Al-Mulk (Surah 67)
    await page.getByRole('button', { name: /surah/i }).click();
    await page.getByText(/Al-Mulk/i).click();

    // 2. Open audio player
    await page.getByRole('button', { name: /audio/i }).click();

    // 3. Select reciter
    await page.getByLabel(/reciter/i).selectOption('abdul_basit');

    // 4. Play entire Surah
    await page.getByRole('button', { name: /play surah/i }).click();

    // 5. Verify first verse highlights
    await expect(page.getByTestId('verse-67-1')).toHaveClass(/playing/);

    // 6. Verify audio controls
    const playbackSpeed = page.getByLabel(/speed/i);
    await expect(playbackSpeed).toBeVisible();

    // 7. Change speed
    await playbackSpeed.selectOption('0.75');
    await expect(playbackSpeed).toHaveValue('0.75');

    // 8. Pause and resume
    await page.getByRole('button', { name: /pause/i }).click();
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible();

    await page.getByRole('button', { name: /play/i }).click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  });

  test('should support background audio playback', async ({ page, context }) => {
    await page.goto('/');

    // Start audio playback
    await startAudioPlayback(page);

    // Navigate away from app (simulate backgrounding)
    await page.goto('https://example.com');

    // Audio should still be playing
    const pages = context.pages();
    const quranAppPage = pages.find(p => p.url().includes('localhost'));

    // Check if audio continues
    const audioState = await quranAppPage?.evaluate(() => {
      const audio = document.querySelector('audio');
      return { paused: audio?.paused, currentTime: audio?.currentTime };
    });

    expect(audioState?.paused).toBe(false);
  });
});
```

**Journey 5: Offline Usage**:
```typescript
// e2e/tests/offline.spec.ts
test.describe('Offline Functionality', () => {
  test('should work completely offline', async ({ page, context }) => {
    // First, load app while online
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Download audio for Al-Fatiha
    await page.getByRole('button', { name: /downloads/i }).click();
    await page.getByText(/Al-Fatiha/i).click();
    await page.getByRole('button', { name: /download audio/i }).click();

    // Wait for download to complete
    await expect(page.getByText(/download complete/i)).toBeVisible({ timeout: 30000 });

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload();

    // App should still work
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText(/Al-Fatiha/i)).toBeVisible();

    // Quran text should be visible
    await expect(page.getByTestId('verse-1-1')).toContainText(/بِسْمِ/);

    // Downloaded audio should play
    await page.getByRole('button', { name: /play/i }).click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();

    // Offline indicator should show
    await expect(page.getByText(/offline mode/i)).toBeVisible();
  });

  test('should sync when coming back online', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    await page.goto('/');

    // Make changes (bookmarks, progress)
    await addBookmark(page, '2:255');
    await markVerseAsMemorized(page, '1:1');

    // Go back online
    await context.setOffline(false);
    await page.reload();

    // Wait for sync
    await expect(page.getByText(/syncing/i)).toBeVisible();
    await expect(page.getByText(/synced/i)).toBeVisible({ timeout: 10000 });

    // Verify changes persisted
    await page.getByRole('button', { name: /bookmarks/i }).click();
    await expect(page.getByText(/2:255/)).toBeVisible();
  });
});
```

### Cross-Browser Testing

**Test Matrix**:

| Browser | Versions | Priority | Mobile |
|---------|----------|----------|--------|
| Chrome | Latest, Latest-1 | High | ✅ Android |
| Firefox | Latest, Latest-1 | High | ❌ |
| Safari | Latest, Latest-1 | High | ✅ iOS |
| Edge | Latest | Medium | ❌ |

**Browser-Specific Tests**:
```typescript
// e2e/tests/browser-compatibility.spec.ts
test.describe('Browser Compatibility', () => {
  test('should render Arabic text correctly in all browsers', async ({ page, browserName }) => {
    await page.goto('/');

    const verse = page.getByTestId('verse-1-1');
    await expect(verse).toBeVisible();

    // Take screenshot for visual comparison
    await expect(verse).toHaveScreenshot(`arabic-text-${browserName}.png`);

    // Verify text direction
    const direction = await verse.evaluate(el => window.getComputedStyle(el).direction);
    expect(direction).toBe('rtl');
  });

  test('should support audio in all browsers', async ({ page, browserName }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /play/i }).click();

    // Verify audio element
    const audio = page.locator('audio');
    const canPlay = await audio.evaluate(el => {
      return !!(el as HTMLAudioElement).canPlayType('audio/mpeg');
    });

    expect(canPlay).toBe(true);
  });
});
```

### Mobile Device Testing

**Device Emulation**:
```typescript
// e2e/tests/mobile.spec.ts
import { devices } from '@playwright/test';

test.use({
  ...devices['iPhone 13'],
});

test.describe('Mobile Experience', () => {
  test('should support touch gestures', async ({ page }) => {
    await page.goto('/');

    // Swipe to next page
    const quranPage = page.getByTestId('quran-page');
    await quranPage.swipe('left');

    // Verify page changed
    await expect(page.getByText(/Page 2/i)).toBeVisible();

    // Swipe back
    await quranPage.swipe('right');
    await expect(page.getByText(/Page 1/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');

    // Verify mobile layout
    const hamburgerMenu = page.getByRole('button', { name: /menu/i });
    await expect(hamburgerMenu).toBeVisible();

    // Desktop navigation should be hidden
    const desktopNav = page.getByTestId('desktop-navigation');
    await expect(desktopNav).toBeHidden();
  });

  test('should handle mobile keyboard', async ({ page }) => {
    await page.goto('/');

    // Open search
    await page.getByRole('button', { name: /search/i }).click();

    // Input should trigger mobile keyboard
    const searchInput = page.getByPlaceholderText(/search/i);
    await searchInput.focus();

    // Verify input is visible and keyboard doesn't cover it
    await expect(searchInput).toBeInViewport();
  });
});
```

### Performance E2E Tests

**Loading Performance**:
```typescript
// e2e/tests/performance.spec.ts
test.describe('Performance', () => {
  test('should load within 3 seconds on 3G', async ({ page }) => {
    // Simulate 3G network
    await page.route('**/*', route => {
      route.continue({
        // 3G speed simulation
        latency: 300,
        downloadThroughput: 750 * 1024 / 8,
        uploadThroughput: 250 * 1024 / 8,
      });
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should scroll smoothly at 60fps', async ({ page }) => {
    await page.goto('/');

    // Enable frame rate monitoring
    const frameRates: number[] = [];

    page.on('framenavigated', async () => {
      const fps = await page.evaluate(() => {
        return performance.now();
      });
      frameRates.push(fps);
    });

    // Scroll through content
    await page.evaluate(() => {
      window.scrollBy(0, 1000);
    });

    // Calculate average frame rate
    // Should be close to 60fps (16.67ms per frame)
    const avgFrameTime = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    expect(avgFrameTime).toBeLessThan(20); // Allow some tolerance
  });
});
```

---

## Performance Testing

### Performance Benchmarks

**Lighthouse Targets**:

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| **Performance** | > 90 | > 85 |
| **Accessibility** | > 95 | > 90 |
| **Best Practices** | > 95 | > 90 |
| **SEO** | > 90 | > 85 |
| **PWA** | 100 | 100 |

**Core Web Vitals**:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | < 1.8s | 1.8s - 3.0s | > 3.0s |
| **TTI** (Time to Interactive) | < 3.8s | 3.8s - 7.3s | > 7.3s |

### Lighthouse CI Integration

**Configuration** (`.lighthouserc.json`):
```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": [
        "http://localhost:4173/",
        "http://localhost:4173/surah/1",
        "http://localhost:4173/memorization"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:pwa": ["error", { "minScore": 1.0 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Performance Test Script**:
```typescript
// scripts/performance-test.ts
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runPerformanceTest() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse('http://localhost:4173', options);

  // Extract metrics
  const { lhr } = runnerResult;
  const performanceScore = lhr.categories.performance.score * 100;
  const accessibilityScore = lhr.categories.accessibility.score * 100;

  console.log('Performance Score:', performanceScore);
  console.log('Accessibility Score:', accessibilityScore);

  // Assert thresholds
  if (performanceScore < 90) {
    throw new Error(`Performance score ${performanceScore} is below 90`);
  }

  if (accessibilityScore < 95) {
    throw new Error(`Accessibility score ${accessibilityScore} is below 95`);
  }

  await chrome.kill();
}

runPerformanceTest().catch(console.error);
```

### Bundle Size Analysis

**Bundle Size Limits**:
```json
{
  "bundlesize": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "500 KB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/*.css",
      "maxSize": "50 KB",
      "compression": "gzip"
    }
  ]
}
```

**Analyze Bundle**:
```bash
# Generate bundle analysis
npm run build -- --mode analyze

# Visualize with vite-plugin-visualizer
npm run preview
```

### Performance Monitoring

**Real User Monitoring (RUM)**:
```typescript
// src/utils/performance.ts
export function trackWebVitals() {
  // LCP
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.renderTime || entry.loadTime);
      // Send to analytics
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  // FID
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fid = entry.processingStart - entry.startTime;
      console.log('FID:', fid);
    }
  }).observe({ type: 'first-input', buffered: true });

  // CLS
  let clsScore = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
        console.log('CLS:', clsScore);
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
}
```

---

## Accessibility Testing

### WCAG 2.1 AA Compliance

**Accessibility Requirements**:

| Principle | Guideline | Level | Priority |
|-----------|-----------|-------|----------|
| **Perceivable** | Text alternatives | A | Critical |
| **Perceivable** | Time-based media | A | High |
| **Perceivable** | Adaptable | A | Critical |
| **Perceivable** | Distinguishable | AA | Critical |
| **Operable** | Keyboard accessible | A | Critical |
| **Operable** | Enough time | A | High |
| **Operable** | Seizures and physical reactions | A | Critical |
| **Operable** | Navigable | AA | Critical |
| **Operable** | Input modalities | AA | High |
| **Understandable** | Readable | AA | Critical |
| **Understandable** | Predictable | AA | High |
| **Understandable** | Input assistance | AA | Critical |
| **Robust** | Compatible | A | Critical |

### Automated Accessibility Testing

**axe-core Integration**:
```typescript
// src/test-utils/axe.ts
import { toHaveNoViolations } from 'jest-axe';
import { axe } from 'jest-axe';

expect.extend(toHaveNoViolations);

export async function checkA11y(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}
```

**Component Accessibility Tests**:
```typescript
// src/components/Button/__tests__/Button.a11y.test.tsx
import { render } from '@testing-library/react';
import { checkA11y } from '@/test-utils/axe';
import { Button } from '../Button';

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    await checkA11y(container);
  });

  it('should be keyboard accessible', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    button.focus();

    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA attributes', () => {
    render(<Button aria-label="Submit form">Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
  });
});
```

**Playwright Accessibility Tests**:
```typescript
// e2e/tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should pass axe accessibility tests', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be navigable with keyboard only', async ({ page }) => {
    await page.goto('/');

    // Tab through all interactive elements
    await page.keyboard.press('Tab');

    let currentElement = await page.evaluateHandle(() => document.activeElement);
    expect(currentElement).toBeTruthy();

    // Continue tabbing through all elements
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      currentElement = await page.evaluateHandle(() => document.activeElement);

      // Verify focus is visible
      const hasFocusStyle = await page.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      }, currentElement);

      expect(hasFocusStyle).toBe(true);
    }
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/');

    // Check for proper semantic HTML
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();

    // Check for ARIA landmarks
    const landmarks = await page.evaluate(() => {
      const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]');
      return landmarks.length;
    });

    expect(landmarks).toBeGreaterThan(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const violations = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include(['color-contrast'])
      .analyze();

    expect(violations.violations).toEqual([]);
  });
});
```

### Manual Accessibility Testing Checklist

**Screen Reader Testing**:
- [ ] VoiceOver (macOS/iOS) - Navigate through all pages
- [ ] NVDA (Windows) - Read Quran text correctly
- [ ] JAWS (Windows) - Audio controls accessible
- [ ] TalkBack (Android) - Navigation works

**Keyboard Navigation**:
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons and links
- [ ] Arrow keys navigate lists and options
- [ ] Escape closes modals and menus
- [ ] Focus indicators visible on all elements
- [ ] Skip links work correctly

**Color and Contrast**:
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text)
- [ ] UI components contrast ≥ 3:1
- [ ] Test with color blindness simulators

**Zoom and Reflow**:
- [ ] Text readable at 200% zoom
- [ ] No horizontal scrolling at 320px width
- [ ] Content reflows properly
- [ ] No content loss at high zoom

**Forms and Inputs**:
- [ ] All form fields have labels
- [ ] Error messages are clear and accessible
- [ ] Required fields indicated
- [ ] Help text associated with fields

---

## Islamic Content Verification

### Quran Text Accuracy

**Verification Process**:

1. **Source Validation**:
   - Use only Tanzil.net verified text (Uthmani script, Hafs 'an 'Asim)
   - Cross-reference with Mushaf Madinah (King Fahd Complex)
   - Verify checksum against known good sources

2. **Character-by-Character Verification**:
```typescript
// scripts/verify-quran-text.ts
import { createHash } from 'crypto';
import { quranText } from './quran-data';

const KNOWN_GOOD_CHECKSUM = 'abc123...'; // From Tanzil.net

function verifyQuranText() {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(quranText));
  const checksum = hash.digest('hex');

  if (checksum !== KNOWN_GOOD_CHECKSUM) {
    throw new Error('Quran text checksum mismatch! Text may be corrupted.');
  }

  console.log('✅ Quran text verified successfully');
}
```

3. **Tajweed Mark Verification**:
```typescript
// tests/quran/tajweed.test.ts
describe('Tajweed Marks', () => {
  it('should have correct Tajweed marks for test verses', () => {
    const verse1_1 = getVerse(1, 1);

    // Verify specific Tajweed marks
    expect(verse1_1.text).toContain('بِسْمِ'); // Kasra, Sukun
    expect(verse1_1.text).toContain('ٱللَّهِ'); // Shadda, Fatha
    expect(verse1_1.text).toContain('ٱلرَّحْمَٰنِ'); // Alif Khanjariyah
  });

  it('should preserve all diacritical marks', () => {
    const allVerses = getAllVerses();

    allVerses.forEach(verse => {
      // Check for presence of Tajweed marks
      const hasDiacritics = /[\u064B-\u065F]/.test(verse.text);
      expect(hasDiacritics).toBe(true);
    });
  });
});
```

4. **Page and Juz Boundaries**:
```typescript
// tests/quran/structure.test.ts
describe('Quran Structure', () => {
  it('should have correct page boundaries', () => {
    // Al-Fatiha should be on page 1
    expect(getPageBySurahVerse(1, 1)).toBe(1);

    // Last verse should be on page 604
    expect(getPageBySurahVerse(114, 6)).toBe(604);

    // Verify known page boundaries
    expect(getPageBySurahVerse(2, 1)).toBe(2); // Al-Baqarah starts page 2
    expect(getPageBySurahVerse(2, 142)).toBe(22); // Verse 142 on page 22
  });

  it('should have correct Juz boundaries', () => {
    const juzBoundaries = [
      { juz: 1, surah: 1, verse: 1 },
      { juz: 2, surah: 2, verse: 142 },
      { juz: 3, surah: 2, verse: 253 },
      // ... all 30 Juz boundaries
      { juz: 30, surah: 78, verse: 1 },
    ];

    juzBoundaries.forEach(({ juz, surah, verse }) => {
      expect(getJuzBySurahVerse(surah, verse)).toBe(juz);
    });
  });

  it('should have correct verse counts per Surah', () => {
    const surahVerseCounts = [
      { surah: 1, verses: 7 },
      { surah: 2, verses: 286 },
      { surah: 3, verses: 200 },
      // ... all 114 Surahs
      { surah: 114, verses: 6 },
    ];

    surahVerseCounts.forEach(({ surah, verses }) => {
      const surahData = getSurah(surah);
      expect(surahData.totalVerses).toBe(verses);
    });
  });
});
```

### Audio Verification

**Audio Quality Checks**:
```typescript
// tests/audio/quality.test.ts
describe('Audio Quality', () => {
  it('should have minimum 128kbps bitrate', async () => {
    const audioFiles = await getAllAudioFiles();

    for (const file of audioFiles) {
      const metadata = await getAudioMetadata(file);
      expect(metadata.bitrate).toBeGreaterThanOrEqual(128000); // 128 kbps
    }
  });

  it('should have correct duration for verses', async () => {
    // Verify audio duration matches expected verse length
    const verse1_1Audio = await getAudio(1, 1, 'mishary');
    const duration = await getAudioDuration(verse1_1Audio);

    // Bismillah should be around 5-10 seconds
    expect(duration).toBeGreaterThan(4);
    expect(duration).toBeLessThan(12);
  });

  it('should have clean audio without artifacts', async () => {
    // This would require audio analysis library
    // Check for silence, noise, distortion
    const verse = await getAudio(1, 1, 'mishary');
    const analysis = await analyzeAudio(verse);

    expect(analysis.noiseLevel).toBeLessThan(0.1);
    expect(analysis.silenceRatio).toBeLessThan(0.2);
  });
});
```

**Reciter Authentication**:
```typescript
// tests/audio/reciters.test.ts
describe('Reciter Authenticity', () => {
  it('should have verified reciter information', () => {
    const reciters = getAllReciters();

    reciters.forEach(reciter => {
      expect(reciter).toHaveProperty('id');
      expect(reciter).toHaveProperty('name');
      expect(reciter).toHaveProperty('nameArabic');
      expect(reciter).toHaveProperty('style'); // Hafs, Warsh, etc.
      expect(reciter).toHaveProperty('verified', true);
    });
  });

  it('should only include recognized Qaris', () => {
    const recognizedQaris = [
      'mishary',
      'abdul_basit',
      'saad_alghamdi',
      'abdur_rahman_sudais',
      'maher_almuaiqly',
    ];

    const allReciters = getAllReciters();
    allReciters.forEach(reciter => {
      expect(recognizedQaris).toContain(reciter.id);
    });
  });
});
```

### Translation Verification

**Translation Accuracy Checks**:
```typescript
// tests/translations/verification.test.ts
describe('Translation Verification', () => {
  it('should use only verified scholarly translations', () => {
    const translations = getAllTranslations();

    const verifiedTranslators = [
      'Sahih International',
      'Muhammad Asad',
      'Yusuf Ali',
      'Pickthall',
      'Dr. Mustafa Khattab',
    ];

    translations.forEach(translation => {
      expect(verifiedTranslators).toContain(translation.translator);
      expect(translation.verified).toBe(true);
      expect(translation.source).toBeTruthy();
    });
  });

  it('should preserve verse numbering in translations', () => {
    const arabicText = getVerse(2, 255);
    const englishTranslation = getTranslation(2, 255, 'en', 'sahih');

    expect(arabicText.surah).toBe(englishTranslation.surah);
    expect(arabicText.verse).toBe(englishTranslation.verse);
  });

  it('should not contain inappropriate translations', () => {
    const inappropriateTerms = ['inappropriate', 'offensive', 'biased'];
    const allTranslations = getAllTranslations();

    allTranslations.forEach(translation => {
      inappropriateTerms.forEach(term => {
        expect(translation.text.toLowerCase()).not.toContain(term);
      });
    });
  });
});
```

### Scholar Review Process

**Manual Review Checklist**:

1. **Textual Accuracy** (Islamic Scholar):
   - [ ] Quran text matches Mushaf Madinah exactly
   - [ ] All Tajweed marks present and correct
   - [ ] No missing or extra words
   - [ ] Proper verse divisions
   - [ ] Correct page boundaries

2. **Audio Authentication** (Quran Recitation Expert):
   - [ ] Reciter identities verified
   - [ ] Recitation follows Hafs 'an 'Asim rules
   - [ ] Tajweed rules applied correctly
   - [ ] No audio artifacts or manipulation
   - [ ] Audio-text synchronization accurate

3. **Translation Review** (Islamic Scholar + Linguist):
   - [ ] Translations from recognized scholars
   - [ ] No theological errors
   - [ ] Contextually appropriate
   - [ ] No sectarian bias
   - [ ] Respectful language

4. **Tafsir Verification** (Islamic Scholar):
   - [ ] Tafsir sources authentic and recognized
   - [ ] Scholar attributions correct
   - [ ] No fabricated explanations
   - [ ] References properly cited

**Review Documentation**:
```markdown
## Scholar Review Log

### Quran Text Review
- **Reviewer**: Sheikh [Name]
- **Date**: [Date]
- **Methodology**: Character-by-character comparison with Mushaf Madinah
- **Result**: ✅ APPROVED
- **Notes**: All 6,236 verses verified. Tajweed marks accurate.

### Audio Review
- **Reviewer**: Qari [Name]
- **Date**: [Date]
- **Reciters Reviewed**: Mishary Rashid, Abdul Basit, Saad Al-Ghamdi
- **Result**: ✅ APPROVED
- **Notes**: Recitations authentic, Tajweed rules followed correctly.

### Translation Review (English)
- **Reviewer**: Dr. [Name]
- **Date**: [Date]
- **Translators Reviewed**: Sahih International, Muhammad Asad
- **Result**: ✅ APPROVED
- **Notes**: Translations accurate and respectful.
```

---

## Test Coverage Requirements

### Coverage Targets

| Category | Target | Minimum | Critical Path |
|----------|--------|---------|---------------|
| **Overall Code Coverage** | 85% | 80% | 100% |
| **Utilities** | 100% | 95% | 100% |
| **Components** | 85% | 80% | 100% |
| **Hooks** | 100% | 95% | 100% |
| **Stores** | 100% | 95% | 100% |
| **Services** | 90% | 85% | 100% |
| **E2E Critical Paths** | 100% | 100% | 100% |

### Coverage Configuration

**Vitest Coverage Config** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test-utils/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
      all: true,
    },
  },
});
```

**Coverage Report Script**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:coverage:view": "open coverage/index.html"
  }
}
```

### Coverage Enforcement

**Pre-commit Hook**:
```bash
#!/bin/bash
# .husky/pre-commit

# Run tests with coverage
npm run test:coverage

# Check if coverage meets thresholds
if [ $? -ne 0 ]; then
  echo "❌ Tests failed or coverage below thresholds"
  exit 1
fi

echo "✅ Tests passed and coverage meets requirements"
```

**CI Coverage Check**:
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

---

## Test Automation Setup

### Project Structure

```
quranApp/
├── src/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       └── Button.a11y.test.tsx
│   ├── hooks/
│   │   ├── useQuranText.ts
│   │   └── useQuranText.test.ts
│   ├── utils/
│   │   ├── arabic.ts
│   │   └── arabic.test.ts
│   └── test-utils/
│       ├── setup.ts
│       ├── builders.ts
│       └── axe.ts
├── e2e/
│   ├── tests/
│   │   ├── onboarding.spec.ts
│   │   ├── reading.spec.ts
│   │   ├── audio.spec.ts
│   │   ├── memorization.spec.ts
│   │   └── accessibility.spec.ts
│   └── fixtures/
│       └── quran-data.ts
├── tests/
│   ├── quran/
│   │   ├── text-verification.test.ts
│   │   └── structure.test.ts
│   └── audio/
│       └── quality.test.ts
├── playwright.config.ts
├── vitest.config.ts
└── .lighthouserc.json
```

### Test Configuration Files

**Vitest Config** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Playwright Config** (`playwright.config.ts`):
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Test Setup File** (`src/test-utils/setup.ts`):
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Audio element
window.HTMLMediaElement.prototype.play = vi.fn();
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();
```

### CI/CD Integration

**GitHub Actions Workflow** (`.github/workflows/test.yml`):
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build app
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun

      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: .lighthouseci/

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: npm run build

      - name: Run Pa11y
        run: |
          npm install -g pa11y-ci
          pa11y-ci --config .pa11yci.json
```

### NPM Scripts

**Package.json**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:a11y": "pa11y-ci --config .pa11yci.json",
    "test:lighthouse": "lhci autorun",
    "test:all": "npm run test:coverage && npm run test:e2e && npm run test:a11y",
    "verify:quran": "ts-node scripts/verify-quran-text.ts",
    "verify:audio": "ts-node scripts/verify-audio-quality.ts"
  }
}
```

---

## Testing Timeline

### Sprint-by-Sprint Testing Plan

**Phase 1: Foundation (Weeks 1-4) - MVP Sprints 1-2**

| Week | Testing Focus | Deliverables |
|------|---------------|--------------|
| **Week 1** | Test infrastructure setup | Vitest config, test utilities, CI/CD pipeline |
| **Week 2** | Core utilities testing | Arabic text utils, navigation utils (100% coverage) |
| **Week 3** | Component testing foundation | Button, Layout, Typography components |
| **Week 4** | Quran text verification | Text accuracy tests, structure tests, scholar review |

**Test Metrics**:
- Unit test coverage: >70%
- Critical utilities: 100% coverage
- Quran text verification: Complete

**Phase 2: Core Reading (Weeks 5-8) - MVP Sprint 3**

| Week | Testing Focus | Deliverables |
|------|---------------|--------------|
| **Week 5** | Mushaf view testing | Page rendering, navigation, verse highlighting |
| **Week 6** | Integration tests | Reading flow, bookmarking, last position |
| **Week 7** | E2E critical path 1 | User reads Quran end-to-end scenario |
| **Week 8** | Performance baseline | Lighthouse CI, load time benchmarks |

**Test Metrics**:
- Unit test coverage: >75%
- Integration test coverage: 50%
- E2E: 1 critical path
- Lighthouse score: >85

**Phase 3: Audio Integration (Weeks 9-12) - MVP Sprint 4**

| Week | Testing Focus | Deliverables |
|------|---------------|--------------|
| **Week 9** | Audio utilities testing | Audio player hooks, reciter management |
| **Week 10** | Audio component testing | Player controls, synchronization |
| **Week 11** | Audio integration tests | Playback flow, verse highlighting |
| **Week 12** | Audio E2E tests | Complete listening session scenario |

**Test Metrics**:
- Unit test coverage: >80%
- Audio verification: Complete
- E2E: 2 critical paths
- Audio quality: Verified by scholar

**Phase 4: Memorization (Weeks 13-16) - MVP Sprint 5**

| Week | Testing Focus | Deliverables |
|------|---------------|--------------|
| **Week 13** | Memorization utilities | Spaced repetition algorithm, progress tracking |
| **Week 14** | Memorization components | Repetition controls, progress visualization |
| **Week 15** | Memorization integration | Complete memorization flow |
| **Week 16** | Memorization E2E | Memorization practice and testing scenarios |

**Test Metrics**:
- Unit test coverage: >82%
- Memorization algorithm: 100% coverage
- E2E: 3 critical paths

**Phase 5: Enhancement (Weeks 17-20) - MVP Sprint 6**

| Week | Testing Focus | Deliverables |
|------|---------------|--------------|
| **Week 17** | Translation testing | Translation switching, display modes |
| **Week 18** | Search testing | Arabic search, translation search, filters |
| **Week 19** | Settings testing | Preferences persistence, theme switching |
| **Week 20** | Offline testing | Service worker, cache management |

**Test Metrics**:
- Unit test coverage: >85%
- E2E: 5 critical paths
- Translation verification: Complete

**Phase 6: Polish & Launch (Weeks 21-24) - MVP Sprint 7**

| Week | Testing Focus | Deliverables |
|------|---------------|--------------|
| **Week 21** | Accessibility audit | WCAG 2.1 AA compliance, screen reader testing |
| **Week 22** | Performance optimization | Lighthouse >90, bundle size optimization |
| **Week 23** | Cross-browser testing | Chrome, Firefox, Safari on desktop and mobile |
| **Week 24** | Final QA and regression | Complete test suite, bug fixes, launch readiness |

**Test Metrics**:
- Unit test coverage: >85%
- E2E: All 6 critical paths
- Lighthouse: >90 all categories
- WCAG 2.1 AA: 100% compliant
- Zero critical bugs

---

## Quality Gates

### Pre-Commit Quality Gates

**Automated Checks**:
```bash
# .husky/pre-commit

# 1. Linting
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi

# 2. Type checking
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed"
  exit 1
fi

# 3. Unit tests for changed files
npm run test:changed
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

### Pull Request Quality Gates

**Required Checks**:
1. ✅ All unit tests pass
2. ✅ Code coverage ≥ 80%
3. ✅ No TypeScript errors
4. ✅ No ESLint errors
5. ✅ E2E tests pass (critical paths)
6. ✅ Lighthouse score ≥ 85
7. ✅ Accessibility checks pass
8. ✅ Code review approved (2 reviewers)

**Branch Protection Rules**:
```yaml
# GitHub branch protection for main/develop
required_status_checks:
  - unit-tests
  - e2e-tests
  - performance-tests
  - accessibility-tests
  - code-coverage
required_pull_request_reviews:
  required_approving_review_count: 2
enforce_admins: true
```

### Pre-Release Quality Gates

**Release Checklist**:
- [ ] All unit tests pass (100%)
- [ ] All integration tests pass (100%)
- [ ] All E2E tests pass (6 critical paths)
- [ ] Code coverage ≥ 85%
- [ ] Lighthouse score ≥ 90 (all categories)
- [ ] WCAG 2.1 AA compliance verified
- [ ] Zero high/critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Quran text verified by Islamic scholar
- [ ] Audio verified by recitation expert
- [ ] Translations verified by scholars
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete (iOS, Android)
- [ ] Offline functionality verified
- [ ] Documentation updated
- [ ] Release notes prepared

### Production Monitoring

**Post-Deployment Checks**:
```typescript
// scripts/production-smoke-test.ts
import { test, expect } from '@playwright/test';

test.describe('Production Smoke Test', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('https://quranapp.com');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });
  });

  test('Quran text loads', async ({ page }) => {
    await page.goto('https://quranapp.com');
    const verse = page.getByTestId('verse-1-1');
    await expect(verse).toBeVisible();
    await expect(verse).toContainText(/بِسْمِ/);
  });

  test('audio plays', async ({ page }) => {
    await page.goto('https://quranapp.com');
    await page.getByRole('button', { name: /play/i }).click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  });
});
```

**Real User Monitoring**:
- Track Core Web Vitals (LCP, FID, CLS)
- Monitor error rates and crashes
- Track user engagement metrics
- Monitor API response times
- Alert on performance degradation

---

## Appendix

### Testing Tools and Libraries

**Unit Testing**:
- Vitest - Fast unit test framework
- React Testing Library - Component testing
- @testing-library/user-event - User interaction simulation
- @testing-library/jest-dom - DOM assertions

**E2E Testing**:
- Playwright - Cross-browser automation
- @axe-core/playwright - Accessibility testing
- Lighthouse CI - Performance testing

**Code Quality**:
- ESLint - Code linting
- Prettier - Code formatting
- TypeScript - Type safety
- Husky - Git hooks

**Coverage and Reporting**:
- V8 Coverage - Code coverage
- Codecov - Coverage reporting
- Istanbul - Coverage tooling

### Useful Testing Resources

**Documentation**:
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [React Testing Library](https://testing-library.com/react)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

**Islamic Content Verification**:
- [Tanzil.net](http://tanzil.net) - Quran text source
- [Quranicaudio.com](http://quranicaudio.com) - Audio source
- [Quran.com API](https://quran.api-docs.io) - API documentation

**Performance Tools**:
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-03 | QA Team | Initial testing strategy document |

---

**Document Status**: ✅ Approved for Implementation

**Next Review**: Post-Phase 3 (Week 12)

---

**End of Testing Strategy Document**

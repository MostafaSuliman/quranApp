/**
 * Test data fixtures for E2E tests
 * Contains sample data for Islamic content, user preferences, and test scenarios
 */

export const QURAN_TEST_DATA = {
  // Sample Ayahs for testing (first few verses of Al-Fatiha)
  ayahs: {
    'fatiha-1': {
      surah: 1,
      ayah: 1,
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: 'Bismillahir-Rahmanir-Raheem',
      translation: 'In the name of Allah, the Most Gracious, the Most Merciful'
    },
    'fatiha-2': {
      surah: 1,
      ayah: 2,
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'Alhamdu lillahi rabbil-alameen',
      translation: 'All praise is due to Allah, Lord of all the worlds'
    },
    'fatiha-3': {
      surah: 1,
      ayah: 3,
      arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: 'Ar-Rahmanir-Raheem',
      translation: 'The Most Gracious, the Most Merciful'
    }
  },

  // Surah information
  surahs: {
    1: {
      name: 'الفاتحة',
      nameEnglish: 'Al-Fatiha',
      meaning: 'The Opening',
      type: 'Meccan',
      ayahCount: 7
    },
    2: {
      name: 'البقرة',
      nameEnglish: 'Al-Baqarah',
      meaning: 'The Cow',
      type: 'Medinan',
      ayahCount: 286
    },
    112: {
      name: 'الإخلاص',
      nameEnglish: 'Al-Ikhlas',
      meaning: 'The Sincerity',
      type: 'Meccan',
      ayahCount: 4
    }
  }
};

export const ISLAMIC_TEST_DATA = {
  // Prayer times for New York (for testing)
  prayerTimes: {
    location: { lat: 40.7128, lng: -74.0060, city: 'New York' },
    times: {
      fajr: '05:30',
      dhuhr: '12:15',
      asr: '15:45',
      maghrib: '18:20',
      isha: '19:50'
    }
  },

  // Qibla direction test data
  qibla: {
    newYork: { lat: 40.7128, lng: -74.0060, direction: 58.48 },
    london: { lat: 51.5074, lng: -0.1278, direction: 118.98 },
    istanbul: { lat: 41.0082, lng: 28.9784, direction: 146.57 }
  },

  // Hijri calendar test dates
  hijriDates: {
    '2024-01-01': '1445-06-19', // Gregorian to Hijri
    '2024-03-11': '1445-09-01', // Start of Ramadan 2024 (estimated)
    '2024-04-10': '1445-10-01'  // Eid al-Fitr 2024 (estimated)
  },

  // Islamic months in Arabic
  islamicMonths: [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ],

  // Common duas for testing
  duas: {
    morningDuas: [
      {
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
        transliteration: 'Asbahna wa asbahal-mulku lillah',
        translation: 'We have reached the morning and with it all sovereignty belongs to Allah'
      }
    ],
    travelDuas: [
      {
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
        transliteration: 'Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrineen',
        translation: 'Glory to Him who has subjected this to us, and we could never have it (by our efforts)'
      }
    ]
  },

  // 99 Names of Allah (sample)
  asmaUlHusna: [
    { arabic: 'الرَّحْمَٰن', transliteration: 'Ar-Rahman', meaning: 'The Most Gracious' },
    { arabic: 'الرَّحِيم', transliteration: 'Ar-Raheem', meaning: 'The Most Merciful' },
    { arabic: 'الْمَلِك', transliteration: 'Al-Malik', meaning: 'The King' },
    { arabic: 'الْقُدُّوس', transliteration: 'Al-Quddus', meaning: 'The Most Holy' }
  ]
};

export const USER_TEST_DATA = {
  // Test user profiles
  users: {
    beginner: {
      experience: 'beginner',
      goals: ['learning', 'basic-reading'],
      language: 'en',
      completedOnboarding: true,
      preferences: {
        theme: 'light',
        fontSize: 16,
        reciter: 'mishary',
        playbackSpeed: 1.0
      }
    },
    intermediate: {
      experience: 'intermediate',
      goals: ['memorization', 'tajweed'],
      language: 'en',
      completedOnboarding: true,
      preferences: {
        theme: 'dark',
        fontSize: 18,
        reciter: 'sudais',
        playbackSpeed: 0.8
      }
    },
    advanced: {
      experience: 'advanced',
      goals: ['teaching', 'research', 'memorization'],
      language: 'ar',
      completedOnboarding: true,
      preferences: {
        theme: 'auto',
        fontSize: 20,
        reciter: 'husary',
        playbackSpeed: 1.2
      }
    }
  },

  // Test memorization progress
  memorizationProgress: {
    beginner: {
      memorizedAyahs: ['1:1', '1:2', '1:3'],
      currentGoal: 'surah-1',
      streak: 7,
      accuracy: 85
    },
    intermediate: {
      memorizedAyahs: ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7', '112:1', '112:2'],
      currentGoal: 'surah-112',
      streak: 23,
      accuracy: 92
    }
  },

  // Test bookmarks
  bookmarks: [
    { surah: 2, ayah: 255, note: 'Ayat al-Kursi' },
    { surah: 17, ayah: 110, note: 'Beautiful dua' },
    { surah: 55, ayah: 13, note: 'Reflect on this' }
  ]
};

export const AUDIO_TEST_DATA = {
  // Available reciters for testing
  reciters: [
    {
      id: 'mishary',
      name: 'Mishary Rashid Alafasy',
      nameArabic: 'مشاري بن راشد العفاسي',
      country: 'Kuwait'
    },
    {
      id: 'sudais',
      name: 'Abdul Rahman Al-Sudais',
      nameArabic: 'عبد الرحمن السديس',
      country: 'Saudi Arabia'
    },
    {
      id: 'husary',
      name: 'Mahmoud Khalil Al-Husary',
      nameArabic: 'محمود خليل الحصري',
      country: 'Egypt'
    }
  ],

  // Audio quality settings
  qualitySettings: [
    { id: 'low', bitrate: '32kbps', size: 'Small' },
    { id: 'medium', bitrate: '64kbps', size: 'Medium' },
    { id: 'high', bitrate: '128kbps', size: 'Large' }
  ],

  // Playback speeds
  playbackSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
};

export const PERFORMANCE_TEST_DATA = {
  // Performance thresholds
  thresholds: {
    pageLoad: 3000, // 3 seconds
    firstContentfulPaint: 1800, // 1.8 seconds
    largestContentfulPaint: 2500, // 2.5 seconds
    navigation: 500, // 500ms
    search: 2000, // 2 seconds
    audioLoad: 5000 // 5 seconds
  },

  // Memory usage limits
  memoryLimits: {
    initialLoad: 50 * 1024 * 1024, // 50MB
    afterNavigation: 100 * 1024 * 1024, // 100MB
    maxIncrease: 10 * 1024 * 1024 // 10MB per major operation
  },

  // Bundle size limits
  bundleLimits: {
    initialJS: 500 * 1024, // 500KB
    totalAssets: 2 * 1024 * 1024, // 2MB
    images: 1 * 1024 * 1024 // 1MB
  }
};

export const DEVICE_TEST_DATA = {
  // Device configurations for testing
  devices: [
    {
      name: 'Mobile Portrait',
      viewport: { width: 375, height: 667 },
      userAgent: 'Mobile'
    },
    {
      name: 'Mobile Landscape',
      viewport: { width: 667, height: 375 },
      userAgent: 'Mobile'
    },
    {
      name: 'Tablet Portrait',
      viewport: { width: 768, height: 1024 },
      userAgent: 'Tablet'
    },
    {
      name: 'Tablet Landscape',
      viewport: { width: 1024, height: 768 },
      userAgent: 'Tablet'
    },
    {
      name: 'Desktop',
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Desktop'
    }
  ]
};

export const ACCESSIBILITY_TEST_DATA = {
  // WCAG guidelines to test
  wcagCriteria: [
    '1.1.1', // Non-text Content
    '1.3.1', // Info and Relationships
    '1.4.3', // Contrast (Minimum)
    '2.1.1', // Keyboard
    '2.4.1', // Bypass Blocks
    '2.4.2', // Page Titled
    '3.1.1', // Language of Page
    '4.1.1', // Parsing
    '4.1.2'  // Name, Role, Value
  ],

  // Color contrast ratios
  contrastRatios: {
    normalText: 4.5,
    largeText: 3.0,
    uiComponents: 3.0
  },

  // Keyboard navigation test sequences
  keyboardSequences: [
    ['Tab', 'Tab', 'Enter'], // Navigate and activate
    ['Tab', 'Space'], // Navigate and select
    ['Tab', 'ArrowDown', 'Enter'], // Navigate dropdown
    ['Escape'] // Close dialog
  ]
};

export const LOCALIZATION_TEST_DATA = {
  // RTL languages
  rtlLanguages: ['ar', 'he', 'fa', 'ur'],

  // LTR languages
  ltrLanguages: ['en', 'fr', 'de', 'es', 'tr', 'id', 'ms'],

  // Text direction test strings
  testStrings: {
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    english: 'In the name of Allah, the Most Gracious, the Most Merciful',
    mixed: 'This is English text with Arabic: اللَّهِ'
  }
};

// Helper functions for test data
export const testDataHelpers = {
  /**
   * Get random ayah for testing
   */
  getRandomAyah() {
    const ayahKeys = Object.keys(QURAN_TEST_DATA.ayahs);
    const randomKey = ayahKeys[Math.floor(Math.random() * ayahKeys.length)];
    return QURAN_TEST_DATA.ayahs[randomKey as keyof typeof QURAN_TEST_DATA.ayahs];
  },

  /**
   * Get test user by experience level
   */
  getTestUser(experience: 'beginner' | 'intermediate' | 'advanced') {
    return USER_TEST_DATA.users[experience];
  },

  /**
   * Get prayer times for location
   */
  getPrayerTimes(location: string = 'newYork') {
    return ISLAMIC_TEST_DATA.prayerTimes;
  },

  /**
   * Get device configuration
   */
  getDevice(deviceName: string) {
    return DEVICE_TEST_DATA.devices.find(device => 
      device.name.toLowerCase().includes(deviceName.toLowerCase())
    );
  },

  /**
   * Generate test location
   */
  generateTestLocation(city: string = 'TestCity') {
    return {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      city
    };
  }
};
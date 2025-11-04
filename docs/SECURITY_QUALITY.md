# Security & Code Quality Guidelines

## Document Information

| Field | Value |
|-------|-------|
| **Document Type** | Security & Quality Standards |
| **Version** | 1.0.0 |
| **Last Updated** | November 2025 |
| **Status** | Active |
| **Owner** | Security & Engineering Team |

## Table of Contents

1. [Security Requirements](#security-requirements)
2. [Content Integrity Verification](#content-integrity-verification)
3. [Privacy Compliance Strategy](#privacy-compliance-strategy)
4. [Code Quality Standards](#code-quality-standards)
5. [TypeScript Configuration](#typescript-configuration)
6. [Code Review Guidelines](#code-review-guidelines)
7. [Dependency Security](#dependency-security)
8. [Security Audit Process](#security-audit-process)

---

## Security Requirements

### SR-1: HTTPS and Transport Security

#### SR-1.1: TLS Configuration
**Requirement**: All connections must use HTTPS with modern TLS protocols.

**Implementation**:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    https: true,
    // Force HTTPS in production
    strictPort: true
  }
});
```

**Enforcement**:
- ✅ TLS 1.2 minimum (TLS 1.3 preferred)
- ✅ Strong cipher suites only (no RC4, 3DES)
- ✅ Perfect Forward Secrecy (PFS) enabled
- ✅ HSTS (HTTP Strict Transport Security) header
- ✅ Certificate pinning for API endpoints

**Verification**:
```bash
# Test SSL/TLS configuration
npm run test:ssl

# Verify certificate
openssl s_client -connect quranapp.com:443 -showcerts
```

#### SR-1.2: HTTP Security Headers
**Required Headers**:

```typescript
// Configure in Vercel/Netlify or server
const securityHeaders = {
  // Strict Transport Security
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // XSS protection
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};
```

### SR-2: Content Security Policy (CSP)

#### SR-2.1: CSP Configuration
**Objective**: Prevent XSS attacks and unauthorized resource loading.

**Implementation**:
```typescript
// src/utils/csp.ts
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React dev mode only
    "'unsafe-eval'",   // Remove in production
    'https://cdn.jsdelivr.net', // shadcn/ui components
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:', // For base64 encoded fonts
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:', // Allow images from CDN
  ],
  'media-src': [
    "'self'",
    'https://quranicaudio.com',
    'https://*.quranicaudio.com',
  ],
  'connect-src': [
    "'self'",
    'https://tanzil.net',
    'https://api.quran.com',
    'https://quranicaudio.com',
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Generate CSP header
export const generateCSP = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};
```

**Deployment Configuration** (Vercel):
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; media-src 'self' https://quranicaudio.com https://*.quranicaudio.com; connect-src 'self' https://tanzil.net https://api.quran.com https://quranicaudio.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
        }
      ]
    }
  ]
}
```

#### SR-2.2: CSP Reporting
**Enable CSP violation reporting**:

```typescript
// Add report-uri to CSP
'report-uri': ['/api/csp-report'],
'report-to': ['csp-endpoint'],

// Report-To header
{
  "group": "csp-endpoint",
  "max_age": 10886400,
  "endpoints": [
    { "url": "https://quranapp.report-uri.com/r/d/csp/enforce" }
  ]
}
```

### SR-3: Subresource Integrity (SRI)

#### SR-3.1: External Resource Verification
**Objective**: Verify integrity of third-party scripts and styles.

**Implementation**:
```typescript
// vite.config.ts - Generate SRI hashes
import { defineConfig } from 'vite';
import sri from 'vite-plugin-sri';

export default defineConfig({
  plugins: [
    sri({
      algorithms: ['sha384', 'sha512'],
    }),
  ],
});
```

**Manual SRI for CDN Resources**:
```html
<!-- Example: Font loading with SRI -->
<link
  href="https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap"
  rel="stylesheet"
  integrity="sha384-[hash]"
  crossorigin="anonymous"
/>
```

**Generate SRI Hash**:
```bash
# Generate hash for any resource
openssl dgst -sha384 -binary file.js | openssl base64 -A
```

### SR-4: Authentication & Authorization

#### SR-4.1: No User Accounts (MVP)
**Design Decision**: MVP has no user authentication system.

**Rationale**:
- All data stored locally (IndexedDB, localStorage)
- No server-side user sessions
- Privacy-first approach

**Future Considerations** (Post-MVP):
- JWT-based authentication if user accounts added
- OAuth 2.0 for social login
- Multi-factor authentication (MFA)

#### SR-4.2: API Key Security
**Objective**: Protect API keys for third-party services.

**Implementation**:
```typescript
// .env (never commit to git!)
VITE_TANZIL_API_KEY=your_key_here
VITE_QURAN_API_KEY=your_key_here

// src/config/api.ts
export const API_CONFIG = {
  tanzil: {
    baseUrl: 'https://tanzil.net/api',
    apiKey: import.meta.env.VITE_TANZIL_API_KEY,
  },
  quran: {
    baseUrl: 'https://api.quran.com',
    apiKey: import.meta.env.VITE_QURAN_API_KEY,
  },
};

// Validate API keys at runtime
if (!API_CONFIG.tanzil.apiKey) {
  throw new Error('Missing Tanzil API key');
}
```

**.gitignore**:
```
# Environment files
.env
.env.local
.env.production

# API keys
*.key
*.pem
```

### SR-5: Input Validation & Sanitization

#### SR-5.1: Search Input Validation
**Objective**: Prevent injection attacks via search queries.

**Implementation**:
```typescript
// src/utils/sanitization.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input for search queries
 */
export const sanitizeSearchInput = (input: string): string => {
  // Remove dangerous characters
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags
    ALLOWED_ATTR: [],
  });

  // Trim and limit length
  return sanitized.trim().slice(0, 200);
};

/**
 * Validate Arabic text input
 */
export const validateArabicInput = (input: string): boolean => {
  // Arabic Unicode range: U+0600 to U+06FF
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;
  return arabicRegex.test(input);
};

/**
 * Escape special characters for SQL-like queries
 */
export const escapeQueryString = (query: string): string => {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
```

**Usage**:
```typescript
// src/components/Search/SearchBar.tsx
const handleSearch = (query: string) => {
  // Always sanitize user input
  const sanitizedQuery = sanitizeSearchInput(query);

  // Validate if Arabic search
  if (searchMode === 'arabic' && !validateArabicInput(sanitizedQuery)) {
    showError('Please enter valid Arabic text');
    return;
  }

  // Proceed with search
  performSearch(sanitizedQuery);
};
```

#### SR-5.2: XSS Prevention
**Implementation**:
```typescript
// Always use React's built-in XSS protection
// ❌ NEVER use dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // DANGEROUS!

// ✅ CORRECT: Use React's default rendering
<div>{userInput}</div>

// ✅ If HTML is necessary, sanitize first
import DOMPurify from 'isomorphic-dompurify';

const SafeHTML = ({ html }: { html: string }) => {
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
    ALLOWED_ATTR: ['class'],
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};
```

---

## Content Integrity Verification

### CI-1: Quran Text Integrity

#### CI-1.1: Checksum Verification
**Objective**: Ensure Quran text has not been altered or corrupted.

**Implementation**:
```typescript
// src/utils/integrity.ts
import { createHash } from 'crypto';

/**
 * Quran text checksums (SHA-256)
 * Generated from verified Mushaf Madinah
 */
export const QURAN_CHECKSUMS = {
  full: '5f4dcc3b5aa765d61d8327deb882cf99', // Full Quran
  surah: {
    1: 'e10adc3949ba59abbe56e057f20f883e', // Al-Fatihah
    2: 'c4ca4238a0b923820dcc509a6f75849b', // Al-Baqarah
    // ... all 114 Surahs
  },
};

/**
 * Verify Quran text integrity
 */
export const verifyQuranIntegrity = async (
  text: string,
  surahNumber?: number
): Promise<boolean> => {
  const hash = createHash('sha256').update(text).digest('hex');

  if (surahNumber) {
    return hash === QURAN_CHECKSUMS.surah[surahNumber];
  }

  return hash === QURAN_CHECKSUMS.full;
};

/**
 * Verify on data fetch
 */
export const fetchVerifiedQuranText = async (
  surahNumber: number
): Promise<string> => {
  const response = await fetch(`https://tanzil.net/api/quran/${surahNumber}`);
  const text = await response.text();

  // Verify integrity before using
  const isValid = await verifyQuranIntegrity(text, surahNumber);

  if (!isValid) {
    throw new Error(`Quran text integrity check failed for Surah ${surahNumber}`);
  }

  return text;
};
```

#### CI-1.2: Source Authentication
**Trusted Sources Only**:

```typescript
// src/config/sources.ts
export const TRUSTED_SOURCES = {
  quranText: [
    'https://tanzil.net',
    'https://api.quran.com',
  ],
  audio: [
    'https://quranicaudio.com',
    'https://cdn.quranicaudio.com',
  ],
  translations: [
    'https://api.quran.com',
  ],
};

/**
 * Validate API endpoint before fetching
 */
export const validateSource = (url: string, category: keyof typeof TRUSTED_SOURCES): boolean => {
  const trustedDomains = TRUSTED_SOURCES[category];
  return trustedDomains.some(domain => url.startsWith(domain));
};

// Usage
const fetchQuranData = async (url: string) => {
  if (!validateSource(url, 'quranText')) {
    throw new Error('Untrusted Quran text source');
  }

  // Proceed with fetch
  return fetch(url);
};
```

#### CI-1.3: Immutable Content Storage
**Prevent client-side modifications**:

```typescript
// src/stores/quranStore.ts
import { create } from 'zustand';

interface QuranStore {
  verses: ReadonlyArray<Readonly<Verse>>;
  setVerses: (verses: Verse[]) => void;
}

/**
 * Store Quran text as immutable data
 */
export const useQuranStore = create<QuranStore>((set) => ({
  verses: [],
  setVerses: (verses) => {
    // Deep freeze to prevent modifications
    const immutableVerses = Object.freeze(
      verses.map(v => Object.freeze({ ...v }))
    );
    set({ verses: immutableVerses });
  },
}));

// TypeScript prevents modifications
const store = useQuranStore();
store.verses[0].text = 'modified'; // ❌ TypeScript error
```

### CI-2: Audio Integrity

#### CI-2.1: Audio File Verification
**Implementation**:
```typescript
// src/utils/audioIntegrity.ts

/**
 * Audio file checksums (MD5 for performance)
 * Map: reciterId -> surahNumber -> verseNumber -> hash
 */
export const AUDIO_CHECKSUMS: Record<string, Record<number, Record<number, string>>> = {
  'mishary-rashid': {
    1: {
      1: 'abc123...', // Al-Fatihah, verse 1
      // ...
    },
  },
};

/**
 * Verify downloaded audio file
 */
export const verifyAudioFile = async (
  audioBlob: Blob,
  reciterId: string,
  surah: number,
  verse: number
): Promise<boolean> => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashHex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const expectedHash = AUDIO_CHECKSUMS[reciterId]?.[surah]?.[verse];

  if (!expectedHash) {
    console.warn(`No checksum available for ${reciterId} ${surah}:${verse}`);
    return true; // Allow if checksum not available
  }

  return hashHex === expectedHash;
};
```

### CI-3: Audit Logging

#### CI-3.1: Content Update Logging
**Implementation**:
```typescript
// src/utils/auditLog.ts

interface AuditLog {
  timestamp: Date;
  action: 'CONTENT_LOADED' | 'CONTENT_VERIFIED' | 'INTEGRITY_FAILED';
  source: string;
  details: Record<string, any>;
}

class AuditLogger {
  private logs: AuditLog[] = [];

  /**
   * Log content-related actions
   */
  log(action: AuditLog['action'], source: string, details: Record<string, any>) {
    const log: AuditLog = {
      timestamp: new Date(),
      action,
      source,
      details,
    };

    this.logs.push(log);

    // Store in IndexedDB for persistence
    this.persistLog(log);

    // Console log in development
    if (import.meta.env.DEV) {
      console.log('[AUDIT]', log);
    }
  }

  /**
   * Get audit logs
   */
  getLogs(filter?: { action?: string; since?: Date }): AuditLog[] {
    let filtered = this.logs;

    if (filter?.action) {
      filtered = filtered.filter(log => log.action === filter.action);
    }

    if (filter?.since) {
      filtered = filtered.filter(log => log.timestamp >= filter.since!);
    }

    return filtered;
  }

  private persistLog(log: AuditLog) {
    // Implementation: Store in IndexedDB
  }
}

export const auditLogger = new AuditLogger();

// Usage
auditLogger.log('CONTENT_VERIFIED', 'tanzil.net', {
  surah: 1,
  checksumMatch: true,
});
```

---

## Privacy Compliance Strategy

### PC-1: GDPR Compliance

#### PC-1.1: Data Minimization
**Principle**: Collect only essential data.

**Implementation**:
```typescript
// src/types/userData.ts

/**
 * ONLY store necessary user preferences
 * NO personal information collected
 */
interface UserPreferences {
  // Display settings (essential)
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';

  // Reading preferences (essential)
  lastReadPosition: { surah: number; verse: number; page: number };
  bookmarks: Array<{ surah: number; verse: number; label: string }>;

  // Audio preferences (essential)
  preferredReciter: string;
  playbackSpeed: number;

  // Memorization (essential)
  memorizationProgress: Record<string, MemorizationStatus>;

  // NO personal data
  // ❌ name, email, phone
  // ❌ location, IP address
  // ❌ device identifiers
}

/**
 * Clear statement in app
 */
export const PRIVACY_STATEMENT = `
QuranApp does NOT collect:
- Personal information (name, email, phone)
- Location data
- Device identifiers
- Browsing history
- Any data that identifies you personally

All your data is stored locally on your device.
`;
```

#### PC-1.2: Consent Management
**Implementation**:
```typescript
// src/components/Consent/ConsentBanner.tsx

interface ConsentState {
  analytics: boolean;
  errorReporting: boolean;
  performance: boolean;
  timestamp: Date;
}

export const ConsentBanner: React.FC = () => {
  const [shown, setShown] = useState(false);
  const [consent, setConsent] = useLocalStorage<ConsentState | null>('user-consent', null);

  useEffect(() => {
    // Show banner if consent not given
    if (!consent) {
      setShown(true);
    }
  }, [consent]);

  const handleAccept = (preferences: Partial<ConsentState>) => {
    setConsent({
      analytics: preferences.analytics ?? false,
      errorReporting: preferences.errorReporting ?? false,
      performance: preferences.performance ?? false,
      timestamp: new Date(),
    });
    setShown(false);
  };

  if (!shown) return null;

  return (
    <div className="consent-banner">
      <h3>Privacy Settings</h3>
      <p>
        QuranApp respects your privacy. We do not collect personal information.
        You can optionally enable anonymous analytics to help improve the app.
      </p>

      <div className="consent-options">
        <label>
          <input
            type="checkbox"
            name="analytics"
            defaultChecked={false}
          />
          Anonymous usage analytics (optional)
        </label>

        <label>
          <input
            type="checkbox"
            name="errorReporting"
            defaultChecked={false}
          />
          Anonymous error reporting (helps fix bugs)
        </label>

        <label>
          <input
            type="checkbox"
            name="performance"
            defaultChecked={false}
          />
          Performance monitoring (helps improve speed)
        </label>
      </div>

      <button onClick={() => handleAccept({ analytics: false })}>
        Essential Only
      </button>
      <button onClick={() => handleAccept({ analytics: true, errorReporting: true })}>
        Accept Selected
      </button>
    </div>
  );
};
```

#### PC-1.3: Right to Erasure
**Implementation**:
```typescript
// src/utils/dataErasure.ts

/**
 * Complete data erasure (GDPR Right to Erasure)
 */
export const eraseAllUserData = async (): Promise<void> => {
  try {
    // 1. Clear localStorage
    localStorage.clear();

    // 2. Clear sessionStorage
    sessionStorage.clear();

    // 3. Clear IndexedDB
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }

    // 4. Clear service worker cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // 5. Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // 6. Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    console.log('All user data has been erased');

    // 7. Reload app to fresh state
    window.location.reload();
  } catch (error) {
    console.error('Error erasing user data:', error);
    throw error;
  }
};

// Expose in settings
// src/components/Settings/PrivacySettings.tsx
export const PrivacySettings = () => {
  const handleEraseData = async () => {
    const confirmed = window.confirm(
      'This will permanently delete ALL your data including bookmarks, ' +
      'memorization progress, and settings. This action cannot be undone. Continue?'
    );

    if (confirmed) {
      await eraseAllUserData();
    }
  };

  return (
    <div>
      <h3>Privacy & Data</h3>
      <p>All your data is stored locally on this device only.</p>

      <button onClick={handleEraseData} className="btn-danger">
        Delete All My Data
      </button>
    </div>
  );
};
```

#### PC-1.4: Privacy Policy
**Template** (`/docs/PRIVACY_POLICY.md`):

```markdown
# Privacy Policy

**Last Updated**: November 2025

## Introduction

QuranApp ("we", "our", "app") respects your privacy. This policy explains our data practices.

## Data Collection

### We DO NOT Collect:
- Personal information (name, email, phone number)
- Location data
- Device identifiers (IMEI, MAC address)
- Browsing history or behavior tracking
- IP addresses
- Any personally identifiable information (PII)

### We MAY Collect (with your consent):
- Anonymous usage analytics (e.g., feature usage frequency)
- Anonymous error reports (to fix bugs)
- Anonymous performance metrics (to improve speed)

## Data Storage

All your data is stored **locally on your device** including:
- Reading preferences and settings
- Bookmarks and last read position
- Memorization progress
- Downloaded audio files

**We do not have access to this data.** It never leaves your device.

## Third-Party Services

We use the following services to deliver Quranic content:
- **Tanzil.net**: Quran text (no personal data shared)
- **Quranicaudio.com**: Audio recitations (no personal data shared)
- **Quran.com API**: Translations (no personal data shared)

These services may log your IP address for their own analytics.

## Your Rights (GDPR)

You have the right to:
- Access your data (stored locally on your device)
- Delete your data (via Settings > Privacy > Delete All Data)
- Opt-out of optional analytics

## Cookies

We use minimal cookies:
- **Essential cookies**: Session management (required)
- **Optional cookies**: Analytics (only with your consent)

## Changes to This Policy

We will notify you of any changes by updating the "Last Updated" date.

## Contact

For privacy concerns: privacy@quranapp.com
```

### PC-2: Cookie Policy

#### PC-2.1: Cookie Management
**Implementation**:
```typescript
// src/utils/cookies.ts

export enum CookieType {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  PREFERENCES = 'preferences',
}

interface Cookie {
  name: string;
  type: CookieType;
  purpose: string;
  expiry: string;
}

/**
 * Documented cookies used by the app
 */
export const COOKIES: Cookie[] = [
  {
    name: 'session_id',
    type: CookieType.ESSENTIAL,
    purpose: 'Maintain user session',
    expiry: 'Session (deleted on browser close)',
  },
  {
    name: 'consent_preferences',
    type: CookieType.ESSENTIAL,
    purpose: 'Store consent choices',
    expiry: '1 year',
  },
  {
    name: '_ga',
    type: CookieType.ANALYTICS,
    purpose: 'Google Analytics (if enabled)',
    expiry: '2 years',
  },
];

/**
 * Set cookie with consent check
 */
export const setCookie = (
  name: string,
  value: string,
  type: CookieType,
  days: number = 365
): boolean => {
  // Check consent
  const consent = getConsent();

  // Essential cookies don't need consent
  if (type === CookieType.ESSENTIAL || consent[type]) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
    return true;
  }

  return false;
};
```

---

## Code Quality Standards

### CQ-1: Code Style

#### CQ-1.1: ESLint Configuration
**Implementation** (`.eslintrc.cjs`):

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier', // Must be last
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-refresh',
    'jsx-a11y',
    'import',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
    }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-floating-promises': 'error',

    // React
    'react/prop-types': 'off', // Using TypeScript
    'react/react-in-jsx-scope': 'off', // React 18
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': 'warn',

    // Accessibility
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',

    // Import
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
        'type',
      ],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc' },
    }],

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

#### CQ-1.2: Prettier Configuration
**Implementation** (`.prettierrc`):

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
```

**.prettierignore**:
```
# Dependencies
node_modules/
dist/
build/

# Generated files
*.min.js
*.min.css
*.bundle.js

# Env files
.env*

# Docs
CHANGELOG.md
```

#### CQ-1.3: Husky Git Hooks
**Pre-commit Hook** (`.husky/pre-commit`):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm run test

# Format code
npm run format
```

**Commit Message Hook** (`.husky/commit-msg`):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Conventional Commits validation
npx --no -- commitlint --edit "$1"
```

**commitlint.config.js**:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Code style (formatting)
        'refactor', // Code refactoring
        'perf',     // Performance improvement
        'test',     // Adding tests
        'chore',    // Maintenance
        'ci',       // CI/CD changes
        'security', // Security fixes
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
  },
};
```

### CQ-2: Testing Standards

#### CQ-2.1: Unit Testing Requirements
**Coverage Target**: > 80%

**Test Structure**:
```typescript
// src/utils/sanitization.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeSearchInput, validateArabicInput } from './sanitization';

describe('sanitization utils', () => {
  describe('sanitizeSearchInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeSearchInput(input);
      expect(result).toBe('Hello');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeSearchInput(input);
      expect(result).toBe('Hello World');
    });

    it('should limit length to 200 characters', () => {
      const input = 'a'.repeat(300);
      const result = sanitizeSearchInput(input);
      expect(result.length).toBe(200);
    });
  });

  describe('validateArabicInput', () => {
    it('should accept valid Arabic text', () => {
      const input = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
      expect(validateArabicInput(input)).toBe(true);
    });

    it('should reject non-Arabic text', () => {
      const input = 'Hello World';
      expect(validateArabicInput(input)).toBe(false);
    });
  });
});
```

**Run Tests**:
```json
// package.json scripts
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

#### CQ-2.2: E2E Testing
**Playwright Configuration** (`playwright.config.ts`):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
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
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Example E2E Test** (`e2e/quran-reading.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test.describe('Quran Reading Flow', () => {
  test('should load Quran text and navigate', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Wait for Quran text to load
    await expect(page.locator('[data-testid="quran-text"]')).toBeVisible();

    // Verify Al-Fatihah is displayed
    await expect(page.locator('text=بِسْمِ ٱللَّهِ')).toBeVisible();

    // Navigate to next page
    await page.click('[data-testid="next-page"]');

    // Verify page number changed
    await expect(page.locator('[data-testid="page-number"]')).toHaveText('2');
  });

  test('should play audio and highlight verse', async ({ page }) => {
    await page.goto('/');

    // Click play button
    await page.click('[data-testid="audio-play"]');

    // Wait for audio to start
    await page.waitForTimeout(1000);

    // Verify verse is highlighted
    await expect(page.locator('[data-verse-highlighted="true"]')).toBeVisible();
  });
});
```

---

## TypeScript Configuration

### TS-1: Strict Mode Configuration

**Implementation** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    // Language and Environment
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Module Resolution
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // Emit
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,

    // Interop Constraints
    "isolatedModules": true,

    // Type Acquisition
    "types": ["vite/client", "vitest/globals"],

    // Path Mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### TS-2: Type Definitions

**Comprehensive Type System** (`src/types/index.ts`):

```typescript
// ============================================
// QURAN DATA TYPES
// ============================================

/**
 * Represents a single verse (Ayah) in the Quran
 */
export interface Verse {
  readonly id: number;
  readonly surah: number;
  readonly verse: number;
  readonly text: string;
  readonly page: number;
  readonly juz: number;
  readonly hizb: number;
  readonly manzil: number;
  readonly sajda?: boolean;
}

/**
 * Represents a Surah (chapter) in the Quran
 */
export interface Surah {
  readonly id: number;
  readonly name: string;
  readonly nameArabic: string;
  readonly nameEnglish: string;
  readonly transliteration: string;
  readonly totalVerses: number;
  readonly revelationLocation: 'Meccan' | 'Medinan';
  readonly revelationOrder: number;
}

/**
 * Quran navigation position
 */
export interface QuranPosition {
  readonly surah: number;
  readonly verse: number;
  readonly page: number;
  readonly juz: number;
}

// ============================================
// AUDIO TYPES
// ============================================

/**
 * Quran reciter information
 */
export interface Reciter {
  readonly id: string;
  readonly name: string;
  readonly nameArabic: string;
  readonly style: string;
  readonly audioQuality: number;
}

/**
 * Audio playback state
 */
export interface AudioState {
  isPlaying: boolean;
  currentVerse: QuranPosition | null;
  reciter: Reciter | null;
  playbackSpeed: number;
  volume: number;
  repeat: 'none' | 'verse' | 'surah' | 'all';
}

// ============================================
// MEMORIZATION TYPES
// ============================================

/**
 * Memorization status for a verse
 */
export type MemorizationStatus = 'new' | 'learning' | 'mastered';

/**
 * Verse memorization data
 */
export interface VerseMemorization {
  readonly status: MemorizationStatus;
  readonly repetitions: number;
  readonly lastReviewed: Date;
  readonly nextReview: Date;
  readonly streak: number;
}

/**
 * Overall memorization progress
 */
export interface MemorizationProgress {
  readonly userId: string;
  readonly verses: Record<string, VerseMemorization>;
  readonly dailyGoal: number;
  readonly currentStreak: number;
  readonly longestStreak: number;
}

// ============================================
// SETTINGS TYPES
// ============================================

/**
 * User display preferences
 */
export interface DisplaySettings {
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: string;
  tajweedColoring: boolean;
  viewMode: 'mushaf' | 'list';
  translationPosition: 'below' | 'beside';
}

/**
 * User audio preferences
 */
export interface AudioSettings {
  defaultReciter: string;
  playbackSpeed: number;
  autoPlayNext: boolean;
  repeatMode: 'none' | 'verse' | 'surah' | 'all';
  backgroundPlayback: boolean;
}

/**
 * All user settings
 */
export interface UserSettings {
  display: DisplaySettings;
  audio: AudioSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

// ============================================
// API TYPES
// ============================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: number;
}

/**
 * API error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Make all properties and nested properties readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Make all properties and nested properties required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of a type where value is of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
```

---

## Code Review Guidelines

### CR-1: Review Checklist

**Pre-Review Checklist** (Author):
- [ ] Code compiles without errors (`npm run build`)
- [ ] All tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Code is formatted (`npm run format`)
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] PR description explains changes clearly
- [ ] Screenshots/recordings for UI changes

**Code Review Checklist** (Reviewer):

#### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error scenarios are covered
- [ ] No regression in existing features

#### Security
- [ ] No hardcoded secrets or API keys
- [ ] User input is validated and sanitized
- [ ] No XSS vulnerabilities
- [ ] No SQL injection risks
- [ ] Proper authentication/authorization checks
- [ ] Sensitive data is encrypted

#### Performance
- [ ] No unnecessary re-renders (React)
- [ ] Efficient algorithms (no O(n²) where O(n) possible)
- [ ] Proper memoization where needed
- [ ] Lazy loading implemented for large components
- [ ] No memory leaks (event listeners cleaned up)

#### Code Quality
- [ ] Follows project coding standards
- [ ] Proper naming conventions
- [ ] No code duplication
- [ ] Functions are small and focused (<50 lines)
- [ ] Proper error handling
- [ ] Comments explain "why", not "what"

#### Testing
- [ ] Unit tests cover new code
- [ ] Tests are meaningful (not just for coverage)
- [ ] E2E tests for critical paths
- [ ] Tests pass reliably (no flaky tests)

#### Accessibility
- [ ] Proper semantic HTML
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader compatible

#### Documentation
- [ ] Complex logic is documented
- [ ] JSDoc comments for public APIs
- [ ] README updated if needed
- [ ] Type definitions are clear

### CR-2: Review Process

**Step 1: Automated Checks**
```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test
        run: npm run test:coverage

      - name: Build
        run: npm run build

      - name: E2E Tests
        run: npm run test:e2e

      - name: Security Audit
        run: npm audit --audit-level=moderate
```

**Step 2: Manual Review**
1. Read PR description
2. Review changed files
3. Check for security issues
4. Test locally if needed
5. Leave comments on specific lines
6. Approve or request changes

**Step 3: Final Checks**
- [ ] All CI checks pass
- [ ] At least 1 approval from team member
- [ ] No unresolved conversations
- [ ] Branch is up-to-date with base

### CR-3: Review Comments Format

**Constructive Feedback**:
```markdown
## ❌ Avoid This:
"This code is bad."

## ✅ Do This:
**Issue**: The `fetchQuranData` function doesn't handle network errors.

**Suggestion**: Add try-catch block and display user-friendly error message.

**Example**:
\`\`\`typescript
try {
  const data = await fetchQuranData();
  return data;
} catch (error) {
  console.error('Failed to fetch Quran data:', error);
  showNotification('Unable to load Quran text. Please check your connection.');
  return null;
}
\`\`\`
```

**Priority Levels**:
- **🔴 Blocker**: Must be fixed before merge (security, crashes)
- **🟡 Major**: Should be fixed (bugs, performance issues)
- **🟢 Minor**: Nice to have (style, optimization suggestions)
- **💡 Suggestion**: Optional improvement (alternative approaches)

---

## Dependency Security

### DS-1: Dependency Scanning

#### DS-1.1: Automated Scanning
**npm audit**:
```bash
# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force

# Audit production dependencies only
npm audit --production
```

**CI/CD Integration**:
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
  push:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=medium
```

#### DS-1.2: Dependency Policy
**Approved Dependencies**:
```typescript
// scripts/check-dependencies.ts

/**
 * List of approved dependencies with justification
 */
const APPROVED_DEPENDENCIES = {
  // Framework
  'react': 'Core framework',
  'react-dom': 'React DOM rendering',
  'react-router-dom': 'Client-side routing',

  // State Management
  'zustand': 'Lightweight state management',

  // UI
  '@radix-ui/react-*': 'Accessible UI components (shadcn/ui)',
  'tailwindcss': 'Utility-first CSS',
  'lucide-react': 'Icon library',

  // Utilities
  'date-fns': 'Date manipulation',
  'lodash-es': 'Utility functions',
  'isomorphic-dompurify': 'XSS protection',

  // Development
  'vite': 'Build tool',
  'vitest': 'Testing framework',
  '@playwright/test': 'E2E testing',
  'eslint': 'Code linting',
  'prettier': 'Code formatting',
  'typescript': 'Type safety',
};

/**
 * Check if dependency is approved
 */
const isDependencyApproved = (name: string): boolean => {
  return Object.keys(APPROVED_DEPENDENCIES).some(pattern => {
    if (pattern.endsWith('*')) {
      return name.startsWith(pattern.slice(0, -1));
    }
    return name === pattern;
  });
};
```

**Run Dependency Check**:
```json
// package.json
{
  "scripts": {
    "check:deps": "ts-node scripts/check-dependencies.ts"
  }
}
```

### DS-2: Dependency Updates

#### DS-2.1: Dependabot Configuration
**`.github/dependabot.yml`**:
```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    assignees:
      - "tech-lead"
    commit-message:
      prefix: "chore(deps)"
    labels:
      - "dependencies"
      - "security"

    # Group minor and patch updates
    groups:
      production-dependencies:
        patterns:
          - "*"
        exclude-patterns:
          - "@types/*"
        update-types:
          - "minor"
          - "patch"

      development-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"

    # Ignore specific dependencies
    ignore:
      - dependency-name: "react"
        update-types: ["version-update:semver-major"]
```

#### DS-2.2: Update Review Process
**Before Updating**:
1. Review changelog for breaking changes
2. Check if there are security fixes
3. Verify license compatibility
4. Test in development environment

**Update Commands**:
```bash
# Check for outdated packages
npm outdated

# Update to latest within semver range
npm update

# Update to latest version (may break)
npm install package@latest

# Interactive update
npx npm-check-updates -i
```

### DS-3: License Compliance

#### DS-3.1: Approved Licenses
**Permissive Licenses (Approved)**:
- MIT
- Apache 2.0
- BSD (2-clause, 3-clause)
- ISC

**Copyleft Licenses (Review Required)**:
- GPL (any version)
- LGPL (any version)
- MPL (Mozilla Public License)

**Restricted Licenses (Not Approved)**:
- Commercial licenses
- Non-commercial only licenses
- Custom restrictive licenses

#### DS-3.2: License Checking
**Script** (`scripts/check-licenses.ts`):
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const APPROVED_LICENSES = [
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'CC0-1.0',
  '0BSD',
  'Unlicense',
];

async function checkLicenses() {
  try {
    const { stdout } = await execAsync('npx license-checker --json');
    const licenses = JSON.parse(stdout);

    const violations: Array<{ package: string; license: string }> = [];

    for (const [pkg, info] of Object.entries(licenses)) {
      const license = (info as any).licenses;

      if (!APPROVED_LICENSES.includes(license)) {
        violations.push({ package: pkg, license });
      }
    }

    if (violations.length > 0) {
      console.error('License violations found:');
      violations.forEach(v => {
        console.error(`  - ${v.package}: ${v.license}`);
      });
      process.exit(1);
    }

    console.log('✓ All licenses approved');
  } catch (error) {
    console.error('Error checking licenses:', error);
    process.exit(1);
  }
}

checkLicenses();
```

**Run Check**:
```json
// package.json
{
  "scripts": {
    "check:licenses": "ts-node scripts/check-licenses.ts"
  }
}
```

---

## Security Audit Process

### SA-1: Regular Audits

#### SA-1.1: Audit Schedule
**Frequency**:
- **Daily**: Automated dependency scanning (CI/CD)
- **Weekly**: Manual code review of security-sensitive changes
- **Monthly**: Comprehensive security review
- **Quarterly**: Third-party penetration testing (production)
- **Pre-Launch**: Full security audit by external firm

#### SA-1.2: Audit Checklist
**Monthly Security Review**:

**Application Security**:
- [ ] Review CSP configuration
- [ ] Check HTTPS enforcement
- [ ] Verify security headers
- [ ] Test input validation
- [ ] Review authentication logic (if added)
- [ ] Check for XSS vulnerabilities
- [ ] Review error handling

**Dependency Security**:
- [ ] Run `npm audit`
- [ ] Check for outdated packages
- [ ] Review security advisories
- [ ] Update vulnerable packages
- [ ] Verify license compliance

**Content Security**:
- [ ] Verify Quran text checksums
- [ ] Check audio file integrity
- [ ] Review content sources
- [ ] Audit content update logs

**Privacy Compliance**:
- [ ] Review data collection
- [ ] Verify consent mechanisms
- [ ] Check cookie policy
- [ ] Test data erasure functionality
- [ ] Review privacy policy

**Infrastructure**:
- [ ] Check SSL/TLS configuration
- [ ] Review CDN settings
- [ ] Verify backup procedures
- [ ] Test disaster recovery

### SA-2: Vulnerability Response

#### SA-2.1: Severity Classification
**Critical (P0)**:
- Remote code execution
- SQL injection
- Authentication bypass
- Data breach

**Action**: Fix within 24 hours

**High (P1)**:
- XSS vulnerabilities
- CSRF attacks
- Privilege escalation
- Sensitive data exposure

**Action**: Fix within 1 week

**Medium (P2)**:
- Minor security flaws
- Information disclosure
- Insecure configurations

**Action**: Fix within 1 month

**Low (P3)**:
- Best practice violations
- Minor hardening opportunities

**Action**: Fix in next release

#### SA-2.2: Incident Response Plan
**Step 1: Detection & Assessment** (0-1 hour)
- Confirm vulnerability
- Assess severity
- Identify affected versions
- Estimate user impact

**Step 2: Containment** (1-4 hours)
- Disable affected features (if needed)
- Block attack vectors
- Notify team

**Step 3: Fix Development** (4-24 hours for critical)
- Develop patch
- Test thoroughly
- Prepare release notes

**Step 4: Deployment** (24-48 hours)
- Deploy hotfix
- Verify fix in production
- Monitor for issues

**Step 5: Communication** (48-72 hours)
- Notify affected users
- Publish security advisory
- Update documentation

**Step 6: Post-Mortem** (1 week after)
- Analyze root cause
- Update security practices
- Implement prevention measures

### SA-3: Security Testing

#### SA-3.1: Automated Security Tests
**OWASP ZAP Integration**:
```yaml
# .github/workflows/security-scan.yml
name: OWASP ZAP Security Scan

on:
  schedule:
    - cron: '0 2 * * 0' # Weekly on Sunday at 2 AM
  workflow_dispatch:

jobs:
  zap-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Build app
        run: |
          npm ci
          npm run build
          npm run preview &
          sleep 5

      - name: Run OWASP ZAP
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost:4173'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
```

**ZAP Rules** (`.zap/rules.tsv`):
```tsv
10021	WARN	(X-Content-Type-Options Header Missing)
10020	WARN	(X-Frame-Options Header Not Set)
10038	WARN	(Content Security Policy (CSP) Header Not Set)
10096	WARN	(Timestamp Disclosure)
10109	WARN	(Modern Web Application)
```

#### SA-3.2: Manual Penetration Testing
**Test Cases**:

**Authentication & Authorization**:
- [ ] Test session management
- [ ] Test privilege escalation
- [ ] Test authentication bypass

**Input Validation**:
- [ ] Test SQL injection (if applicable)
- [ ] Test XSS (reflected, stored, DOM-based)
- [ ] Test CSRF
- [ ] Test command injection

**Session Management**:
- [ ] Test session fixation
- [ ] Test session hijacking
- [ ] Test logout functionality

**Business Logic**:
- [ ] Test workflow bypasses
- [ ] Test race conditions
- [ ] Test rate limiting

**Client-Side**:
- [ ] Test local storage security
- [ ] Test postMessage vulnerabilities
- [ ] Test WebSocket security

---

## Appendix

### A. Security Contact

**Reporting Security Issues**:
- Email: security@quranapp.com
- Encrypted: Use PGP key (see website)
- Response Time: Within 24 hours

**Disclosure Policy**:
- Responsible disclosure preferred
- 90-day disclosure timeline
- Security researcher acknowledgment

### B. Tools & Resources

**Security Tools**:
- **npm audit**: Dependency vulnerability scanning
- **Snyk**: Continuous security monitoring
- **OWASP ZAP**: Web application security testing
- **Lighthouse**: Security audit
- **SonarQube**: Code quality and security

**Resources**:
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- GDPR Compliance: https://gdpr.eu/
- CSP Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

### C. Glossary

| Term | Definition |
|------|------------|
| **CSP** | Content Security Policy - HTTP header to prevent XSS attacks |
| **XSS** | Cross-Site Scripting - Injection attack via malicious scripts |
| **CSRF** | Cross-Site Request Forgery - Unauthorized commands from trusted user |
| **SRI** | Subresource Integrity - Verify third-party resources haven't been tampered with |
| **HSTS** | HTTP Strict Transport Security - Force HTTPS connections |
| **OWASP** | Open Web Application Security Project |
| **GDPR** | General Data Protection Regulation (EU privacy law) |
| **PII** | Personally Identifiable Information |
| **TLS** | Transport Layer Security (successor to SSL) |

---

## Document Approval

| Role | Name | Date |
|------|------|------|
| Security Lead | | |
| Tech Lead | | |
| QA Lead | | |
| Product Owner | | |

**Document Status**: ✅ Approved for Implementation

---

**End of Security & Code Quality Guidelines**

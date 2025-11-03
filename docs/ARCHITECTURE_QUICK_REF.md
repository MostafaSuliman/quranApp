# Architecture Quick Reference - QuranApp

## 🏗️ Core Architecture Patterns

### 1. Orchestrator Pattern (audioStore)
```
┌─────────────────────────────────────┐
│      audioStore (Orchestrator)      │
│   ┌───────────────────────────┐    │
│   │  Unified API (Facade)     │    │
│   └───────────────────────────┘    │
└──────────────┬──────────────────────┘
               │
       ┌───────┼───────┐
       │       │       │
   ┌───▼──┐ ┌──▼──┐ ┌─▼────┐
   │Player│ │Queue│ │Settings│
   │Store │ │Store│ │Store  │
   └──────┘ └─────┘ └───────┘
```

**Benefits:**
- Single entry point for audio operations
- Delegates to specialized stores
- No business logic in orchestrator
- Backward compatible

### 2. Event-Driven Dependency Injection
```
┌──────────────────┐         ┌──────────────────┐
│ preferencesStore │         │ audioSettings    │
│                  │         │ Store            │
└────────┬─────────┘         └────────▲─────────┘
         │                            │
         │  emit('reciter:updated')   │
         └────────►  Event Bus  ──────┘
                   (No circular deps!)
```

**Events:**
- `reciter:updated` - User changes reciter
- `playback-speed:updated` - Speed preference changed
- `settings:changed` - General settings update
- `preferences:sync` - Sync request

### 3. Modular AutoFix System
```
┌─────────────────────────────────────────┐
│         autoFixCore (Orchestrator)      │
└────────┬────────────────────────────────┘
         │
    ┌────┼────┬──────────┐
    │    │    │          │
┌───▼───┐ │  ┌▼──────┐ ┌▼──────────┐
│Detect │ │  │Remediate│ │ Reporting │
│       │ │  │         │ │           │
│ML     │ │  │Self-Heal│ │ Analytics │
│Security│ │ │Fixes    │ │ Metrics   │
│Perf   │ │  │Rollback │ │ Dashboards│
└───────┘ │  └─────────┘ └───────────┘
```

## 📁 File Organization

### Core Services
```
/src/services/
├── logger/
│   └── index.ts              # Centralized logging
│
├── autofix/
│   ├── types.ts              # Type definitions
│   ├── autoFixDetectors.ts   # Issue detection (ML, Security, Perf)
│   ├── autoFixRemediation.ts # Fix implementation
│   ├── autoFixReporting.ts   # Analytics & metrics
│   └── autoFixCore.ts        # Main orchestrator
│
└── islamicContentValidationGuardian.ts
```

### Store Architecture
```
/src/stores/
├── audio/
│   ├── audioEventBus.ts      # Event-driven communication
│   └── index.ts              # Barrel exports
│
├── audioStore.ts             # Orchestrator (facade)
├── audioPlayerStore.ts       # Playback controls
├── audioQueueStore.ts        # Queue management
├── audioSettingsStore.ts     # Settings (reciter, speed, volume)
├── audioSettingsStoreInit.ts # Event listener setup
│
├── preferencesStore.ts       # User preferences
└── audioNavigationStore.ts   # Navigation behavior
```

## 🔌 Import Patterns

### ✅ Correct Imports

```typescript
// Logger (use specialized loggers)
import { audioLogger, storeLogger } from '../services/logger'

// Audio stores (use orchestrator)
import { useAudioStore } from './stores/audioStore'

// Or use specialized stores directly
import { useAudioSettingsStore } from './stores/audioSettingsStore'

// Event bus (for dependency injection)
import { audioEventBus } from './stores/audio/audioEventBus'

// AutoFix (use specific modules)
import { MLDiagnosticEngine } from '../services/autofix/autoFixDetectors'
import type { AutoFixAction } from '../services/autofix/types'
```

### ❌ Avoid These Imports

```typescript
// DON'T: Direct circular imports
import { useAudioSettingsStore } from './audioSettingsStore'
// In preferencesStore - causes circular dependency!

// DON'T: Console.log
console.log('Message') // Use logger instead

// DON'T: Monolithic imports
import { autoFixSystem } from './utils/autoFixSystem' // Old pattern
```

## 🎯 Common Use Cases

### 1. Adding Logging
```typescript
// Before
console.log('Audio loaded')

// After
import { audioLogger } from '../services/logger'
audioLogger.info('Audio loaded', {
  surahNumber,
  ayahNumber,
  reciter: reciter.name
})
```

### 2. Cross-Store Communication
```typescript
// Before (circular dependency)
import { useAudioSettingsStore } from './audioSettingsStore'
useAudioSettingsStore.getState().setReciter(reciter)

// After (event bus)
import { audioEventBus } from './audio/audioEventBus'
audioEventBus.emit('reciter:updated', { reciterId, reciter })
```

### 3. Audio Operations
```typescript
// Using orchestrator (recommended for most cases)
import { useAudioStore } from './stores/audioStore'

const {
  play,
  pause,
  loadAyahAudio,
  setVolume,
  currentAyahNumber
} = useAudioStore()

// Using specialized stores (for specific features)
import { useAudioSettingsStore } from './stores/audioSettingsStore'
const { preferredReciter, setReciter } = useAudioSettingsStore()
```

### 4. AutoFix Integration
```typescript
import { MLDiagnosticEngine } from '../services/autofix/autoFixDetectors'

const mlEngine = new MLDiagnosticEngine()

try {
  // Perform operation
} catch (error) {
  // Analyze with ML
  const diagnostic = await mlEngine.analyzeRootCause(
    error,
    'audioPlayer'
  )

  console.log('Root causes:', diagnostic.rootCauses)
  console.log('Suggested fixes:', diagnostic.suggestedFixes)
  console.log('Risk level:', diagnostic.riskLevel)
}
```

## 🔧 Initialization

### App Startup Sequence
```typescript
// main.tsx or App.tsx
import { initializeAudioSettingsStore } from './stores/audioSettingsStoreInit'
import { logger } from './services/logger'

// 1. Configure logger
logger.configure({
  minLevel: import.meta.env.DEV ? 'debug' : 'info',
  enableConsole: true,
  enableStorage: import.meta.env.DEV
})

// 2. Initialize event listeners
initializeAudioSettingsStore()

// 3. Initialize stores
usePreferencesStore.getState().initialize()
useAudioStore.getState().initializeAudio()
```

## 📊 State Management Flow

### Audio Settings Update Flow
```
User Action
    │
    ▼
preferencesStore.updateReciter(reciterId)
    │
    ▼
audioEventBus.emit('reciter:updated', { reciterId })
    │
    ▼
audioSettingsStore.setReciter(reciter)  [Listener]
    │
    ▼
audioQueueStore (reactive via Zustand)
    │
    ▼
UI Updates
```

### Audio Playback Flow
```
User clicks Play
    │
    ▼
useAudioStore().play()  [Orchestrator]
    │
    ▼
audioPlayerStore.play()  [Specialized Store]
    │
    ├─► Set isPlaying = true
    ├─► Update currentTime
    └─► Handle audio events
         │
         ▼
    UI Updates (React re-render)
```

## 🐛 Debugging

### Logger Inspection
```typescript
import { logger } from '../services/logger'

// Get logs
const allLogs = logger.getLogs()
const errorLogs = logger.getLogs('error', 50)

// Export logs
const logsJson = logger.exportLogs()
console.log(logsJson)

// Listen to logs in real-time
const unsubscribe = logger.onLog((entry) => {
  if (entry.level === 'error') {
    // Send to error tracking service
  }
})
```

### Event Bus Monitoring
```typescript
import { audioEventBus } from './stores/audio/audioEventBus'

// Monitor all reciter updates
const unsubscribe = audioEventBus.on('reciter:updated', (data) => {
  console.log('Reciter changed:', data)
})

// Cleanup when done
unsubscribe()
```

## 🧪 Testing

### Store Testing
```typescript
import { useAudioStore } from './stores/audioStore'

test('audio store delegates to specialized stores', () => {
  const { play, pause, setVolume } = useAudioStore.getState()

  // Test orchestrator delegation
  play() // Should delegate to audioPlayerStore
  expect(useAudioPlayerStore.getState().isPlaying).toBe(true)
})
```

### Event Bus Testing
```typescript
import { audioEventBus } from './stores/audio/audioEventBus'

test('event bus emits and receives events', () => {
  const handler = jest.fn()

  audioEventBus.on('reciter:updated', handler)
  audioEventBus.emit('reciter:updated', { reciterId: '1' })

  expect(handler).toHaveBeenCalledWith({ reciterId: '1' })
})
```

### Logger Testing
```typescript
import { logger } from '../services/logger'

test('logger stores entries', () => {
  logger.info('Test message', { key: 'value' })

  const logs = logger.getLogs('info', 1)
  expect(logs[0].message).toBe('Test message')
  expect(logs[0].context).toEqual({ key: 'value' })
})
```

## 📈 Performance Considerations

### Bundle Size Optimization
- **Code Splitting**: Each autoFix module can be lazy-loaded
- **Tree Shaking**: Unused specialized stores are removed
- **Logger**: Conditionally disabled in production

### Runtime Performance
- **Event Bus**: O(1) emit, O(n) listeners (typically <5)
- **Orchestrator**: Minimal overhead (just delegation)
- **Logger**: Async operations, no blocking

### Memory Management
- **Logger**: Auto-cleanup (max 1000 logs by default)
- **Event Bus**: Cleanup with unsubscribe functions
- **Stores**: Zustand handles subscriptions efficiently

## 🔒 Security Best Practices

### Sensitive Data Handling
```typescript
// DON'T log sensitive data
logger.info('User logged in', { password: userPassword }) ❌

// DO sanitize sensitive data
logger.info('User logged in', {
  userId: user.id,
  // Never log password, tokens, or PII
})
```

### Islamic Content Integrity
```typescript
import { islamicContentValidationGuardian } from '../services/islamicContentValidationGuardian'

// Always validate Islamic content
const validation = await islamicContentValidationGuardian.validateContent(
  ayah,
  'quran'
)

if (!validation.isValid) {
  logger.error('Islamic content validation failed', {
    ayahNumber: ayah.number,
    score: validation.score,
    issues: validation.issues
  })
}
```

## 📚 Additional Resources

- **Full Refactoring Guide**: `/docs/REFACTORING_SUMMARY.md`
- **Type Definitions**: `/src/services/autofix/types.ts`
- **Event Bus API**: `/src/stores/audio/audioEventBus.ts`
- **Logger Configuration**: `/src/services/logger/index.ts`

## 🆘 Troubleshooting

### Common Issues

**Issue**: Circular dependency error
```
Solution: Use audioEventBus for cross-store communication
```

**Issue**: console.log not showing in production
```
Solution: Replace with logger (automatically disabled in prod)
```

**Issue**: Event bus listener not firing
```
Solution: Ensure initializeAudioSettingsStore() is called at app startup
```

**Issue**: Type errors with logger
```
Solution: Import specialized loggers (audioLogger, storeLogger, etc.)
```

---

**Last Updated**: 2025-10-31
**Version**: 2.0.0 (Post-Refactoring)

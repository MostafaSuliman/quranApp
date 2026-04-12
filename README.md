# Hifz

A premium Quran memorization app for iOS and Android, built with Expo + React Native.

The hero experience is the **Mushaf view**: all 604 pages of the Quran rendered
like a real physical Mushaf — ornamental Islamic borders, Amiri typography,
decorative verse medallions, and a 3D page-flip animation with haptic feedback.

## Highlights

- **Mushaf reader** — 604 pages pulled live from `api.quran.com/api/v4`, rendered
  with gold + green SVG frames, alternating lavender/gold verse backgrounds,
  Arabic verse medallions, Juz markers, and Amiri font throughout.
- **3D page flip** — React Native Reanimated 3 with pan gestures + haptics.
- **AI-assisted memorization** — Claude generates the daily plan; during
  sessions, Whisper transcribes your recitation and Claude highlights
  word-level errors.
- **Progress tracking** — Streak flame, animated XP bar, and a 30-cell Juz heatmap.
- **Dark / light / auto theme** — switch anytime from Settings.
- **Eastern Arabic-Indic numerals** (٠–٩) everywhere numbers appear.
- **100% free, no paywalls, no ads.**

## Data sources

- **Quran text:** `api.quran.com/api/v4` only (Uthmani script from Tanzil).
  No Arabic religious text is hardcoded anywhere in this repo.
- **Audio:** streamed from `api.quran.com/api/v4/recitations/...` — never stored locally.
- **AI:** Claude (Anthropic) for plan generation and error analysis, OpenAI Whisper
  for Arabic speech-to-text. Both use keys supplied by the user in Settings and
  stored on-device with `expo-secure-store`.

## Project structure

```
app/                  # Expo Router (file-based routes)
  (tabs)/
    index.tsx         # Home — parallax + today's AI plan
    mushaf.tsx        # Redirect to /mushaf/{lastPage}
    progress.tsx      # Streak / XP / Juz heatmap
    settings.tsx      # Theme, reciter, API keys
  mushaf/[page].tsx   # Single Mushaf page (1..604)
  session/[verseKey]  # Memorization session
  _layout.tsx         # Root: fonts, theme, QueryClient

src/
  api/                # quran.com, Claude, Whisper clients
  components/
    mushaf/           # PageBorder, PageHeader, VerseMedallion, VerseLine, JuzMarker, MushafPage, PageFlipper
    home/             # ParallaxHeader, TodayPlanCard, QuickStats
    session/          # HiddenVerseCard, RecordButton, ErrorHighlighter
    progress/         # StreakFlame, XPBar, JuzHeatmap
    ui/               # ThemedText, ThemedView, Button, LottieLoader
  hooks/              # React Query hooks for pages, chapters, juzs, audio, plans
  store/              # Zustand stores (settings, progress, secrets)
  theme/              # Light + dark palettes, Amiri typography tokens
  utils/              # arabicNumerals, haptics, xp, diffWords
```

## Getting started

Requirements: Node 18+, npm, Expo Go (or a dev client) on your phone.

```bash
npm install
npx expo start
```

Open the QR code in Expo Go on iOS or Android. Or press `i` / `a` for simulators.

### Optional API keys

Hifz runs without any API keys — the daily plan falls back to a simple
deterministic suggestion and the Session screen will operate in self-assessment
mode. For the full experience add your own keys in **Settings → API Keys**:

- **Anthropic** (for daily plan + error analysis) — get one at
  https://console.anthropic.com
- **OpenAI** (for Arabic speech-to-text via Whisper) — get one at
  https://platform.openai.com

Keys are saved only on your device via `expo-secure-store`. They never leave
this app.

## Tech stack

- Expo SDK 53+, React Native 0.76, New Architecture enabled
- TypeScript (strict)
- Expo Router (file-based navigation)
- `react-native-reanimated` v3, `react-native-gesture-handler`
- `react-native-svg` for every border, medallion, and decorative element
- Zustand (+ AsyncStorage persist)
- `@tanstack/react-query` for caching quran.com responses
- `expo-av` (playback + recording), `expo-haptics`, `expo-secure-store`
- `@expo-google-fonts/amiri` — Amiri Regular + Bold
- `@anthropic-ai/sdk` for Claude calls

## Credits

- Quran text and audio: [api.quran.com](https://quran.com/developers) — jazakum Allahu khayran.
- Amiri font: [Amiri Project](https://www.amirifont.org/).

## License

MIT.

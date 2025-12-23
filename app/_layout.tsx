import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme, I18nManager } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { useSettingsStore } from '@/stores'
import { useMemorizationStore } from '@/stores'
import { useQuranStore } from '@/stores'

// Keep splash screen visible while we load resources
SplashScreen.preventAutoHideAsync()

// Enable RTL layout for Arabic
I18nManager.forceRTL(true)
I18nManager.allowRTL(true)

export default function RootLayout() {
  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const loadProgress = useMemorizationStore((s) => s.loadProgress)
  const loadStats = useMemorizationStore((s) => s.loadStats)
  const loadSurahs = useQuranStore((s) => s.loadSurahs)

  // Determine actual theme
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  // Load initial data
  useEffect(() => {
    async function prepare() {
      try {
        // Load app data
        await Promise.all([
          loadProgress(),
          loadStats(),
          loadSurahs(),
        ])
      } catch (e) {
        console.warn('Failed to load initial data:', e)
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync()
      }
    }

    prepare()
  }, [loadProgress, loadStats, loadSurahs])

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#1a1a1a' : '#1a472a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="page/[number]"
          options={{ title: 'صفحة' }}
        />
        <Stack.Screen
          name="surah/[number]"
          options={{ title: 'سورة' }}
        />
        <Stack.Screen
          name="memorize/[page]"
          options={{ title: 'الحفظ' }}
        />
      </Stack>
    </SafeAreaProvider>
  )
}

/**
 * Root Layout
 * Main app layout with providers and initialization
 */

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '../src/theme';
import { useAuthStore, useSettingsStore, useQuranStore, useAudioStore } from '../src/stores';
import { networkService } from '../src/services/network';
import { OfflineNotice } from '../src/components/common';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);

  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeSettings = useSettingsStore((state) => state.initialize);
  const initializeQuran = useQuranStore((state) => state.initialize);
  const initializeAudio = useAudioStore((state) => state.initialize);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize network service
        await networkService.initialize();

        // Initialize stores in parallel
        await Promise.all([
          initializeAuth(),
          initializeSettings(),
          initializeQuran(),
          initializeAudio(),
        ]);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <OfflineNotice />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

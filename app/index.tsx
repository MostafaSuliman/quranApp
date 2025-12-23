/**
 * Index Screen
 * Entry point that redirects based on auth and onboarding state
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useAuthStore, useSettingsStore } from '../src/stores';

export default function IndexScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const hasCompletedOnboarding = useSettingsStore((state) => state.hasCompletedOnboarding);
  const settingsLoading = useSettingsStore((state) => state.isLoading);

  useEffect(() => {
    // Wait for loading to complete
    if (authLoading || settingsLoading) return;

    // Route based on state
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (!hasCompletedOnboarding) {
      router.replace('/onboarding/goal');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, hasCompletedOnboarding, authLoading, settingsLoading, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

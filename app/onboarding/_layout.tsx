/**
 * Onboarding Layout
 */

import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/theme';

export default function OnboardingLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="goal" />
    </Stack>
  );
}

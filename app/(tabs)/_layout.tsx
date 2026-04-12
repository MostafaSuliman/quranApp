import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useThemePalette } from '@/theme';

function TabIcon({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: focused ? '700' : '500', color, letterSpacing: 0.8 }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const palette = useThemePalette();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.borderGold + '44',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: palette.borderGreen,
        tabBarInactiveTintColor: palette.textMuted,
        headerStyle: { backgroundColor: palette.bg },
        headerTintColor: palette.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => <TabIcon label="HOME" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mushaf"
        options={{
          title: 'Mushaf',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => <TabIcon label="MUSHAF" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused, color }) => <TabIcon label="PROGRESS" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => <TabIcon label="SETTINGS" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

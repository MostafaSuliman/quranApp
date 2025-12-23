/**
 * Tabs Layout
 * Main navigation with 5 tabs:
 * - Home (الرئيسية)
 * - Quran (المصحف)
 * - Memorization (الحفظ)
 * - Revision (المراجعة)
 * - Settings (الإعدادات)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme';
import { AudioPlayer } from '../../src/components/audio';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          tabBarStyle: {
            backgroundColor: theme.colors.tabBarBackground,
            borderTopColor: theme.colors.border,
          },
          tabBarActiveTintColor: theme.colors.tabBarActive,
          tabBarInactiveTintColor: theme.colors.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            headerTitle: 'الرئيسية',
            tabBarLabel: 'الرئيسية',
            tabBarIcon: ({ color }) => (
              <TabIcon name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quran"
          options={{
            title: 'Quran',
            headerTitle: 'المصحف',
            tabBarLabel: 'المصحف',
            tabBarIcon: ({ color }) => (
              <TabIcon name="book" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="memorization"
          options={{
            title: 'Memorize',
            headerTitle: 'الحفظ',
            tabBarLabel: 'الحفظ',
            tabBarIcon: ({ color }) => (
              <TabIcon name="brain" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="revision"
          options={{
            title: 'Revision',
            headerTitle: 'المراجعة',
            tabBarLabel: 'المراجعة',
            tabBarIcon: ({ color }) => (
              <TabIcon name="repeat" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerTitle: 'الإعدادات',
            tabBarLabel: 'الإعدادات',
            tabBarIcon: ({ color }) => (
              <TabIcon name="settings" color={color} />
            ),
          }}
        />
      </Tabs>
      {/* Audio player at bottom */}
      <AudioPlayer />
    </View>
  );
}

// Simple text-based icons (can be replaced with actual icon library)
function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    book: '📖',
    brain: '🧠',
    repeat: '🔄',
    settings: '⚙️',
  };

  return (
    <View style={tabIconStyles.container}>
      <View style={[tabIconStyles.icon, { borderColor: color }]}>
        <View style={tabIconStyles.iconInner}>
          {name === 'home' && <View style={[tabIconStyles.homeIcon, { borderBottomColor: color }]} />}
          {name === 'book' && <View style={[tabIconStyles.bookIcon, { backgroundColor: color }]} />}
          {name === 'brain' && <View style={[tabIconStyles.brainIcon, { backgroundColor: color }]} />}
          {name === 'repeat' && <View style={[tabIconStyles.repeatIcon, { borderColor: color }]} />}
          {name === 'settings' && <View style={[tabIconStyles.settingsIcon, { borderColor: color }]} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const tabIconStyles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIcon: {
    width: 14,
    height: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bookIcon: {
    width: 14,
    height: 12,
    borderRadius: 2,
  },
  brainIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  repeatIcon: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
  },
  settingsIcon: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
  },
});

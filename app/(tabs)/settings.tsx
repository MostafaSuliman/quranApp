/**
 * Settings Screen (الإعدادات)
 * User preferences and app settings
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuthStore, useSettingsStore, useAudioStore } from '../../src/stores';
import { toArabicIndic } from '../../src/utils/arabic';
import type { FontSize, ThemeMode } from '../../src/types/user';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();
  const { signOut, user, isAuthenticated } = useAuthStore();
  const { preferences, setFontSize, setDailyGoal, setShowTranslation } = useSettingsStore();
  const { reciters, selectedReciter, selectReciter } = useAudioStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const handleThemeChange = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const handleFontSizeChange = () => {
    const sizes: FontSize[] = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(preferences.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  const handleDailyGoalChange = () => {
    const goals = [1, 2, 3, 5, 10];
    const currentIndex = goals.indexOf(preferences.dailyGoal);
    const nextIndex = (currentIndex + 1) % goals.length;
    setDailyGoal(goals[nextIndex]);
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
    }
  };

  const getFontSizeLabel = () => {
    switch (preferences.fontSize) {
      case 'small': return 'Small';
      case 'medium': return 'Medium';
      case 'large': return 'Large';
      case 'xlarge': return 'Extra Large';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* User section */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Account
        </Text>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || 'G'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userEmail, { color: theme.colors.textPrimary }]}>
              {user?.email || 'Guest User'}
            </Text>
            <Text style={[styles.userProvider, { color: theme.colors.textSecondary }]}>
              {user?.provider === 'anonymous' ? 'Guest Account' : user?.provider || 'Not signed in'}
            </Text>
          </View>
        </View>
      </View>

      {/* Display section */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Display
        </Text>

        <TouchableOpacity style={styles.settingRow} onPress={handleThemeChange}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Theme
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {getThemeLabel()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleFontSizeChange}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Font Size
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {getFontSizeLabel()}
          </Text>
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Show Translation
          </Text>
          <Switch
            value={preferences.showTranslation}
            onValueChange={setShowTranslation}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={preferences.showTranslation ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Audio section */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Audio
        </Text>

        <TouchableOpacity style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Reciter
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {selectedReciter?.name || 'Select'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Playback Speed
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {preferences.playbackSpeed}x
          </Text>
        </TouchableOpacity>
      </View>

      {/* Memorization section */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Memorization
        </Text>

        <TouchableOpacity style={styles.settingRow} onPress={handleDailyGoalChange}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Daily Goal
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {toArabicIndic(preferences.dailyGoal)} pages
          </Text>
        </TouchableOpacity>
      </View>

      {/* About section */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          About
        </Text>

        <TouchableOpacity style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Version
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            1.0.0
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Data Sources
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            AlQuran.cloud
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      {isAuthenticated && (
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.colors.error + '20' }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: theme.colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          QuranApp - Read, Listen, Memorize
        </Text>
        <Text style={[styles.footerArabic, { color: theme.colors.textTertiary }]}>
          {/* UI text */}
          اقرأ واستمع واحفظ
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  userProvider: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
  footerArabic: {
    fontSize: 12,
    fontFamily: 'Amiri',
    marginTop: 4,
  },
});

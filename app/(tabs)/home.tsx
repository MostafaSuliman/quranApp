/**
 * Home Screen (الرئيسية)
 * Dashboard with daily progress and quick actions
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useQuranStore, useSettingsStore, useAudioStore } from '../../src/stores';
import { toArabicIndic, formatPageNumber } from '../../src/utils/arabic';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const { surahs, currentPageNumber, loadSurahs, goToPage, surahsLoading } = useQuranStore();
  const { preferences } = useSettingsStore();
  const { selectedReciter, playSurah } = useAudioStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSurahs();
    setRefreshing(false);
  };

  // Find current surah based on page
  const currentSurah = surahs.find((s, i, arr) => {
    // Simple approximation - will be refined with actual page data
    return i === Math.min(Math.floor((currentPageNumber / 604) * 114), 113);
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Welcome section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeArabic, { color: theme.colors.primary }]}>
          {/* UI text only - not Quranic */}
          السلام عليكم
        </Text>
        <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
          Continue your journey
        </Text>
      </View>

      {/* Daily goal card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/(tabs)/memorization')}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Daily Goal</Text>
          <Text style={styles.cardArabic}>الهدف اليومي</Text>
        </View>
        <View style={styles.goalProgress}>
          <Text style={styles.goalNumber}>
            {toArabicIndic(0)} / {toArabicIndic(preferences.dailyGoal)}
          </Text>
          <Text style={styles.goalLabel}>pages today</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '0%' }]} />
        </View>
      </TouchableOpacity>

      {/* Continue reading card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={() => router.push('/(tabs)/quran')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitleDark, { color: theme.colors.textPrimary }]}>
            Continue Reading
          </Text>
          <Text style={[styles.cardArabicDark, { color: theme.colors.primary }]}>
            متابعة القراءة
          </Text>
        </View>
        <View style={styles.continueInfo}>
          <Text style={[styles.pageInfo, { color: theme.colors.textSecondary }]}>
            {formatPageNumber(currentPageNumber)}
          </Text>
          {currentSurah && (
            <Text style={[styles.surahInfo, { color: theme.colors.textPrimary }]}>
              {currentSurah.name}
            </Text>
          )}
        </View>
        <View style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.continueButtonText}>Open</Text>
        </View>
      </TouchableOpacity>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/(tabs)/quran')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.actionEmoji}>📖</Text>
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>
              Read
            </Text>
            <Text style={[styles.actionArabic, { color: theme.colors.textSecondary }]}>
              قراءة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              if (selectedReciter && currentSurah) {
                playSurah(currentSurah.number);
              }
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
              <Text style={styles.actionEmoji}>🎧</Text>
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>
              Listen
            </Text>
            <Text style={[styles.actionArabic, { color: theme.colors.textSecondary }]}>
              استماع
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/(tabs)/memorization')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.accent + '20' }]}>
              <Text style={styles.actionEmoji}>🧠</Text>
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>
              Memorize
            </Text>
            <Text style={[styles.actionArabic, { color: theme.colors.textSecondary }]}>
              حفظ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/(tabs)/revision')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.info + '20' }]}>
              <Text style={styles.actionEmoji}>🔄</Text>
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>
              Review
            </Text>
            <Text style={[styles.actionArabic, { color: theme.colors.textSecondary }]}>
              مراجعة
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats placeholder */}
      <View style={styles.stats}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Your Progress
        </Text>
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {toArabicIndic(0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Pages Memorized
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {toArabicIndic(0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Day Streak
            </Text>
          </View>
        </View>
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
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeArabic: {
    fontSize: 32,
    fontFamily: 'Amiri',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  welcomeText: {
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  cardArabic: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Amiri',
  },
  cardTitleDark: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardArabicDark: {
    fontSize: 14,
    fontFamily: 'Amiri',
  },
  goalProgress: {
    marginBottom: 16,
  },
  goalNumber: {
    fontSize: 48,
    color: '#fff',
    fontFamily: 'Amiri',
    fontWeight: 'bold',
  },
  goalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  continueInfo: {
    marginBottom: 16,
  },
  pageInfo: {
    fontSize: 14,
    fontFamily: 'Amiri',
  },
  surahInfo: {
    fontSize: 24,
    fontFamily: 'Amiri',
    marginTop: 4,
  },
  continueButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionArabic: {
    fontSize: 12,
    fontFamily: 'Amiri',
    marginTop: 2,
  },
  stats: {
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontFamily: 'Amiri',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
});

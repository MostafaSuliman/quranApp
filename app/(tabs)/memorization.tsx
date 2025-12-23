/**
 * Memorization Screen (الحفظ)
 * Placeholder for memorization features (Part 2)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../src/theme';
import { useSettingsStore } from '../../src/stores';
import { toArabicIndic } from '../../src/utils/arabic';

export default function MemorizationScreen() {
  const { theme } = useTheme();
  const { preferences } = useSettingsStore();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.titleArabic, { color: theme.colors.primary }]}>
          {/* UI text only */}
          الحفظ
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Memorization - Coming Soon
        </Text>
      </View>

      {/* Daily goal card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          Daily Goal
        </Text>
        <View style={styles.goalDisplay}>
          <Text style={[styles.goalNumber, { color: theme.colors.primary }]}>
            {toArabicIndic(preferences.dailyGoal)}
          </Text>
          <Text style={[styles.goalLabel, { color: theme.colors.textSecondary }]}>
            pages per day
          </Text>
        </View>
      </View>

      {/* Five Fortresses placeholder */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          The Five Fortresses
        </Text>
        <Text style={[styles.cardTitleArabic, { color: theme.colors.primary }]}>
          {/* UI text */}
          الحصون الخمسة
        </Text>
        <View style={styles.fortresses}>
          <View style={styles.fortress}>
            <View style={[styles.fortressIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.fortressNumber}>1</Text>
            </View>
            <Text style={[styles.fortressName, { color: theme.colors.textPrimary }]}>
              Listening
            </Text>
            <Text style={[styles.fortressArabic, { color: theme.colors.textSecondary }]}>
              الاستماع
            </Text>
          </View>

          <View style={styles.fortress}>
            <View style={[styles.fortressIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.fortressNumber}>2</Text>
            </View>
            <Text style={[styles.fortressName, { color: theme.colors.textPrimary }]}>
              Looking
            </Text>
            <Text style={[styles.fortressArabic, { color: theme.colors.textSecondary }]}>
              النظر
            </Text>
          </View>

          <View style={styles.fortress}>
            <View style={[styles.fortressIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.fortressNumber}>3</Text>
            </View>
            <Text style={[styles.fortressName, { color: theme.colors.textPrimary }]}>
              Reading
            </Text>
            <Text style={[styles.fortressArabic, { color: theme.colors.textSecondary }]}>
              القراءة
            </Text>
          </View>

          <View style={styles.fortress}>
            <View style={[styles.fortressIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.fortressNumber}>4</Text>
            </View>
            <Text style={[styles.fortressName, { color: theme.colors.textPrimary }]}>
              Memorizing
            </Text>
            <Text style={[styles.fortressArabic, { color: theme.colors.textSecondary }]}>
              الحفظ
            </Text>
          </View>

          <View style={styles.fortress}>
            <View style={[styles.fortressIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.fortressNumber}>5</Text>
            </View>
            <Text style={[styles.fortressName, { color: theme.colors.textPrimary }]}>
              Connection
            </Text>
            <Text style={[styles.fortressArabic, { color: theme.colors.textSecondary }]}>
              الربط
            </Text>
          </View>
        </View>
      </View>

      {/* Coming soon message */}
      <View style={[styles.comingSoon, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
          Full memorization features including the Sabaq, Sabqi, and Manzil review system will be available in Part 2.
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  titleArabic: {
    fontSize: 32,
    fontFamily: 'Amiri',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardTitleArabic: {
    fontSize: 16,
    fontFamily: 'Amiri',
    marginBottom: 16,
  },
  goalDisplay: {
    alignItems: 'center',
    marginTop: 8,
  },
  goalNumber: {
    fontSize: 64,
    fontFamily: 'Amiri',
    fontWeight: 'bold',
  },
  goalLabel: {
    fontSize: 14,
    marginTop: -8,
  },
  fortresses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  fortress: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  fortressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fortressNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fortressName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  fortressArabic: {
    fontSize: 12,
    fontFamily: 'Amiri',
    textAlign: 'center',
  },
  comingSoon: {
    padding: 16,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

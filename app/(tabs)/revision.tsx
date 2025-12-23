/**
 * Revision Screen (المراجعة)
 * Placeholder for revision features (Part 2)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../src/theme';
import { toArabicIndic } from '../../src/utils/arabic';

export default function RevisionScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.titleArabic, { color: theme.colors.primary }]}>
          {/* UI text only */}
          المراجعة
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Revision - Coming Soon
        </Text>
      </View>

      {/* Three-tier system */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          Three-Tier Review System
        </Text>

        {/* Sabaq */}
        <View style={[styles.tier, { borderLeftColor: theme.colors.primary }]}>
          <View style={styles.tierHeader}>
            <Text style={[styles.tierTitle, { color: theme.colors.textPrimary }]}>
              Sabaq (السبق)
            </Text>
            <Text style={[styles.tierArabic, { color: theme.colors.primary }]}>
              السبق
            </Text>
          </View>
          <Text style={[styles.tierDescription, { color: theme.colors.textSecondary }]}>
            Current new memorization - the page you are actively memorizing
          </Text>
        </View>

        {/* Sabqi */}
        <View style={[styles.tier, { borderLeftColor: theme.colors.secondary }]}>
          <View style={styles.tierHeader}>
            <Text style={[styles.tierTitle, { color: theme.colors.textPrimary }]}>
              Sabqi (السبقي)
            </Text>
            <Text style={[styles.tierArabic, { color: theme.colors.secondary }]}>
              السبقي
            </Text>
          </View>
          <Text style={[styles.tierDescription, { color: theme.colors.textSecondary }]}>
            Recent pages (~20 pages) that need frequent review
          </Text>
        </View>

        {/* Manzil */}
        <View style={[styles.tier, { borderLeftColor: theme.colors.accent }]}>
          <View style={styles.tierHeader}>
            <Text style={[styles.tierTitle, { color: theme.colors.textPrimary }]}>
              Manzil (المنزل)
            </Text>
            <Text style={[styles.tierArabic, { color: theme.colors.accent }]}>
              المنزل
            </Text>
          </View>
          <Text style={[styles.tierDescription, { color: theme.colors.textSecondary }]}>
            All old memorization - cycled weekly through all memorized pages
          </Text>
        </View>
      </View>

      {/* Progress placeholder */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          Your Review Progress
        </Text>
        <View style={styles.progressGrid}>
          <View style={styles.progressItem}>
            <Text style={[styles.progressNumber, { color: theme.colors.primary }]}>
              {toArabicIndic(0)}
            </Text>
            <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
              Pages to Review Today
            </Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressNumber, { color: theme.colors.secondary }]}>
              {toArabicIndic(0)}
            </Text>
            <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
              Pages Memorized
            </Text>
          </View>
        </View>
      </View>

      {/* Coming soon message */}
      <View style={[styles.comingSoon, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
          The complete revision system with strength tracking, review scheduling, and spaced repetition will be available in Part 2.
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
    marginBottom: 16,
  },
  tier: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tierArabic: {
    fontSize: 18,
    fontFamily: 'Amiri',
  },
  tierDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 36,
    fontFamily: 'Amiri',
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
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

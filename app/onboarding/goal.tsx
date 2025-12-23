/**
 * Daily Goal Onboarding Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { Button } from '../../src/components/common';
import { useSettingsStore } from '../../src/stores';
import { toArabicIndic } from '../../src/utils/arabic';

const GOAL_OPTIONS = [
  { pages: 1, description: 'Light' },
  { pages: 2, description: 'Moderate' },
  { pages: 3, description: 'Committed' },
  { pages: 5, description: 'Intensive' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { setDailyGoal, completeOnboarding } = useSettingsStore();

  const [selectedGoal, setSelectedGoal] = useState(1);

  const handleContinue = async () => {
    await setDailyGoal(selectedGoal);
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Set Your Daily Goal
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            How many pages would you like to memorize each day?
          </Text>
          <Text style={[styles.arabicTitle, { color: theme.colors.primary }]}>
            {/* UI text only */}
            حدد هدفك اليومي
          </Text>
        </View>

        {/* Goal options */}
        <View style={styles.options}>
          {GOAL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.pages}
              style={[
                styles.option,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                selectedGoal === option.pages && {
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primary + '10',
                },
              ]}
              onPress={() => setSelectedGoal(option.pages)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionPages,
                    { color: theme.colors.textPrimary },
                    selectedGoal === option.pages && { color: theme.colors.primary },
                  ]}
                >
                  {toArabicIndic(option.pages)}
                </Text>
                <Text style={[styles.optionLabel, { color: theme.colors.textSecondary }]}>
                  {option.pages === 1 ? 'page' : 'pages'} / day
                </Text>
              </View>
              <Text style={[styles.optionDescription, { color: theme.colors.textTertiary }]}>
                {option.description}
              </Text>
              {selectedGoal === option.pages && (
                <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info */}
        <View style={[styles.info, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            You can change this anytime in Settings. Start small and build consistency!
          </Text>
        </View>

        {/* Continue button */}
        <Button
          title="Get Started"
          onPress={handleContinue}
          size="large"
          style={styles.continueButton}
        />

        <TouchableOpacity onPress={handleContinue} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.textTertiary }]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  arabicTitle: {
    fontSize: 24,
    fontFamily: 'Amiri',
    textAlign: 'center',
  },
  options: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionPages: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Amiri',
  },
  optionLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  optionDescription: {
    fontSize: 14,
    marginRight: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  info: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 'auto',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 14,
  },
});

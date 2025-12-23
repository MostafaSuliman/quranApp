/**
 * Welcome Screen
 * Initial screen for authentication
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { Button } from '../../src/components/common';
import { useAuthStore } from '../../src/stores';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { signInWithApple, signInAnonymously, isLoading } = useAuthStore();

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.success) {
      router.replace('/onboarding/goal');
    }
  };

  const handleContinueAsGuest = async () => {
    const result = await signInAnonymously();
    if (result.success) {
      router.replace('/onboarding/goal');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.logoText}>Q</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            QuranApp
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Read, Listen, Memorize
          </Text>
        </View>

        {/* Arabic welcome text */}
        <View style={styles.arabicSection}>
          <Text style={[styles.arabicText, { color: theme.colors.primary }]}>
            {/* This is UI text, not Quranic text */}
            مرحباً بك
          </Text>
          <Text style={[styles.arabicSubtext, { color: theme.colors.textSecondary }]}>
            {/* UI text */}
            ابدأ رحلتك مع كتاب الله
          </Text>
        </View>

        {/* Auth buttons */}
        <View style={styles.buttons}>
          <Button
            title="Sign in with Email"
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            size="large"
            style={styles.button}
          />

          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/signup')}
            variant="outline"
            size="large"
            style={styles.button}
          />

          {Platform.OS === 'ios' && (
            <Button
              title="Sign in with Apple"
              onPress={handleAppleSignIn}
              variant="secondary"
              size="large"
              style={styles.button}
              loading={isLoading}
            />
          )}

          <Button
            title="Continue as Guest"
            onPress={handleContinueAsGuest}
            variant="ghost"
            size="medium"
            style={styles.guestButton}
            loading={isLoading}
          />
        </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  arabicSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  arabicText: {
    fontSize: 36,
    fontFamily: 'Amiri',
    marginBottom: 8,
  },
  arabicSubtext: {
    fontSize: 18,
    fontFamily: 'Amiri',
    textAlign: 'center',
  },
  buttons: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  guestButton: {
    marginTop: 8,
  },
});

/**
 * Error View Component
 * Displays error messages with retry option
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorView({ message, onRetry, retryLabel = 'Retry' }: ErrorViewProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.errorIcon, { color: theme.colors.error }]}>!</Text>
      <Text style={[styles.message, { color: theme.colors.textPrimary }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
            {retryLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    textAlign: 'center',
    lineHeight: 58,
    borderColor: '#F44336',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

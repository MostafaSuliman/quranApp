/**
 * Audio Player Component
 * Mini player for Quran audio playback
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { useAudioStore } from '../../stores';
import { formatDuration } from '../../utils/formatting';

export function AudioPlayer() {
  const { theme } = useTheme();
  const {
    isPlaying,
    isPaused,
    isLoading,
    currentSurah,
    position,
    duration,
    play,
    pause,
    stop,
    selectedReciter,
  } = useAudioStore();

  // Don't show player if nothing is loaded
  if (!currentSurah && !isLoading) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: theme.colors.primary, width: `${progress}%` },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {currentSurah ? `Surah ${currentSurah}` : 'Loading...'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {selectedReciter?.name || 'Select reciter'}
          </Text>
        </View>

        {/* Time */}
        <View style={styles.time}>
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {formatDuration(position / 1000)} / {formatDuration(duration / 1000)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Play/Pause button */}
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => (isPlaying ? pause() : play())}
            disabled={isLoading}
          >
            <Text style={styles.playIcon}>
              {isLoading ? '...' : isPlaying ? '||' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Stop button */}
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={stop}
          >
            <Text style={[styles.controlIcon, { color: theme.colors.textSecondary }]}>
              ■
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBar: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    marginHorizontal: 12,
  },
  timeText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 14,
  },
});

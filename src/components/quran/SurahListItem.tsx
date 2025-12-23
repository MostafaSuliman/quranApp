/**
 * Surah List Item Component
 * Displays a Surah in a list with its metadata
 *
 * CRITICAL: Surah names MUST come from API.
 * NEVER hardcode Surah names or any Quranic text.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { toArabicIndic, formatAyahCount } from '../../utils/arabic';
import type { Surah } from '../../types/quran';

interface SurahListItemProps {
  surah: Surah;
  onPress: (surah: Surah) => void;
}

export function SurahListItem({ surah, onPress }: SurahListItemProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress(surah)}
      activeOpacity={0.7}
    >
      {/* Surah number */}
      <View style={[styles.numberContainer, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.number}>{toArabicIndic(surah.number)}</Text>
      </View>

      {/* Surah info */}
      <View style={styles.info}>
        {/* Arabic name from API */}
        <Text style={[styles.arabicName, { color: theme.colors.textPrimary }]}>
          {surah.name}
        </Text>
        {/* English name from API */}
        <Text style={[styles.englishName, { color: theme.colors.textSecondary }]}>
          {surah.englishName}
        </Text>
      </View>

      {/* Meta info */}
      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
          {formatAyahCount(surah.numberOfAyahs)}
        </Text>
        <Text style={[styles.revelationType, { color: theme.colors.textTertiary }]}>
          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  number: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    transform: [{ rotate: '-45deg' }],
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  arabicName: {
    fontSize: 20,
    fontFamily: 'Amiri',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  englishName: {
    fontSize: 14,
    marginTop: 2,
  },
  meta: {
    alignItems: 'flex-end',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Amiri',
  },
  revelationType: {
    fontSize: 12,
    fontFamily: 'Amiri',
    marginTop: 2,
  },
});

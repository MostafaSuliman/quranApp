/**
 * Ayah View Component
 * Displays a single Ayah with proper RTL Arabic rendering
 *
 * CRITICAL: This component displays text ONLY from API.
 * The text prop MUST come from trusted API sources.
 * NEVER hardcode Quranic text.
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { useTheme } from '../../theme';
import type { Ayah } from '../../types/quran';
import { toArabicIndic } from '../../utils/arabic';

interface AyahViewProps {
  ayah: Ayah;
  isSelected?: boolean;
  onPress?: (ayah: Ayah) => void;
  fontSize?: number;
}

export function AyahView({
  ayah,
  isSelected = false,
  onPress,
  fontSize = 24,
}: AyahViewProps) {
  const { theme } = useTheme();

  // Ayah number in Arabic-Indic numerals with decorative brackets
  const ayahNumber = `\uFD3F${toArabicIndic(ayah.numberInSurah)}\uFD3E`;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && { backgroundColor: theme.colors.ayahHighlight },
      ]}
      onPress={() => onPress?.(ayah)}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Ayah text from API */}
      <Text
        style={[
          styles.text,
          {
            color: theme.colors.textArabic,
            fontSize,
            lineHeight: fontSize * 2.2,
          },
        ]}
      >
        {ayah.text}{' '}
        <Text style={[styles.ayahNumber, { color: theme.colors.primary }]}>
          {ayahNumber}
        </Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  text: {
    fontFamily: 'Amiri',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ayahNumber: {
    fontSize: 18,
  },
});

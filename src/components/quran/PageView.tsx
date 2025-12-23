/**
 * Page View Component
 * Displays a full Mushaf page with all Ayahs
 *
 * CRITICAL: All text displayed MUST come from API.
 * NEVER hardcode or generate Quranic text.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme';
import { AyahView } from './AyahView';
import { toArabicIndic, formatPageNumber } from '../../utils/arabic';
import type { PageData, Ayah } from '../../types/quran';

interface PageViewProps {
  pageData: PageData | null;
  loading?: boolean;
  error?: string | null;
  selectedAyahNumber?: number | null;
  onAyahPress?: (ayah: Ayah) => void;
  fontSize?: number;
}

export function PageView({
  pageData,
  loading = false,
  error = null,
  selectedAyahNumber,
  onAyahPress,
  fontSize = 24,
}: PageViewProps) {
  const { theme } = useTheme();

  // Group ayahs by surah for display
  const groupedAyahs = useMemo(() => {
    if (!pageData?.ayahs) return [];

    const groups: { surahNumber: number; ayahs: Ayah[] }[] = [];
    let currentGroup: { surahNumber: number; ayahs: Ayah[] } | null = null;

    for (const ayah of pageData.ayahs) {
      if (!currentGroup || currentGroup.surahNumber !== ayah.surahNumber) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { surahNumber: ayah.surahNumber, ayahs: [] };
      }
      currentGroup.ayahs.push(ayah);
    }

    if (currentGroup) groups.push(currentGroup);
    return groups;
  }, [pageData]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading page...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <Text style={[styles.errorHint, { color: theme.colors.textSecondary }]}>
          Please check your connection and try again
        </Text>
      </View>
    );
  }

  if (!pageData) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No page data available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Page header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.pageNumber, { color: theme.colors.textSecondary }]}>
          {formatPageNumber(pageData.pageNumber)}
        </Text>
        <Text style={[styles.juzInfo, { color: theme.colors.textSecondary }]}>
          {pageData.ayahs[0] && `الجزء ${toArabicIndic(pageData.ayahs[0].juz)}`}
        </Text>
      </View>

      {/* Page content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {groupedAyahs.map((group) => (
          <View key={group.surahNumber} style={styles.surahGroup}>
            {/* Render ayahs as flowing text */}
            <Text
              style={[
                styles.flowingText,
                {
                  color: theme.colors.textArabic,
                  fontSize,
                  lineHeight: fontSize * 2.2,
                },
              ]}
            >
              {group.ayahs.map((ayah, index) => (
                <Text
                  key={ayah.number}
                  onPress={() => onAyahPress?.(ayah)}
                  style={
                    selectedAyahNumber === ayah.number
                      ? { backgroundColor: theme.colors.ayahHighlight }
                      : undefined
                  }
                >
                  {ayah.text}{' '}
                  <Text style={{ color: theme.colors.primary }}>
                    {`\uFD3F${toArabicIndic(ayah.numberInSurah)}\uFD3E`}
                  </Text>
                  {index < group.ayahs.length - 1 ? ' ' : ''}
                </Text>
              ))}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  pageNumber: {
    fontSize: 14,
    fontFamily: 'Amiri',
  },
  juzInfo: {
    fontSize: 14,
    fontFamily: 'Amiri',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  surahGroup: {
    marginBottom: 16,
  },
  flowingText: {
    fontFamily: 'Amiri',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

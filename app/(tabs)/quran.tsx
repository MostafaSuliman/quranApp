/**
 * Quran Screen (المصحف)
 * Displays Quran text with proper RTL Arabic rendering
 *
 * CRITICAL: All Quranic text MUST come from API.
 * NEVER hardcode any Quranic Arabic text.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useQuranStore, useAudioStore } from '../../src/stores';
import { PageView } from '../../src/components/quran/PageView';
import { SurahListItem } from '../../src/components/quran/SurahListItem';
import { toArabicIndic, formatPageNumber } from '../../src/utils/arabic';
import type { Surah, Ayah } from '../../src/types/quran';

type ViewMode = 'page' | 'surah-list';

export default function QuranScreen() {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('page');

  const {
    surahs,
    surahsLoading,
    surahsError,
    currentPage,
    currentPageNumber,
    pageLoading,
    pageError,
    selectedAyahNumber,
    loadSurahs,
    loadPage,
    goToPage,
    nextPage,
    previousPage,
    selectAyah,
  } = useQuranStore();

  const { playSurah, selectedReciter } = useAudioStore();

  useEffect(() => {
    if (surahs.length === 0) {
      loadSurahs();
    }
  }, []);

  const handleAyahPress = (ayah: Ayah) => {
    selectAyah(selectedAyahNumber === ayah.number ? null : ayah.number);
  };

  const handleSurahPress = async (surah: Surah) => {
    // Find the starting page for this surah (approximate)
    // In a full implementation, this would use actual surah-page mapping
    const approximatePage = Math.ceil((surah.number / 114) * 604);
    await goToPage(Math.max(1, Math.min(604, approximatePage)));
    setViewMode('page');
  };

  const handlePlaySurah = (surah: Surah) => {
    if (selectedReciter) {
      playSurah(surah.number);
    }
  };

  // Page navigation
  const renderPageView = () => (
    <View style={styles.pageContainer}>
      {/* Navigation header */}
      <View style={[styles.navHeader, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.navButton, currentPageNumber <= 1 && styles.navButtonDisabled]}
          onPress={previousPage}
          disabled={currentPageNumber <= 1}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>
            →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pageIndicator}
          onPress={() => setViewMode('surah-list')}
        >
          <Text style={[styles.pageText, { color: theme.colors.textPrimary }]}>
            {formatPageNumber(currentPageNumber)}
          </Text>
          <Text style={[styles.pageHint, { color: theme.colors.textSecondary }]}>
            Tap to browse
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentPageNumber >= 604 && styles.navButtonDisabled]}
          onPress={nextPage}
          disabled={currentPageNumber >= 604}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>
            ←
          </Text>
        </TouchableOpacity>
      </View>

      {/* Page content */}
      <PageView
        pageData={currentPage}
        loading={pageLoading}
        error={pageError}
        selectedAyahNumber={selectedAyahNumber}
        onAyahPress={handleAyahPress}
      />
    </View>
  );

  // Surah list view
  const renderSurahList = () => (
    <View style={styles.listContainer}>
      <View style={[styles.listHeader, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setViewMode('page')}
        >
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            Back to Page
          </Text>
        </TouchableOpacity>
        <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>
          Surahs
        </Text>
        <Text style={[styles.listTitleArabic, { color: theme.colors.textSecondary }]}>
          السور
        </Text>
      </View>

      {surahsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading Surahs...
          </Text>
        </View>
      ) : surahsError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {surahsError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadSurahs}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={surahs}
          keyExtractor={(item) => item.number.toString()}
          renderItem={({ item }) => (
            <SurahListItem
              surah={item}
              onPress={handleSurahPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {viewMode === 'page' ? renderPageView() : renderSurahList()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pageIndicator: {
    flex: 1,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 18,
    fontFamily: 'Amiri',
    fontWeight: '600',
  },
  pageHint: {
    fontSize: 12,
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  listTitleArabic: {
    fontSize: 16,
    fontFamily: 'Amiri',
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

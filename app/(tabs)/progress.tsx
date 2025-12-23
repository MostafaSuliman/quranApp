import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMemorizationStore, useSettingsStore } from '@/stores'
import { toArabicIndic, formatPercentage, formatJuzNumber } from '@/utils/numerals'

export default function ProgressScreen() {
  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  const stats = useMemorizationStore((s) => s.stats)
  const todayProgress = useMemorizationStore((s) => s.todayProgress)
  const fortressProgress = useMemorizationStore((s) => s.fortressProgress)
  const getMemorizedPages = useMemorizationStore((s) => s.getMemorizedPages)
  const getWeakPages = useMemorizationStore((s) => s.getWeakPages)
  const getTotalJuzMemorized = useMemorizationStore((s) => s.getTotalJuzMemorized)

  const memorizedPages = getMemorizedPages()
  const weakPages = getWeakPages()
  const totalJuz = getTotalJuzMemorized()
  const totalPages = 604
  const progressPercentage = (memorizedPages.length / totalPages) * 100

  const styles = createStyles(isDark)

  // Five Fortresses data
  const fortresses = [
    {
      name: 'الاستماع والقراءة',
      icon: 'headset' as const,
      color: '#8b5cf6',
      progress: fortressProgress.listening.completedToday / (fortressProgress.listening.dailyGoalJuz || 1) * 100,
      detail: `${toArabicIndic(fortressProgress.listening.completedToday)}/${toArabicIndic(fortressProgress.listening.dailyGoalJuz)} جزء`,
    },
    {
      name: 'التحضير',
      icon: 'book' as const,
      color: '#3b82f6',
      progress: fortressProgress.preparation.warmupComplete ? 100 : 0,
      detail: fortressProgress.preparation.warmupComplete ? 'مكتمل' : 'غير مكتمل',
    },
    {
      name: 'الحفظ الجديد',
      icon: 'add-circle' as const,
      color: '#2d8a4e',
      progress: fortressProgress.memorization.todayProgress
        ? (fortressProgress.memorization.todayProgress.repetitions / fortressProgress.memorization.targetReps) * 100
        : 0,
      detail: fortressProgress.memorization.todayProgress
        ? `${toArabicIndic(fortressProgress.memorization.todayProgress.repetitions)}/${toArabicIndic(fortressProgress.memorization.targetReps)}`
        : 'لم يبدأ',
    },
    {
      name: 'المراجعة القريبة',
      icon: 'refresh' as const,
      color: '#f59e0b',
      progress: todayProgress?.sabqiComplete ? 100 : 0,
      detail: todayProgress?.sabqiComplete ? 'مكتمل' : 'غير مكتمل',
    },
    {
      name: 'المراجعة البعيدة',
      icon: 'calendar' as const,
      color: '#ef4444',
      progress: todayProgress?.manzilComplete ? 100 : 0,
      detail: todayProgress?.manzilComplete ? 'مكتمل' : 'غير مكتمل',
    },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overall Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressValue}>{formatPercentage(progressPercentage, 1)}</Text>
            <Text style={styles.progressLabel}>من القرآن</Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatValue}>{toArabicIndic(memorizedPages.length)}</Text>
              <Text style={styles.progressStatLabel}>صفحة محفوظة</Text>
            </View>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatValue}>{toArabicIndic(totalJuz)}</Text>
              <Text style={styles.progressStatLabel}>جزء مكتمل</Text>
            </View>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatValue}>{toArabicIndic(totalPages - memorizedPages.length)}</Text>
              <Text style={styles.progressStatLabel}>صفحة متبقية</Text>
            </View>
          </View>
        </View>

        {/* Five Fortresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الحصون الخمسة</Text>
          <View style={styles.fortressesGrid}>
            {fortresses.map((fortress, index) => (
              <View key={index} style={styles.fortressCard}>
                <View style={[styles.fortressIconContainer, { backgroundColor: fortress.color + '20' }]}>
                  <Ionicons name={fortress.icon} size={24} color={fortress.color} />
                </View>
                <Text style={styles.fortressName}>{fortress.name}</Text>
                <View style={styles.fortressProgressBar}>
                  <View
                    style={[
                      styles.fortressProgressFill,
                      { width: `${Math.min(100, fortress.progress)}%`, backgroundColor: fortress.color }
                    ]}
                  />
                </View>
                <Text style={styles.fortressDetail}>{fortress.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإحصائيات</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{toArabicIndic(stats?.currentStreak || 0)}</Text>
              <Text style={styles.statLabel}>يوم متتالي</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{toArabicIndic(stats?.longestStreak || 0)}</Text>
              <Text style={styles.statLabel}>أطول سلسلة</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="repeat" size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{toArabicIndic(stats?.totalRepetitions || 0)}</Text>
              <Text style={styles.statLabel}>إجمالي التكرارات</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#2d8a4e" />
              <Text style={styles.statValue}>{toArabicIndic(stats?.totalReviewSessions || 0)}</Text>
              <Text style={styles.statLabel}>جلسات المراجعة</Text>
            </View>
          </View>
        </View>

        {/* Weak Pages */}
        {weakPages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>صفحات تحتاج مراجعة</Text>
            <View style={styles.weakPagesCard}>
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
              <Text style={styles.weakPagesText}>
                لديك {toArabicIndic(weakPages.length)} صفحة ضعيفة تحتاج مزيد من المراجعة
              </Text>
            </View>
          </View>
        )}

        {/* Milestones */}
        {stats?.milestones && stats.milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الإنجازات</Text>
            <View style={styles.milestonesGrid}>
              {stats.milestones.slice(-6).map((milestone, index) => (
                <View key={index} style={styles.milestoneCard}>
                  <Ionicons
                    name={
                      milestone.type === 'juz' ? 'book' :
                      milestone.type === 'surah' ? 'document-text' :
                      milestone.type === 'streak' ? 'flame' : 'layers'
                    }
                    size={20}
                    color="#f59e0b"
                  />
                  <Text style={styles.milestoneValue}>
                    {milestone.type === 'juz' ? formatJuzNumber(milestone.value) :
                     `${toArabicIndic(milestone.value)} ${milestone.type === 'streak' ? 'يوم' : 'صفحة'}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  progressCard: {
    backgroundColor: '#1a472a',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 12,
    color: '#a7d5b8',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  progressStatItem: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressStatLabel: {
    fontSize: 11,
    color: '#a7d5b8',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'right',
    marginBottom: 12,
  },
  fortressesGrid: {
    gap: 12,
  },
  fortressCard: {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fortressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  fortressName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'right',
  },
  fortressProgressBar: {
    width: 60,
    height: 6,
    backgroundColor: isDark ? '#333' : '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  fortressProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  fortressDetail: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    width: 50,
    textAlign: 'left',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    marginTop: 4,
  },
  weakPagesCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  weakPagesText: {
    flex: 1,
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'right',
    marginRight: 12,
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  milestoneCard: {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneValue: {
    fontSize: 12,
    color: isDark ? '#fff' : '#1a1a1a',
  },
})

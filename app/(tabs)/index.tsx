import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMemorizationStore, useSettingsStore } from '@/stores'
import { toArabicIndic, formatJuzNumber } from '@/utils/numerals'

export default function HomeScreen() {
  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  const todayProgress = useMemorizationStore((s) => s.todayProgress)
  const stats = useMemorizationStore((s) => s.stats)
  const getMemorizedPages = useMemorizationStore((s) => s.getMemorizedPages)
  const getTotalJuzMemorized = useMemorizationStore((s) => s.getTotalJuzMemorized)

  const memorizedPages = getMemorizedPages()
  const totalJuz = getTotalJuzMemorized()

  const styles = createStyles(isDark)

  const quickActions = [
    {
      title: 'السبق',
      subtitle: 'الحفظ الجديد',
      icon: 'add-circle' as const,
      color: '#2d8a4e',
      route: '/memorize',
    },
    {
      title: 'السبقي',
      subtitle: 'المراجعة القريبة',
      icon: 'refresh' as const,
      color: '#4a90d9',
      route: '/memorize',
    },
    {
      title: 'المنزل',
      subtitle: 'المراجعة البعيدة',
      icon: 'calendar' as const,
      color: '#d97706',
      route: '/memorize',
    },
    {
      title: 'الاستماع',
      subtitle: 'القراءة والتحضير',
      icon: 'headset' as const,
      color: '#8b5cf6',
      route: '/listen',
    },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>السلام عليكم</Text>
          <Text style={styles.welcomeSubtitle}>
            هيا نبدأ رحلة الحفظ اليوم
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{toArabicIndic(memorizedPages.length)}</Text>
            <Text style={styles.statLabel}>صفحة محفوظة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{toArabicIndic(totalJuz)}</Text>
            <Text style={styles.statLabel}>جزء</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{toArabicIndic(stats?.currentStreak || 0)}</Text>
            <Text style={styles.statLabel}>يوم متتالي</Text>
          </View>
        </View>

        {/* Today's Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تقدم اليوم</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressItem}>
              <View style={[styles.progressIndicator, todayProgress?.sabaqComplete && styles.progressComplete]} />
              <Text style={styles.progressLabel}>السبق</Text>
            </View>
            <View style={styles.progressItem}>
              <View style={[styles.progressIndicator, todayProgress?.sabqiComplete && styles.progressComplete]} />
              <Text style={styles.progressLabel}>السبقي</Text>
            </View>
            <View style={styles.progressItem}>
              <View style={[styles.progressIndicator, todayProgress?.manzilComplete && styles.progressComplete]} />
              <Text style={styles.progressLabel}>المنزل</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ابدأ الآن</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <Link key={action.title} href={action.route as any} asChild>
                <Pressable style={styles.actionCard}>
                  <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                    <Ionicons name={action.icon} size={28} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* Three-Tier System Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نظام المراجعة الثلاثي</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={[styles.infoBadge, { backgroundColor: '#2d8a4e' }]}>
                <Text style={styles.infoBadgeText}>١</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>السبق - الحفظ الجديد</Text>
                <Text style={styles.infoDescription}>الصفحة الجديدة التي تحفظها اليوم (٣٥-٥٠ تكرار)</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoBadge, { backgroundColor: '#4a90d9' }]}>
                <Text style={styles.infoBadgeText}>٢</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>السبقي - المراجعة القريبة</Text>
                <Text style={styles.infoDescription}>آخر ٢٠ صفحة حفظتها (مراجعة يومية)</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoBadge, { backgroundColor: '#d97706' }]}>
                <Text style={styles.infoBadgeText}>٣</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>المنزل - المراجعة البعيدة</Text>
                <Text style={styles.infoDescription}>كل ما حفظته (مقسم على الأسبوع)</Text>
              </View>
            </View>
          </View>
        </View>
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
  welcomeCard: {
    backgroundColor: '#1a472a',
    padding: 24,
    margin: 16,
    borderRadius: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#a7d5b8',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d8a4e',
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'right',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? '#333' : '#ddd',
    marginBottom: 8,
  },
  progressComplete: {
    backgroundColor: '#2d8a4e',
    borderColor: '#2d8a4e',
  },
  progressLabel: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
  },
  infoCard: {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  infoBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'right',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
    textAlign: 'right',
    lineHeight: 22,
  },
})

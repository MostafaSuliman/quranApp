import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMemorizationStore, useSettingsStore, useQuranStore } from '@/stores'
import { toArabicIndic, formatPageNumber } from '@/utils/numerals'

export default function MemorizeScreen() {
  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  const todayProgress = useMemorizationStore((s) => s.todayProgress)
  const fortressProgress = useMemorizationStore((s) => s.fortressProgress)
  const getMemorizedPages = useMemorizationStore((s) => s.getMemorizedPages)
  const getSabqiPages = useMemorizationStore((s) => s.getSabqiPages)
  const getManzilSchedule = useMemorizationStore((s) => s.getManzilSchedule)
  const targetRepetitions = useSettingsStore((s) => s.targetRepetitions)

  const memorizedPages = getMemorizedPages()
  const sabqiPages = getSabqiPages()
  const manzilSchedule = getManzilSchedule()
  const todayDayIndex = new Date().getDay()
  const todayManzil = manzilSchedule.find(s => s.dayIndex === todayDayIndex)

  // Calculate next page to memorize
  const nextPageToMemorize = memorizedPages.length > 0
    ? Math.max(...memorizedPages) + 1
    : 1

  const styles = createStyles(isDark)

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* السبق - New Memorization */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.badge, { backgroundColor: '#2d8a4e' }]}>
              <Text style={styles.badgeText}>السبق</Text>
            </View>
            <Text style={styles.sectionSubtitle}>الحفظ الجديد</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {formatPageNumber(nextPageToMemorize)}
              </Text>
              <Text style={styles.cardDescription}>
                الهدف: {toArabicIndic(targetRepetitions)} تكرار
              </Text>

              {fortressProgress.memorization.todayProgress && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, (fortressProgress.memorization.todayProgress.repetitions / targetRepetitions) * 100)}%`,
                        backgroundColor: '#2d8a4e'
                      }
                    ]}
                  />
                </View>
              )}

              <Link href={`/memorize/${nextPageToMemorize}`} asChild>
                <Pressable style={[styles.button, { backgroundColor: '#2d8a4e' }]}>
                  <Text style={styles.buttonText}>
                    {todayProgress?.sabaqComplete ? 'تم ✓' : 'ابدأ الحفظ'}
                  </Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.cardIcon}>
              <Ionicons name="add-circle" size={48} color="#2d8a4e" />
            </View>
          </View>
        </View>

        {/* السبقي - Recent Review */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.badge, { backgroundColor: '#4a90d9' }]}>
              <Text style={styles.badgeText}>السبقي</Text>
            </View>
            <Text style={styles.sectionSubtitle}>المراجعة القريبة</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {toArabicIndic(sabqiPages.length)} صفحة
              </Text>
              <Text style={styles.cardDescription}>
                آخر ٢٠ صفحة محفوظة
              </Text>

              {sabqiPages.length > 0 && (
                <Text style={styles.pagesPreview}>
                  الصفحات: {sabqiPages.slice(-5).map(p => toArabicIndic(p)).join(' - ')}...
                </Text>
              )}

              <Link href="/memorize" asChild>
                <Pressable style={[styles.button, { backgroundColor: '#4a90d9' }]}>
                  <Text style={styles.buttonText}>
                    {todayProgress?.sabqiComplete ? 'تم ✓' : 'ابدأ المراجعة'}
                  </Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.cardIcon}>
              <Ionicons name="refresh" size={48} color="#4a90d9" />
            </View>
          </View>
        </View>

        {/* المنزل - Old Review */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.badge, { backgroundColor: '#d97706' }]}>
              <Text style={styles.badgeText}>المنزل</Text>
            </View>
            <Text style={styles.sectionSubtitle}>المراجعة البعيدة</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {todayManzil ? `${toArabicIndic(todayManzil.pages.length)} صفحة` : 'لا يوجد'}
              </Text>
              <Text style={styles.cardDescription}>
                مراجعة اليوم من الحفظ القديم
              </Text>

              {todayManzil && todayManzil.pages.length > 0 && (
                <Text style={styles.pagesPreview}>
                  الصفحات: {todayManzil.pages.slice(0, 5).map(p => toArabicIndic(p)).join(' - ')}...
                </Text>
              )}

              <Link href="/memorize" asChild>
                <Pressable style={[styles.button, { backgroundColor: '#d97706' }]}>
                  <Text style={styles.buttonText}>
                    {todayProgress?.manzilComplete ? 'تم ✓' : 'ابدأ المراجعة'}
                  </Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.cardIcon}>
              <Ionicons name="calendar" size={48} color="#d97706" />
            </View>
          </View>
        </View>

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>جدول المنزل الأسبوعي</Text>
          <View style={styles.weekGrid}>
            {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, index) => {
              const schedule = manzilSchedule.find(s => s.dayIndex === index)
              const isToday = index === todayDayIndex
              return (
                <View
                  key={day}
                  style={[styles.weekDay, isToday && styles.weekDayToday]}
                >
                  <Text style={[styles.weekDayName, isToday && styles.weekDayNameToday]}>
                    {day}
                  </Text>
                  <Text style={[styles.weekDayCount, isToday && styles.weekDayCountToday]}>
                    {schedule ? toArabicIndic(schedule.pages.length) : '٠'}
                  </Text>
                </View>
              )
            })}
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
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'right',
    marginBottom: 12,
  },
  card: {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardIcon: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'right',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: isDark ? '#888' : '#666',
    textAlign: 'right',
    marginBottom: 12,
  },
  pagesPreview: {
    fontSize: 12,
    color: isDark ? '#666' : '#999',
    textAlign: 'right',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: isDark ? '#333' : '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  weekDay: {
    width: '13%',
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  weekDayToday: {
    backgroundColor: '#2d8a4e',
  },
  weekDayName: {
    fontSize: 10,
    color: isDark ? '#888' : '#666',
    marginBottom: 4,
  },
  weekDayNameToday: {
    color: '#fff',
  },
  weekDayCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
  },
  weekDayCountToday: {
    color: '#fff',
  },
})

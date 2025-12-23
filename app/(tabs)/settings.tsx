import { View, Text, StyleSheet, ScrollView, Pressable, Switch, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useSettingsStore } from '@/stores'
import { toArabicIndic } from '@/utils/numerals'

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme()
  const settings = useSettingsStore()
  const isDark = settings.theme === 'system' ? systemColorScheme === 'dark' : settings.theme === 'dark'

  const styles = createStyles(isDark)

  const themeOptions = [
    { value: 'light', label: 'فاتح' },
    { value: 'dark', label: 'داكن' },
    { value: 'system', label: 'تلقائي' },
  ] as const

  const fontSizeOptions = [
    { value: 'small', label: 'صغير' },
    { value: 'medium', label: 'متوسط' },
    { value: 'large', label: 'كبير' },
    { value: 'xlarge', label: 'كبير جداً' },
  ] as const

  const dailyGoalOptions = [
    { value: 0.25, label: 'ربع صفحة' },
    { value: 0.5, label: 'نصف صفحة' },
    { value: 1, label: 'صفحة كاملة' },
    { value: 2, label: 'صفحتان' },
  ] as const

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المظهر</Text>

          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>السمة</Text>
            <View style={styles.optionGroup}>
              {themeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionButton,
                    settings.theme === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => settings.setTheme(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.theme === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>حجم الخط</Text>
            <View style={styles.optionGroup}>
              {fontSizeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionButton,
                    settings.fontSize === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => settings.setFontSize(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.fontSize === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Memorization Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الحفظ</Text>

          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>الهدف اليومي</Text>
            <View style={styles.optionGroup}>
              {dailyGoalOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionButton,
                    settings.dailyGoal === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => settings.setDailyGoal(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.dailyGoal === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>عدد التكرارات المستهدف</Text>
              <Text style={styles.settingValue}>{toArabicIndic(settings.targetRepetitions)}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Pressable
                style={styles.sliderButton}
                onPress={() => settings.setTargetRepetitions(Math.max(35, settings.targetRepetitions - 5))}
              >
                <Ionicons name="remove" size={20} color={isDark ? '#fff' : '#1a1a1a'} />
              </Pressable>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${((settings.targetRepetitions - 35) / 15) * 100}%` }
                  ]}
                />
              </View>
              <Pressable
                style={styles.sliderButton}
                onPress={() => settings.setTargetRepetitions(Math.min(50, settings.targetRepetitions + 5))}
              >
                <Ionicons name="add" size={20} color={isDark ? '#fff' : '#1a1a1a'} />
              </Pressable>
            </View>
            <Text style={styles.settingHint}>الموصى به: ٣٥-٥٠ تكرار للتثبيت الجيد</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>تفعيل التكرار المتباعد</Text>
              <Switch
                value={settings.enableSpacedRepetition}
                onValueChange={settings.setEnableSpacedRepetition}
                trackColor={{ false: '#767577', true: '#2d8a4e' }}
                thumbColor={settings.enableSpacedRepetition ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الصوت</Text>

          <View style={styles.settingCard}>
            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>التشغيل التلقائي للآية التالية</Text>
              <Switch
                value={settings.autoPlayNext}
                onValueChange={settings.setAutoPlayNext}
                trackColor={{ false: '#767577', true: '#2d8a4e' }}
                thumbColor={settings.autoPlayNext ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>عدد التكرار الافتراضي</Text>
              <Text style={styles.settingValue}>{toArabicIndic(settings.defaultRepeatCount)}</Text>
            </View>
            <View style={styles.repeatButtons}>
              {[1, 3, 5, 10].map((count) => (
                <Pressable
                  key={count}
                  style={[
                    styles.repeatButton,
                    settings.defaultRepeatCount === count && styles.repeatButtonActive,
                  ]}
                  onPress={() => settings.setDefaultRepeatCount(count)}
                >
                  <Text
                    style={[
                      styles.repeatButtonText,
                      settings.defaultRepeatCount === count && styles.repeatButtonTextActive,
                    ]}
                  >
                    {toArabicIndic(count)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإشعارات</Text>

          <View style={styles.settingCard}>
            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>تفعيل الإشعارات</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={settings.setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#2d8a4e' }}
                thumbColor={settings.notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>تذكير السلسلة اليومية</Text>
              <Switch
                value={settings.streakReminders}
                onValueChange={settings.setStreakReminders}
                trackColor={{ false: '#767577', true: '#2d8a4e' }}
                thumbColor={settings.streakReminders ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Reset */}
        <View style={styles.section}>
          <Pressable style={styles.resetButton} onPress={settings.resetSettings}>
            <Text style={styles.resetButtonText}>إعادة الإعدادات الافتراضية</Text>
          </Pressable>
        </View>

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
  settingCard: {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'right',
    marginBottom: 12,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d8a4e',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingHint: {
    fontSize: 12,
    color: isDark ? '#888' : '#666',
    textAlign: 'right',
    marginTop: 8,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: isDark ? '#333' : '#f0f0f0',
  },
  optionButtonActive: {
    backgroundColor: '#2d8a4e',
  },
  optionText: {
    fontSize: 14,
    color: isDark ? '#fff' : '#1a1a1a',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? '#333' : '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: isDark ? '#333' : '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#2d8a4e',
    borderRadius: 4,
  },
  repeatButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  repeatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? '#333' : '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatButtonActive: {
    backgroundColor: '#2d8a4e',
  },
  repeatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
  },
  repeatButtonTextActive: {
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

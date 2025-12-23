import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, useColorScheme, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useSettingsStore } from '@/stores'

const { width } = Dimensions.get('window')

const slides = [
  {
    icon: 'book' as const,
    title: 'حفظ القرآن الكريم',
    description: 'تطبيق مجاني لحفظ القرآن الكريم بطريقة الحفاظ التقليدية الأصيلة',
    color: '#2d8a4e',
  },
  {
    icon: 'layers' as const,
    title: 'نظام المراجعة الثلاثي',
    description: 'السبق للحفظ الجديد، السبقي للمراجعة القريبة، والمنزل للمراجعة البعيدة',
    color: '#4a90d9',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'الحصون الخمسة',
    description: 'منهج شامل يشمل الاستماع والتحضير والحفظ والمراجعة القريبة والبعيدة',
    color: '#d97706',
  },
  {
    icon: 'trending-up' as const,
    title: 'تتبع التقدم',
    description: 'راقب تقدمك وحافظ على سلسلة أيامك المتتالية لتحقيق أهدافك',
    color: '#8b5cf6',
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const systemColorScheme = useColorScheme()
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding)

  const [currentSlide, setCurrentSlide] = useState(0)

  const isDark = systemColorScheme === 'dark'
  const styles = createStyles(isDark)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      completeOnboarding()
      router.replace('/')
    }
  }

  const handleSkip = () => {
    completeOnboarding()
    router.replace('/')
  }

  const slide = slides[currentSlide]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentSlide > 0 && (
          <Pressable style={styles.backButton} onPress={() => setCurrentSlide(currentSlide - 1)}>
            <Ionicons name="arrow-forward" size={24} color={isDark ? '#fff' : '#1a1a1a'} />
          </Pressable>
        )}
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>تخطي</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
          <Ionicons name={slide.icon} size={80} color={slide.color} />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlide && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <Pressable style={[styles.nextButton, { backgroundColor: slide.color }]} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'ابدأ الآن' : 'التالي'}
          </Text>
          <Ionicons
            name={currentSlide === slides.length - 1 ? 'checkmark' : 'arrow-back'}
            size={24}
            color="#fff"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: isDark ? '#888' : '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: isDark ? '#888' : '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isDark ? '#333' : '#ddd',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#2d8a4e',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSettingsStore } from '@/stores'

export default function TabLayout() {
  const systemColorScheme = useColorScheme()
  const theme = useSettingsStore((s) => s.theme)
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  const colors = {
    primary: '#1a472a',
    background: isDark ? '#0a0a0a' : '#f5f5f5',
    tabBar: isDark ? '#1a1a1a' : '#ffffff',
    inactive: isDark ? '#666' : '#999',
    active: '#2d8a4e',
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: isDark ? '#333' : '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: 'حفظ القرآن',
        }}
      />
      <Tabs.Screen
        name="memorize"
        options={{
          title: 'الحفظ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
          headerTitle: 'الحفظ والمراجعة',
        }}
      />
      <Tabs.Screen
        name="listen"
        options={{
          title: 'الاستماع',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="headset" size={size} color={color} />
          ),
          headerTitle: 'الاستماع',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'التقدم',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
          headerTitle: 'التقدم',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          headerTitle: 'الإعدادات',
        }}
      />
    </Tabs>
  )
}

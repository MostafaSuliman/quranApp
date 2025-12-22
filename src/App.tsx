import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  HomePage,
  MemorizePage,
  ListenPage,
  ProgressPage,
  SettingsPage,
  OnboardingPage,
} from '@/pages'
import { useSettingsStore } from '@/stores/settings'

function App() {
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete)

  return (
    <ThemeProvider>
      <div className="min-h-screen" dir="rtl" lang="ar">
        <Routes>
          {/* Onboarding route */}
          <Route
            path="/onboarding"
            element={
              onboardingComplete ? <Navigate to="/" replace /> : <OnboardingPage />
            }
          />

          {/* Main app routes with layout */}
          <Route
            element={
              !onboardingComplete ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <AppLayout />
              )
            }
          >
            <Route index element={<HomePage />} />
            <Route path="memorize" element={<MemorizePage />} />
            <Route path="listen" element={<ListenPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App

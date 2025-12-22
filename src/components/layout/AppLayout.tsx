import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { cn } from '@/utils/cn'

interface AppLayoutProps {
  hideNav?: boolean
}

export function AppLayout({ hideNav = false }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Main content area */}
      <main
        className={cn(
          'flex-1 overflow-y-auto',
          !hideNav && 'pb-16' // Space for bottom nav
        )}
      >
        <Outlet />
      </main>

      {/* Bottom navigation */}
      {!hideNav && <BottomNav />}
    </div>
  )
}

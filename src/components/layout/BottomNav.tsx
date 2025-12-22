import { NavLink } from 'react-router-dom'
import { Book, Headphones, Target, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

interface NavItem {
  path: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  arabicLabel: string
}

const navItems: NavItem[] = [
  {
    path: '/',
    icon: Book,
    label: 'Quran',
    arabicLabel: 'المصحف',
  },
  {
    path: '/memorize',
    icon: Target,
    label: 'Memorize',
    arabicLabel: 'الحفظ',
  },
  {
    path: '/listen',
    icon: Headphones,
    label: 'Listen',
    arabicLabel: 'الاستماع',
  },
  {
    path: '/progress',
    icon: BarChart2,
    label: 'Progress',
    arabicLabel: 'التقدم',
  },
  {
    path: '/settings',
    icon: Settings,
    label: 'Settings',
    arabicLabel: 'الإعدادات',
  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95 safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    isActive && 'scale-110 transition-transform'
                  )}
                />
                <span className="text-xs arabic-ui">{item.arabicLabel}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUIText, UIText } from '../utils/uiText'

interface NavItem {
  nameKey: keyof UIText
  path: string
  icon: string
  activeIcon: string
}

const navItems: NavItem[] = [
  {
    nameKey: 'home',
    path: '/',
    icon: '🏠',
    activeIcon: '🏡'
  },
  {
    nameKey: 'learn',
    path: '/lesson/current',
    icon: '📖',
    activeIcon: '📚'
  },
  {
    nameKey: 'mushaf',
    path: '/mushaf',
    icon: '📖',
    activeIcon: '📖'
  },
  {
    nameKey: 'progress',
    path: '/progress',
    icon: '📊',
    activeIcon: '📈'
  },
  {
    nameKey: 'settings',
    path: '/settings',
    icon: '⚙️',
    activeIcon: '🔧'
  }
]

const Navigation: React.FC = () => {
  const location = useLocation()
  const { text: t } = useUIText()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 safe-area-pb z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/lesson/current' && location.pathname.startsWith('/lesson'))
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center min-w-0 flex-1 group min-h-[44px]"
              aria-label={`Navigate to ${t[item.nameKey]}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-600 dark:bg-gold-400 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <motion.div
                className="text-2xl mb-1"
                animate={{
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive ? [0, -10, 10, 0] : 0
                }}
                transition={{
                  scale: { type: "spring", stiffness: 400, damping: 20 },
                  rotate: { duration: 0.5, ease: "easeInOut" }
                }}
                aria-hidden="true"
              >
                {isActive ? item.activeIcon : item.icon}
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-600 dark:text-gold-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}
              >
                {t[item.nameKey]}
              </span>

              {/* Ripple effect on tap */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                whileTap={{ 
                  backgroundColor: "rgba(4, 120, 87, 0.1)",
                  scale: 0.95
                }}
                transition={{ duration: 0.1 }}
              />
            </NavLink>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default Navigation

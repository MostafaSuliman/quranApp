import { ArrowRight, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { cn } from '@/utils/cn'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  actions?: React.ReactNode
  className?: string
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions,
  className,
}: HeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95 safe-top',
        className
      )}
    >
      {showBack && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleBack}
          aria-label="الرجوع"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold truncate arabic-ui">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate arabic-ui">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('px-4 py-6 sm:px-6', className)}>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 arabic-ui">
          {description}
        </p>
      )}
    </div>
  )
}

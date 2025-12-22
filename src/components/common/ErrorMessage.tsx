import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/utils/cn'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  title = 'حدث خطأ',
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-6 text-center',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 arabic-ui">
          {title}
        </h3>
        <p className="max-w-md text-neutral-600 dark:text-neutral-400 arabic-ui">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="arabic-ui">إعادة المحاولة</span>
        </Button>
      )}
    </div>
  )
}

interface ErrorPageProps {
  message?: string
  onRetry?: () => void
}

export function ErrorPage({
  message = 'تعذر تحميل البيانات. تأكد من اتصالك بالإنترنت.',
  onRetry,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorMessage message={message} onRetry={onRetry} />
    </div>
  )
}

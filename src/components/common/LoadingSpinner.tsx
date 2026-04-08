import { cn } from '@/lib/utils'

export function LoadingSpinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-blue-600', sizes[size])} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-white p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="h-6 w-14 rounded-full bg-gray-200" />
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="h-5 w-3/4 rounded bg-gray-200 mb-2" />
      <div className="h-4 w-1/2 rounded bg-gray-200 mb-4" />
      <div className="flex gap-2">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
      </div>
    </div>
  )
}

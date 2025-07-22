/**
 * Responsive Container Component
 * Ensures perfect mobile responsiveness across all screen sizes
 */

import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'full',
  padding = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2',
    md: 'px-4 py-4',
    lg: 'px-6 py-6'
  }

  return (
    <div className={cn(
      'container mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      'min-h-0', // Prevent layout issues
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-first responsive grid
export function ResponsiveGrid({ 
  children, 
  className,
  cols = { sm: 1, md: 2, lg: 3 }
}: {
  children: React.ReactNode
  className?: string
  cols?: { sm?: number, md?: number, lg?: number }
}) {
  const gridClasses = cn(
    'grid gap-4 w-full',
    `grid-cols-${cols.sm || 1}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}
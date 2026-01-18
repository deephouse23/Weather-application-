'use client'

import { cn } from '@/lib/utils'

interface MapSkeletonProps {
  height?: string
  className?: string
}

export function MapSkeleton({
  height = 'h-[400px]',
  className
}: MapSkeletonProps) {
  return (
    <div
      className={cn(
        'w-full rounded-lg border-2 border-dashed',
        'bg-gray-900/80 border-gray-600',
        'flex items-center justify-center',
        'font-mono text-gray-400',
        height,
        className
      )}
      style={{ minHeight: '350px', contain: 'layout style paint' }}
      aria-label="Loading radar map"
      role="status"
    >
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">📡</div>
        <div className="text-sm uppercase tracking-wider animate-pulse">Loading Radar...</div>
        <div className="mt-2 text-xs text-gray-500">Scroll to load map</div>
      </div>
    </div>
  )
}

export default MapSkeleton

'use client'

import { cn } from '@/lib/utils'

interface MapSkeletonProps {
  height?: string
  className?: string
}

/**
 * Radar skeleton with a CSS-only pixel-grid + sweep animation.
 * Plays while OpenLayers lazy-loads. No user-facing instructional copy;
 * the IntersectionObserver in map-container triggers the real map silently.
 */
export function MapSkeleton({
  height = 'h-[400px]',
  className
}: MapSkeletonProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg',
        'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
        'ring-1 ring-[var(--border-invisible)]',
        height,
        className
      )}
      style={{ minHeight: '350px', contain: 'layout style paint' }}
      aria-label="Loading radar map"
      role="status"
    >
      {/* Pixel grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(var(--theme-accent-rgb),0.6) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(var(--theme-accent-rgb),0.6) 0 1px, transparent 1px 32px)',
        }}
      />

      {/* Concentric range rings */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle, transparent 30%, rgba(var(--theme-accent-rgb),0.25) 30.5%, transparent 31%, transparent 60%, rgba(var(--theme-accent-rgb),0.25) 60.5%, transparent 61%, transparent 92%, rgba(var(--theme-accent-rgb),0.25) 92.5%, transparent 93%)',
        }}
      />

      {/* Sweep arc — outer div handles centering, inner handles rotation
          to avoid transform conflict. Uses Tailwind's global animate-spin
          keyframes (not styled-jsx, which would scope-rename and not bind). */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-[280px] w-[280px] rounded-full motion-safe:animate-spin"
          style={{
            animationDuration: '4s',
            animationTimingFunction: 'linear',
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(var(--theme-accent-rgb),0.35) 340deg, rgba(var(--theme-accent-rgb),0.55) 359deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, black 92%, transparent 93%)',
            WebkitMaskImage: 'radial-gradient(circle, black 92%, transparent 93%)',
          }}
        />
      </div>

      {/* Center pin */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'rgb(var(--theme-accent-rgb))', boxShadow: '0 0 12px rgba(var(--theme-accent-rgb),0.9)' }}
      />

      {/* Label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Acquiring radar
      </div>
    </div>
  )
}

'use client'

/**
 * Open-Meteo Attribution Badge
 *
 * Required attribution per CC BY 4.0 license for Open-Meteo weather data.
 * https://open-meteo.com/en/terms
 */

import { cn } from '@/lib/utils'

interface OpenMeteoAttributionProps {
  className?: string
}

export function OpenMeteoAttribution({ className }: OpenMeteoAttributionProps) {
  return (
    <a
      href="https://open-meteo.com/"
      target="_blank"
      rel="noopener noreferrer"
      title="Weather data provided by Open-Meteo.com (CC BY 4.0)"
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-mono',
        'border-border text-muted-foreground opacity-70 hover:opacity-100 transition-opacity',
        className
      )}
    >
      Weather data by <span className="font-bold text-foreground">Open-Meteo.com</span>
    </a>
  )
}

export default OpenMeteoAttribution

/**
 * Precipitation severity helper for forecast cards.
 *
 * Drives an optional left-edge accent + chip color on 7-day forecast tiles
 * so the scanline answer to "which day will it rain?" pops visually.
 * Mirrors the getAQIColor/getPollenColor shape in lib/air-quality-utils.ts.
 */

export type PrecipTier = 'none' | 'light' | 'moderate' | 'heavy'

export interface PrecipSeverity {
  tier: PrecipTier
  borderClass: string
  chipClass: string
}

export function getPrecipSeverity(prob: number | null | undefined): PrecipSeverity {
  const p = typeof prob === 'number' ? prob : 0

  if (p < 20) {
    return { tier: 'none', borderClass: '', chipClass: 'text-sky-400/80' }
  }
  if (p < 40) {
    return {
      tier: 'light',
      borderClass: 'border-l-[3px] border-l-sky-400/40',
      chipClass: 'text-sky-300',
    }
  }
  if (p < 70) {
    return {
      tier: 'moderate',
      borderClass: 'border-l-[3px] border-l-sky-400/70 shadow-[inset_3px_0_0_rgba(56,189,248,0.25)]',
      chipClass: 'text-sky-200 font-semibold',
    }
  }
  return {
    tier: 'heavy',
    borderClass:
      'border-l-[3px] border-l-sky-300 shadow-[inset_3px_0_0_rgba(125,211,252,0.45),0_0_18px_rgba(56,189,248,0.18)]',
    chipClass: 'text-sky-100 font-bold',
  }
}

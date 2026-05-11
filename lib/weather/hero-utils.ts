/**
 * Condition-aware accent for the hero weather card.
 *
 * Returns a whisper-quiet Tailwind background class layered over the
 * existing HERO_CARD chrome. Keeps the retro aesthetic — the accent is
 * a tint, not a banner.
 */

export function getHeroAccent(condition: string | null | undefined): string {
  const c = (condition || '').toLowerCase()

  if (c.includes('thunder')) return 'bg-indigo-500/[0.08]'
  if (c.includes('snow') || c.includes('sleet')) return 'bg-slate-200/[0.06]'
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return 'bg-blue-500/[0.07]'
  }
  if (c.includes('clear') || c.includes('sun')) return 'bg-amber-400/[0.06]'
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) {
    return 'bg-slate-400/[0.05]'
  }
  if (c.includes('cloud') || c.includes('overcast')) return 'bg-slate-500/[0.05]'

  return ''
}

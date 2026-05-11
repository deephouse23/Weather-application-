/**
 * Time-boxed editorial spotlight for the weekly blog generator.
 *
 * Returns extra instruction text to weave into the active blog topic, or null
 * if no spotlight is currently active. Each spotlight is gated by date so
 * stale angles automatically stop appearing after the window closes.
 */
export function getSpotlight(): string | null {
  const now = new Date()
  // Super El Niño coverage for the 2026-04-12 Sunday run only.
  // Scheduled cron fires at 12:00 UTC, so we gate to that UTC day.
  const windowStart = new Date('2026-04-12T00:00:00Z')
  const windowEnd = new Date('2026-04-13T00:00:00Z')
  if (now >= windowStart && now < windowEnd) {
    return 'Additionally, weave in coverage of the ongoing super El Niño event and how it is currently reshaping global weather patterns. Reference specific regional impacts (Pacific SST anomalies, shifted jet stream, precipitation and temperature departures) and tie it back to what readers may be experiencing where they live.'
  }
  return null
}

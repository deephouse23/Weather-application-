/**
 * Bortle Scale Estimation for Stargazer
 *
 * Rough heuristic based on nearest-city population.
 * For accurate values, use lightpollutionmap.info.
 */

const BORTLE_LABELS: Record<number, string> = {
  1: 'Excellent dark-sky site',
  2: 'Typical truly dark site',
  3: 'Rural sky',
  4: 'Rural/suburban transition',
  5: 'Suburban sky',
  6: 'Bright suburban sky',
  7: 'Suburban/urban transition',
  8: 'City sky',
  9: 'Inner-city sky',
};

export function estimateBortleClass(population: number | undefined): { bortle: number; label: string } {
  if (population == null || population < 1_000) {
    return { bortle: 4, label: BORTLE_LABELS[4] };
  }
  if (population < 10_000) {
    return { bortle: 4, label: BORTLE_LABELS[4] };
  }
  if (population < 50_000) {
    return { bortle: 5, label: BORTLE_LABELS[5] };
  }
  if (population < 100_000) {
    return { bortle: 6, label: BORTLE_LABELS[6] };
  }
  if (population < 500_000) {
    return { bortle: 7, label: BORTLE_LABELS[7] };
  }
  if (population < 1_000_000) {
    return { bortle: 8, label: BORTLE_LABELS[8] };
  }
  return { bortle: 9, label: BORTLE_LABELS[9] };
}

export function formatTonightDate(date: Date): string {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthFmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });
  const dayFmt = (d: Date) => d.getDate();
  return `${monthFmt(date)} ${dayFmt(date)} - ${monthFmt(tomorrow)} ${dayFmt(tomorrow)}, ${tomorrow.getFullYear()}`;
}

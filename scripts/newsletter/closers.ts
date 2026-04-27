/**
 * Closer-section rotation. Every post ending with "## Bottom Line" is the
 * AI tell readers learn to spot. Rotate by day-of-year so back-to-back
 * Wed → Sun runs land on different closers, and a `null` slot drops the
 * labeled header entirely once per cycle in favor of a natural wrap-up.
 *
 * Ported from the legacy generator (commit a334c00). With 8 entries and
 * Wed/Sun being 4 days apart, same-week posts always pull distinct closers.
 */

const CLOSER_HEADERS: (string | null)[] = [
  'What to Watch',
  'The Takeaway',
  'Looking Ahead',
  'Eyes on the Sky',
  'Heads Up',
  'On the Radar',
  'Field Notes',
  null,
];

export interface CloserChoice {
  /** Header text for the section, or null when no labeled section. */
  header: string | null;
  /** Prompt fragment instructing the model how to close. */
  instruction: string;
  /** Stable identifier for the chosen style — recorded in frontmatter. */
  id: string;
}

/**
 * Returns the closer style for a given run date. Defaults to `new Date()`
 * for normal use; tests can pin the date for determinism.
 */
export function pickCloser(now: Date = new Date()): CloserChoice {
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
  const choice = CLOSER_HEADERS[dayOfYear % CLOSER_HEADERS.length];
  if (choice === null) {
    return {
      header: null,
      instruction:
        'Close with a strong, natural wrap-up paragraph (2-3 sentences) that ties the piece together. Do NOT use a labeled section like "Bottom Line" or "Takeaway" — just a clean closing paragraph.',
      id: 'natural-wrapup',
    };
  }
  return {
    header: choice,
    instruction: `End with a "## ${choice}" section — 2-3 brief points, each one sentence. Concrete things to do, watch for, or remember.`,
    id: choice.toLowerCase().replace(/\s+/g, '-'),
  };
}

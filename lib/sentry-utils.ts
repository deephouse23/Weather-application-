/**
 * Validates a Sentry DSN by checking the hostname via URL parsing.
 * Prevents substring attacks (e.g., 'https://evil.com?sentry.io').
 */
export function isValidSentryDsn(dsn: string): boolean {
  try {
    const url = new URL(dsn);
    return url.hostname.endsWith('.sentry.io') || url.hostname === 'sentry.io';
  } catch {
    return false;
  }
}

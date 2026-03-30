/**
 * Sanitizes values before logging to prevent log injection attacks.
 * Strips newlines, carriage returns, tabs, and control characters.
 */
export function sanitizeLogValue(value: unknown): string {
  const str = typeof value === 'string' ? value : String(value ?? '');
  return str.replace(/[\r\n\t]/g, ' ').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 1000);
}

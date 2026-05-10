/**
 * URL scheme guard for any href/src that originates from an external feed
 * (RSS, Reddit, Launch Library, USGS, etc.).
 *
 * `<a href="javascript:...">` and `window.open('javascript:...')` both execute
 * the URI as script. CSP `script-src 'unsafe-inline'` (currently set in
 * middleware.ts) does not block this — the only defense is to refuse
 * non-http(s) URLs at every render or open call site.
 *
 * Usage at render: `const safe = safeExternalUrl(item.url); if (!safe) return <span>...`
 * Usage at parser: drop items whose URL fails this check before storing.
 */
export function safeExternalUrl(url: unknown): string | null {
  if (typeof url !== 'string' || !url) return null;
  try {
    const parsed = new URL(url, 'https://placeholder.invalid');
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? url : null;
  } catch {
    return null;
  }
}

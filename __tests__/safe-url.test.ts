import { safeExternalUrl } from '@/lib/safe-url';

describe('safeExternalUrl', () => {
  test('drops javascript: URI', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('JavaScript:alert(1)')).toBeNull();
    expect(safeExternalUrl(' javascript:alert(1)')).toBeNull();
  });

  test('drops data: URI (would enable HTML/SVG XSS via window.open)', () => {
    expect(safeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeExternalUrl('data:image/svg+xml;base64,PHN2Zw==')).toBeNull();
  });

  test('drops other non-http schemes', () => {
    expect(safeExternalUrl('vbscript:msgbox')).toBeNull();
    expect(safeExternalUrl('file:///etc/passwd')).toBeNull();
    expect(safeExternalUrl('ftp://example.com')).toBeNull();
  });

  test('drops null, undefined, non-string, and empty', () => {
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
    expect(safeExternalUrl('')).toBeNull();
    expect(safeExternalUrl(42)).toBeNull();
    expect(safeExternalUrl({})).toBeNull();
  });

  test('passes valid http(s) URLs through unchanged', () => {
    expect(safeExternalUrl('https://example.com/path?q=1')).toBe('https://example.com/path?q=1');
    expect(safeExternalUrl('http://example.com')).toBe('http://example.com');
    expect(safeExternalUrl('https://www.reddit.com/r/weather/comments/x/y/')).toBe(
      'https://www.reddit.com/r/weather/comments/x/y/'
    );
  });

  test('handles malformed inputs without throwing', () => {
    // Malformed-but-parseable URLs that resolve to http(s) on the placeholder
    // host are returned verbatim — the browser will render them as relative
    // URLs on the page origin, which is not an XSS surface.
    expect(safeExternalUrl('://no-scheme')).toBe('://no-scheme');
    // `https://` (no host) makes the URL constructor throw → returns null.
    expect(safeExternalUrl('https://')).toBeNull();
  });
});

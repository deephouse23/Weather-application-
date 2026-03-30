/**
 * Tests for RSS HTML entity cleaning - CodeQL fix for double escaping
 */
import { decodeHtmlEntities } from '@/lib/services/rss/html-utils';

describe('RSS HTML cleaning - double escaping prevention', () => {
  it('should NOT double-decode &amp;lt; into <', () => {
    // &amp;lt; should become &lt; (literal text), NOT < (HTML bracket)
    expect(decodeHtmlEntities('&amp;lt;script&amp;gt;')).toBe('&lt;script&gt;');
  });

  it('should decode basic HTML entities', () => {
    expect(decodeHtmlEntities('Hello &amp; World')).toBe('Hello & World');
  });

  it('should strip tags created by decoding &lt;script&gt; entities', () => {
    // &lt;script&gt; decodes to <script> which must be stripped in a second pass
    expect(decodeHtmlEntities('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe('alert(1)');
  });
});

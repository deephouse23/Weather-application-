/**
 * Decode HTML entities in text. Strips tags twice: once before decoding
 * (for raw HTML) and once after (for tags created by entity decoding,
 * e.g., &lt;script&gt; -> <script>). Decodes &amp; last to prevent
 * double-escaping (e.g., &amp;lt; -> &lt; -> <).
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/<[^>]+>/g, '') // Strip raw HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&') // &amp; decoded LAST to avoid creating new entities
    .replace(/<[^>]+>/g, '') // Strip tags introduced by entity decoding
    .replace(/\s+/g, ' ')
    .trim();
}

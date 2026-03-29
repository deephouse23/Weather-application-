/**
 * Decode HTML entities in text. Decodes &amp; last to prevent
 * double-escaping (e.g., &amp;lt; -> &lt; -> <).
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&') // &amp; decoded LAST to avoid creating new entities
    .replace(/\s+/g, ' ')
    .trim();
}

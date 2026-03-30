/**
 * Decode HTML entities in text for plain text display.
 * Angle bracket entities (&lt; &gt;) are stripped rather than decoded
 * to prevent creating injectable HTML from encoded content.
 * Decodes &amp; last to prevent double-escaping.
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/<[^>]+>/g, '') // Strip raw HTML tags
    .replace(/&lt;/g, '')    // Remove encoded angle brackets (don't decode to <)
    .replace(/&gt;/g, '')    // Remove encoded angle brackets (don't decode to >)
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')  // &amp; decoded LAST to avoid creating new entities
    .replace(/\s+/g, ' ')
    .trim();
}

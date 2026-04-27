import { createHash } from 'node:crypto';
import { getAllPosts, type BlogPost, type NewsletterCadence } from '@/lib/blog';
import { TOPIC_SLUGS, type TopicSlug } from './topics';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const NEVER_USED_SCORE = 99;
const DEFAULT_LOOKBACK_WEEKS = 12;
const DEFAULT_IMAGE_REUSE_WEEKS = 8;

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'been',
  'being',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'for',
  'from',
  'had',
  'has',
  'have',
  'he',
  'her',
  'his',
  'i',
  'in',
  'is',
  'it',
  'its',
  'me',
  'might',
  'must',
  'my',
  'of',
  'on',
  'or',
  'our',
  'shall',
  'she',
  'should',
  'that',
  'the',
  'their',
  'these',
  'they',
  'this',
  'those',
  'to',
  'was',
  'we',
  'were',
  'will',
  'with',
  'would',
  'you',
  'your',
]);

/**
 * Loads all posts from the on-disk content/blog/ directory. Thin wrapper
 * around lib/blog so tests can bypass it and inject fixtures directly.
 */
export function loadHistory(): BlogPost[] {
  return getAllPosts();
}

/**
 * Filters posts authored within the last `weeks` weeks of `now`.
 * Defaults to 12 weeks, the standard newsletter lookback window.
 */
export function withinLookback(
  posts: BlogPost[],
  weeks: number = DEFAULT_LOOKBACK_WEEKS,
  now: Date = new Date(),
): BlogPost[] {
  const cutoff = now.getTime() - weeks * MS_PER_WEEK;
  return posts.filter((post) => {
    const ts = new Date(post.date).getTime();
    return Number.isFinite(ts) && ts >= cutoff;
  });
}

export function getRecentByCadence(
  posts: BlogPost[],
  cadence: NewsletterCadence,
  weeks: number = DEFAULT_LOOKBACK_WEEKS,
  now: Date = new Date(),
): BlogPost[] {
  return withinLookback(posts, weeks, now).filter((p) => p.cadence === cadence);
}

/**
 * Aggregated key-phrase deny-list across all posts of the same cadence in
 * the lookback window. Used as a "do not lean on these phrases" injection
 * in the generation prompt.
 */
export function getKeyPhraseDenyList(
  posts: BlogPost[],
  cadence: NewsletterCadence,
  weeks: number = DEFAULT_LOOKBACK_WEEKS,
  now: Date = new Date(),
): string[] {
  const recent = getRecentByCadence(posts, cadence, weeks, now);
  const set = new Set<string>();
  for (const post of recent) {
    for (const phrase of post.key_phrases ?? []) {
      const normalized = phrase.trim().toLowerCase();
      if (normalized) set.add(normalized);
    }
  }
  return Array.from(set).sort();
}

export function getOpenerHashes(
  posts: BlogPost[],
  cadence: NewsletterCadence,
  weeks: number = DEFAULT_LOOKBACK_WEEKS,
  now: Date = new Date(),
): string[] {
  return getRecentByCadence(posts, cadence, weeks, now)
    .map((p) => p.opener_hash)
    .filter((h): h is string => typeof h === 'string' && h.length > 0);
}

/**
 * Image IDs used by any post within `weeks`, regardless of cadence.
 * The image-reuse window is shorter than the content lookback (default 8
 * vs 12 weeks) — image variety is bounded by the catalog, not the corpus.
 */
export function getRecentImages(
  posts: BlogPost[],
  weeks: number = DEFAULT_IMAGE_REUSE_WEEKS,
  now: Date = new Date(),
): string[] {
  const recent = withinLookback(posts, weeks, now);
  const set = new Set<string>();
  for (const post of recent) {
    for (const id of post.images_used ?? []) {
      if (id) set.add(id);
    }
  }
  return Array.from(set);
}

/**
 * For each topic slug, the number of weeks since it was last used by a
 * Wednesday post. Topics not seen in the lookback window get NEVER_USED_SCORE
 * so the selection algorithm strongly favors them.
 */
export function getTopicWeeksSinceLastUsed(
  posts: BlogPost[],
  weeks: number = DEFAULT_LOOKBACK_WEEKS,
  now: Date = new Date(),
): Map<TopicSlug, number> {
  const recent = getRecentByCadence(posts, 'wednesday_topic', weeks, now);
  const lastSeen = new Map<TopicSlug, number>();
  for (const post of recent) {
    if (!post.topic_slug) continue;
    const slug = post.topic_slug as TopicSlug;
    if (!TOPIC_SLUGS.includes(slug)) continue;
    const weeksAgo = Math.floor(
      (now.getTime() - new Date(post.date).getTime()) / MS_PER_WEEK,
    );
    const prior = lastSeen.get(slug);
    if (prior === undefined || weeksAgo < prior) {
      lastSeen.set(slug, weeksAgo);
    }
  }
  const out = new Map<TopicSlug, number>();
  for (const slug of TOPIC_SLUGS) {
    out.set(slug, lastSeen.get(slug) ?? NEVER_USED_SCORE);
  }
  return out;
}

/**
 * Stable hash of the opening 30 content words. Strips frontmatter, headings,
 * images, links, and code so the hash reflects the prose itself, not its
 * scaffolding. Stopwords are removed before hashing so "The storm rolled in"
 * and "A storm rolled in" produce the same hash.
 *
 * Returns a SHA1 hex truncated to 8 chars — collisions are rare enough at
 * the 12-week corpus scale that 32 bits of entropy is plenty, and the short
 * form is readable in frontmatter.
 */
export function computeOpenerHash(markdown: string): string {
  const tokens = extractFirstWords(markdown, 30)
    .map((w) => w.toLowerCase())
    .filter((w) => !STOPWORDS.has(w));
  const normalized = tokens.join(' ');
  return createHash('sha1').update(normalized).digest('hex').slice(0, 8);
}

function extractFirstWords(markdown: string, count: number): string[] {
  let text = markdown;
  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---', 4);
    if (end !== -1) text = text.slice(end + 4);
  }
  text = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s+.*$/gm, '');
  // Strip HTML-like tags. Loop until stable so that a malformed input like
  // "<<script>" doesn't leave a residual "<script" after a single pass.
  // (CodeQL js/incomplete-multi-character-sanitization. Output is hashed,
  // not rendered, but loop-until-stable is the correct general fix.)
  let prev: string;
  do {
    prev = text;
    text = text.replace(/<[^>]+>/g, '');
  } while (text !== prev);
  text = text.replace(/[^\p{L}\p{N}\s'-]/gu, ' ');

  const words: string[] = [];
  for (const token of text.split(/\s+/)) {
    const cleaned = token.trim();
    if (cleaned) words.push(cleaned);
    if (words.length >= count) break;
  }
  return words;
}

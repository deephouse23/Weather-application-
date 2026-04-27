/**
 * Wednesday cadence — topic deep-dive pipeline.
 * See docs/PRD-newsletter-redesign.md §4.2 for the spec.
 */

import { getSpotlight } from '../blog-spotlight';
import { selectImages, type ImageEntry } from './images';
import { findAngleForTopic, fetchHeadlines, type NewsAngle } from './news';
import {
  callAnthropic,
  checkOpenerCollision,
  DEFAULT_MODEL,
  extractKeyPhrases,
  judgeSimilarity,
  type SimilarityVerdict,
} from './repetition';
import {
  computeOpenerHash,
  getKeyPhraseDenyList,
  getOpenerHashes,
  getRecentByCadence,
  getRecentImages,
  getTopicWeeksSinceLastUsed,
  loadHistory,
} from './state';
import { selectTopic, type Topic } from './topics';
import { buildVoiceCorrectionInstruction, sweepVoice, VOICE_SYSTEM_PROMPT } from './voice';

const SIMILARITY_THRESHOLD = 0.85;
const MAX_RETRIES = 2;
const TARGET_WORDS_MIN = 600;
const TARGET_WORDS_MAX = 900;

export interface WednesdayResult {
  topic: Topic;
  newsAngle: NewsAngle | null;
  spotlight: string | null;
  draft: string;
  similarity: SimilarityVerdict;
  keyPhrases: string[];
  openerHash: string;
  images: ImageEntry[];
  retries: number;
  wordCount: number;
}

export async function runWednesday(): Promise<WednesdayResult> {
  const history = loadHistory();
  const topicWeeks = getTopicWeeksSinceLastUsed(history);
  const topicResult = selectTopic(topicWeeks);
  const topic = topicResult.topic;
  console.log(`[wednesday] ${topicResult.rationale}`);

  const headlines = await fetchHeadlines();
  let newsAngle: NewsAngle | null = null;
  try {
    newsAngle = await findAngleForTopic(topic, headlines);
    if (newsAngle) console.log(`[wednesday] news angle: ${newsAngle.angle.slice(0, 120)}`);
    else console.log('[wednesday] no fitting news angle — leaning evergreen');
  } catch (err) {
    console.warn(`[wednesday] news angle lookup failed: ${(err as Error).message}`);
  }

  const spotlight = getSpotlight();
  const denyPhrases = getKeyPhraseDenyList(history, 'wednesday_topic');
  const recentOpenerHashes = getOpenerHashes(history, 'wednesday_topic');
  const recentImageIds = new Set(getRecentImages(history));
  const priorPosts = getRecentByCadence(history, 'wednesday_topic');

  const images = selectImages({
    topic: topic.slug,
    count: 3,
    excludeIds: recentImageIds,
  });
  console.log(`[wednesday] selected images: ${images.map((i) => i.id).join(', ')}`);

  let draft = await generate({
    topic,
    newsAngle,
    spotlight,
    denyPhrases,
    images,
    correction: null,
  });

  let retries = 0;
  let openerHash = computeOpenerHash(draft);
  let voiceViolations = sweepVoice(draft);

  while (retries < MAX_RETRIES) {
    const collides = checkOpenerCollision(openerHash, recentOpenerHashes);
    const tooShort = wordCount(draft) < 400;
    if (!collides && voiceViolations.length === 0 && !tooShort) break;

    const corrections: string[] = [];
    if (collides) corrections.push(`Your opening paragraph collides with a prior post (hash ${openerHash}). Rewrite the opener with a distinct framing and concrete specifics.`);
    if (voiceViolations.length > 0) corrections.push(buildVoiceCorrectionInstruction(voiceViolations));
    if (tooShort) corrections.push(`Draft was ${wordCount(draft)} words — expand to ${TARGET_WORDS_MIN}-${TARGET_WORDS_MAX} with more specific detail.`);

    retries += 1;
    console.log(`[wednesday] retry ${retries} — ${corrections.length} correction(s)`);
    draft = await generate({
      topic,
      newsAngle,
      spotlight,
      denyPhrases,
      images,
      correction: corrections.join('\n\n'),
    });
    openerHash = computeOpenerHash(draft);
    voiceViolations = sweepVoice(draft);
  }

  let similarity: SimilarityVerdict = { max: 0, worstMatch: null, triggerPhrases: [] };
  try {
    similarity = await judgeSimilarity(draft, priorPosts);
  } catch (err) {
    console.warn(`[wednesday] judge failed: ${(err as Error).message}; persisting without judge score`);
  }

  if (similarity.max > SIMILARITY_THRESHOLD && retries < MAX_RETRIES) {
    retries += 1;
    console.log(`[wednesday] retry ${retries} — judge similarity ${similarity.max.toFixed(2)} > ${SIMILARITY_THRESHOLD}`);
    const correction = `Your last draft scored ${similarity.max.toFixed(2)} similarity against a prior post (${similarity.worstMatch?.slug}). The judge flagged: "${similarity.worstMatch?.reason}". Avoid these specific phrasings: ${similarity.triggerPhrases.join('; ')}. Rewrite with a distinct angle and voice.`;
    draft = await generate({
      topic,
      newsAngle,
      spotlight,
      denyPhrases: [...denyPhrases, ...similarity.triggerPhrases],
      images,
      correction,
    });
    openerHash = computeOpenerHash(draft);
    try {
      similarity = await judgeSimilarity(draft, priorPosts);
    } catch {
      // keep prior similarity
    }
  }

  const keyPhrases = await extractKeyPhrases(draft).catch(() => [] as string[]);

  return {
    topic,
    newsAngle,
    spotlight,
    draft,
    similarity,
    keyPhrases,
    openerHash,
    images,
    retries,
    wordCount: wordCount(draft),
  };
}

interface GenerateOpts {
  topic: Topic;
  newsAngle: NewsAngle | null;
  spotlight: string | null;
  denyPhrases: string[];
  images: ImageEntry[];
  correction: string | null;
}

async function generate(opts: GenerateOpts): Promise<string> {
  const { topic, newsAngle, spotlight, denyPhrases, images, correction } = opts;

  const systemBlocks = [
    { type: 'text' as const, text: VOICE_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' as const } },
    { type: 'text' as const, text: `TOPIC FOR THIS POST\n\nTitle: ${topic.title}\nScope: ${topic.description}\nKeywords: ${topic.keywords.join(', ')}` },
  ];

  const sections: string[] = [];
  sections.push(`Write a 600-900 word deep-dive post on this topic. The reader should leave knowing something they did not know that morning.`);

  if (newsAngle) {
    sections.push(`CURRENT ANGLE: ${newsAngle.angle}`);
    if (newsAngle.sources.length > 0) {
      sections.push(`Headlines that informed the angle (do not link directly, just inform):\n${newsAngle.sources.map((s) => `- ${s}`).join('\n')}`);
    }
  } else {
    sections.push(`No fresh news hook identified — write evergreen-educational, with a one-sentence acknowledgment that nothing major moved on this front this week if it's natural to do so.`);
  }

  if (spotlight) {
    sections.push(`EDITORIAL SPOTLIGHT: ${spotlight}`);
  }

  if (denyPhrases.length > 0) {
    sections.push(`DO NOT use these specific phrases or near-paraphrases (recent posts have already used them):\n${denyPhrases.slice(0, 30).map((p) => `- ${p}`).join('\n')}`);
  }

  sections.push(`IMAGES — embed each of these inline, separated by body text. Use Markdown image syntax with the provided URL and caption. Do not invent additional images.`);
  for (const img of images) {
    sections.push(`![${img.caption}](${img.url})\n*${img.credit}*`);
  }

  sections.push(`STRUCTURE:
- Open with a concrete specific hook — a number, a place, a date, a measurement.
- 2 or 3 ## section headers within the body. Use them to give the piece shape.
- End with "## Bottom Line" — 2-3 actionable or memorable takeaways, each one sentence.
- Word count target: 600-900.`);

  if (correction) {
    sections.push(`CORRECTIONS FROM PRIOR ATTEMPT:\n${correction}`);
  }

  sections.push(`Return only the markdown body of the post — no frontmatter, no fences, no commentary. Do not include a # H1 title; the publish step adds that from frontmatter.`);

  return callAnthropic({
    model: DEFAULT_MODEL,
    systemBlocks,
    messages: [{ role: 'user', content: sections.join('\n\n') }],
    maxTokens: 3000,
    temperature: 0.7,
  });
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

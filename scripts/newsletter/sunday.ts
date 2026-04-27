/**
 * Sunday cadence — Rearview + Roadmap pipeline.
 * See docs/PRD-newsletter-redesign.md §4.3 for the spec.
 *
 * Hard rule: if Iowa Mesonet returns nothing for the past week, we fail
 * the run rather than fabricate Rearview content.
 */

import { getSpotlight } from '../blog-spotlight';
import { fetchPastWeekQuakes } from './data/earthquakes';
import { fetchForecastOutlook } from './data/forecast';
import { fetchPastWeekWarnings, MesonetEmptyError } from './data/mesonet';
import { fetchSpaceWeatherSummary } from './data/space-weather';
import { fetchPastWeekReports } from './data/spc-reports';
import { selectImages, type ImageEntry } from './images';
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
  loadHistory,
} from './state';
import { buildVoiceCorrectionInstruction, sweepVoice, VOICE_SYSTEM_PROMPT } from './voice';

const SIMILARITY_THRESHOLD = 0.85;
const MAX_RETRIES = 2;

export interface SundayResult {
  spotlight: string | null;
  draft: string;
  similarity: SimilarityVerdict;
  keyPhrases: string[];
  openerHash: string;
  images: ImageEntry[];
  retries: number;
  wordCount: number;
}

export async function runSunday(): Promise<SundayResult> {
  const history = loadHistory();
  const recentOpenerHashes = getOpenerHashes(history, 'sunday_rearview');
  const denyPhrases = getKeyPhraseDenyList(history, 'sunday_rearview');
  const recentImageIds = new Set(getRecentImages(history));
  const priorPosts = getRecentByCadence(history, 'sunday_rearview');

  console.log('[sunday] fetching past-week data');
  // Iowa Mesonet is the load-bearing source for Rearview. Fetch first
  // and fail loudly if empty — do not paper over with fabricated content.
  const warnings = await fetchPastWeekWarnings();
  console.log(`[sunday] mesonet: ${warnings.totalWarnings} warnings, ${warnings.notable.length} notable`);

  const [spcSummary, spaceSummary, quakeSummary, forecast] = await Promise.all([
    fetchPastWeekReports().catch((err) => {
      console.warn(`[sunday] SPC reports failed: ${(err as Error).message}`);
      return { total: 0, byCategory: { tornado: 0, hail: 0, wind: 0 }, byState: {}, reports: [], daysCovered: 7 };
    }),
    fetchSpaceWeatherSummary().catch((err) => {
      console.warn(`[sunday] SWPC failed: ${(err as Error).message}`);
      return { recentKp: [], maxKpPastWeek: 0, recentXrayClass: null, notableFlares: [] };
    }),
    fetchPastWeekQuakes().catch((err) => {
      console.warn(`[sunday] USGS failed: ${(err as Error).message}`);
      return { significantCount: 0, m45PlusCount: 0, largest: null, significant: [] };
    }),
    fetchForecastOutlook().catch((err) => {
      console.warn(`[sunday] forecast outlook failed: ${(err as Error).message}`);
      return { conusQuadrants: [], international: [], fetchedAt: new Date().toISOString() };
    }),
  ]);
  console.log(`[sunday] SPC: ${spcSummary.total} reports, max Kp: ${spaceSummary.maxKpPastWeek}, quakes: ${quakeSummary.significantCount} significant`);

  // Sunday recap is a multi-domain summary, not a single topic. Pick
  // images that span severe + tropical + space + marine/agricultural so
  // the visual palette matches the content.
  const sundayImageTopics = ['severe_storms', 'tropical', 'space_weather', 'tech_and_models'] as const;
  const images: ImageEntry[] = [];
  const usedIds = new Set<string>(recentImageIds);
  for (const t of sundayImageTopics) {
    if (images.length >= 3) break;
    try {
      const picked = selectImages({ topic: t, count: 1, excludeIds: usedIds });
      for (const p of picked) {
        usedIds.add(p.id);
        images.push(p);
      }
    } catch {
      // pool starved — skip and try the next topic
    }
  }
  if (images.length < 2) {
    // Fallback: just pull any 2 unused images via a broad neighbor lookup.
    const broadPicks = selectImages({ topic: 'tech_and_models', count: 2, excludeIds: usedIds });
    for (const p of broadPicks) images.push(p);
  }
  console.log(`[sunday] selected images: ${images.map((i) => i.id).join(', ')}`);

  const spotlight = getSpotlight();

  let draft = await generate({
    warnings,
    spcSummary,
    spaceSummary,
    quakeSummary,
    forecast,
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
    const tooShort = wordCount(draft) < 500;
    const missingHeaders = !/##\s*Rearview/i.test(draft) || !/##\s*Roadmap/i.test(draft);
    if (!collides && voiceViolations.length === 0 && !tooShort && !missingHeaders) break;

    const corrections: string[] = [];
    if (collides) corrections.push(`Your opening collides with a prior Sunday post. Rewrite with a distinct framing and concrete specifics from this week's data.`);
    if (voiceViolations.length > 0) corrections.push(buildVoiceCorrectionInstruction(voiceViolations));
    if (tooShort) corrections.push(`Draft was ${wordCount(draft)} words. Both Rearview (~250-350 words) and Roadmap (~350-500 words) need to be present and substantive.`);
    if (missingHeaders) corrections.push(`Use the exact section headers "## Rearview" and "## Roadmap" — not paraphrased versions.`);

    retries += 1;
    console.log(`[sunday] retry ${retries} — ${corrections.length} correction(s)`);
    draft = await generate({
      warnings,
      spcSummary,
      spaceSummary,
      quakeSummary,
      forecast,
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
    console.warn(`[sunday] judge failed: ${(err as Error).message}`);
  }

  if (similarity.max > SIMILARITY_THRESHOLD && retries < MAX_RETRIES) {
    retries += 1;
    console.log(`[sunday] retry ${retries} — similarity ${similarity.max.toFixed(2)} > ${SIMILARITY_THRESHOLD}`);
    const correction = `Your last draft scored ${similarity.max.toFixed(2)} similarity against a prior Sunday post (${similarity.worstMatch?.slug}). Avoid these phrasings: ${similarity.triggerPhrases.join('; ')}.`;
    draft = await generate({
      warnings,
      spcSummary,
      spaceSummary,
      quakeSummary,
      forecast,
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
  warnings: Awaited<ReturnType<typeof fetchPastWeekWarnings>>;
  spcSummary: Awaited<ReturnType<typeof fetchPastWeekReports>>;
  spaceSummary: Awaited<ReturnType<typeof fetchSpaceWeatherSummary>>;
  quakeSummary: Awaited<ReturnType<typeof fetchPastWeekQuakes>>;
  forecast: Awaited<ReturnType<typeof fetchForecastOutlook>>;
  spotlight: string | null;
  denyPhrases: string[];
  images: ImageEntry[];
  correction: string | null;
}

async function generate(opts: GenerateOpts): Promise<string> {
  const {
    warnings,
    spcSummary,
    spaceSummary,
    quakeSummary,
    forecast,
    spotlight,
    denyPhrases,
    images,
    correction,
  } = opts;

  const systemBlocks = [
    { type: 'text' as const, text: VOICE_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' as const } },
    {
      type: 'text' as const,
      text: `SUNDAY CADENCE — REARVIEW + ROADMAP\n\nWrite two clearly-labeled sections: ## Rearview (250-350 words on the past 7 days) and ## Roadmap (350-500 words on the week ahead).\n\nRearview cites real events from the supplied data. Roadmap describes the pattern shaping the next 7 days, with regional cuts.`,
    },
  ];

  const dataBlock = formatDataBlock({ warnings, spcSummary, spaceSummary, quakeSummary, forecast });

  const sections: string[] = [];
  sections.push(dataBlock);

  if (spotlight) {
    sections.push(`EDITORIAL SPOTLIGHT: ${spotlight}`);
  }

  if (denyPhrases.length > 0) {
    sections.push(`DO NOT use these specific phrases or near-paraphrases (recent posts have already used them):\n${denyPhrases.slice(0, 30).map((p) => `- ${p}`).join('\n')}`);
  }

  sections.push(`IMAGES — embed each of these inline, separated by body text. Use Markdown image syntax. Do not invent additional images.`);
  for (const img of images) {
    sections.push(`![${img.caption}](${img.url})\n*${img.credit}*`);
  }

  sections.push(`STRUCTURE:
- Open with a concrete specific hook from the past week's data — a named storm, a record, a count.
- ## Rearview: 3-5 specific events. Cite states, magnitudes, dates. No generalities.
- ## Roadmap: pattern overview, then 2-3 regional cuts (CONUS quadrants + a notable international callout). Tie to mechanism (jet stream position, ridge, trough, MJO phase, etc.) where you can.
- ## Bottom Line: 2-3 actionable takeaways.`);

  if (correction) {
    sections.push(`CORRECTIONS FROM PRIOR ATTEMPT:\n${correction}`);
  }

  sections.push(`Return only the markdown body — no frontmatter, no fences, no commentary. Do not include a # H1 title.`);

  return callAnthropic({
    model: DEFAULT_MODEL,
    systemBlocks,
    messages: [{ role: 'user', content: sections.join('\n\n') }],
    maxTokens: 3500,
    temperature: 0.7,
  });
}

function formatDataBlock(opts: {
  warnings: Awaited<ReturnType<typeof fetchPastWeekWarnings>>;
  spcSummary: Awaited<ReturnType<typeof fetchPastWeekReports>>;
  spaceSummary: Awaited<ReturnType<typeof fetchSpaceWeatherSummary>>;
  quakeSummary: Awaited<ReturnType<typeof fetchPastWeekQuakes>>;
  forecast: Awaited<ReturnType<typeof fetchForecastOutlook>>;
}): string {
  const { warnings, spcSummary, spaceSummary, quakeSummary, forecast } = opts;
  const lines: string[] = ['PAST 7 DAYS — REAL DATA (cite specifics, do not generalize):'];

  lines.push(`\n## NWS warnings (Iowa State Mesonet)`);
  lines.push(`Total: ${warnings.totalWarnings}`);
  lines.push(`By type: ${Object.entries(warnings.byType).slice(0, 10).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  if (warnings.notable.length > 0) {
    lines.push('Notable events:');
    for (const w of warnings.notable.slice(0, 6)) {
      lines.push(`- ${w.phenomena}.${w.significance} ${w.area_desc} (${w.wfo}) ${w.issued}`);
    }
  }

  lines.push(`\n## SPC storm reports`);
  lines.push(`Tornado: ${spcSummary.byCategory.tornado}, Hail: ${spcSummary.byCategory.hail}, Wind: ${spcSummary.byCategory.wind}`);
  const topStates = Object.entries(spcSummary.byState).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topStates.length > 0) {
    lines.push(`Top states: ${topStates.map(([s, n]) => `${s}=${n}`).join(', ')}`);
  }

  lines.push(`\n## Space weather (NOAA SWPC)`);
  lines.push(`Max Kp past week: ${spaceSummary.maxKpPastWeek}`);
  lines.push(`Recent X-ray peak class: ${spaceSummary.recentXrayClass ?? 'quiet'}`);
  if (spaceSummary.notableFlares.length > 0) {
    lines.push('Notable flares:');
    for (const f of spaceSummary.notableFlares) {
      lines.push(`- ${f.class} at ${f.time}`);
    }
  }

  lines.push(`\n## Significant earthquakes (USGS)`);
  lines.push(`Significant count: ${quakeSummary.significantCount}, M4.5+: ${quakeSummary.m45PlusCount}`);
  if (quakeSummary.largest) {
    lines.push(`Largest: M${quakeSummary.largest.mag.toFixed(1)} ${quakeSummary.largest.place} ${quakeSummary.largest.time}`);
  }
  for (const q of quakeSummary.significant.slice(0, 4)) {
    lines.push(`- M${q.mag.toFixed(1)} ${q.place}${q.tsunami ? ' (tsunami flag)' : ''}`);
  }

  lines.push(`\nNEXT 7 DAYS — FORECAST OUTLOOK (Open-Meteo / ERA5):`);
  for (const r of forecast.conusQuadrants) {
    if (r.daily.length === 0) continue;
    const week = r.daily.slice(0, 7);
    const avgMax = week.reduce((s, d) => s + d.tMaxF, 0) / week.length;
    const totalPrecip = week.reduce((s, d) => s + d.precipIn, 0);
    const peakPrecipDay = week.reduce((p, d) => (d.precipProb > p.precipProb ? d : p), week[0]);
    lines.push(`- ${r.region}: avg high ${avgMax.toFixed(0)}°F, week precip ${totalPrecip.toFixed(2)}", peak precip prob ${peakPrecipDay.precipProb}% on ${peakPrecipDay.date}`);
  }
  for (const r of forecast.international.slice(0, 1)) {
    if (r.daily.length === 0) continue;
    const week = r.daily.slice(0, 7);
    const avgMax = week.reduce((s, d) => s + d.tMaxF, 0) / week.length;
    lines.push(`- International: ${r.region}: avg high ${avgMax.toFixed(0)}°F over the week`);
  }

  return lines.join('\n');
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export { MesonetEmptyError };

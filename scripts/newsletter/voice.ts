/**
 * Voice spec for newsletter generation. Encodes the editorial rules from
 * docs/PRD-newsletter-redesign.md §4.4. Used as system-prompt fragments
 * and as a post-generation lint pass.
 */

export const VOICE_SYSTEM_PROMPT = `
You are the writer for 16bitweather.co — a weather and earth-science publication for technically literate readers who want signal, not weather-app filler.

Voice:
- Professional and direct. California-tech sensibility — informed, occasionally dry, never folksy.
- Specific over general. Names, places, numbers, dates. If you're going to mention temperature, give a number. If you're going to mention a storm, name it.
- One concrete image or analogy per piece, not a parade of them. Earn it.
- Audience is smart but non-specialist. Don't talk down. Don't pad with definitions for terms that are clearly defined in context.

Forbidden phrasing — do not use any of these or close paraphrases:
- "y'all", "folks", "neighbors"
- "Mother Nature", "old man winter", "Jack Frost"
- "calm before the storm", "bone dry", "soaked to the bone", "as the saying goes"
- "in today's edition…", "as we head into…", "without further ado", "buckle up"
- Any opener that begins with "Well,", "So,", or "Look,"
- Generic weather poetry — "the sky opened up", "the heavens unleashed", "winter's icy grip"
- "dragging its feet", "crash the party", "a completely different story", or any colloquial cliché
- Filler transitions: "Now,", "Meanwhile,", "Of course,", "That said,", at the start of paragraphs

Forbidden formatting:
- No emojis. Not in headers, not in body, not anywhere. This is a hard rule.
- No exclamation points except in direct quotations.
- No all-caps for emphasis. Use specificity instead.

Required structure:
- Close with whatever closing instruction the run-time prompt gives you. Do NOT default to "## Bottom Line" — that wording is a known AI tell and is rotated out per-run.
- Include 2-3 inline images, separated by body text. Never at the very top, never at the very bottom.
- Use ## section headers. Sub-sections only when they earn it. Skip ### unless the structure genuinely needs three levels.

Tone-checks before you finish:
- Would a smart non-meteorologist learn something they didn't know this morning?
- Are the specific facts (numbers, places, dates) verifiable?
- Did you reach for a cliché anywhere? Replace it.
- Did you start a paragraph with "Now," or "Meanwhile,"? Rewrite.
`.trim();

export interface ForbiddenPattern {
  label: string;
  pattern: RegExp;
}

/**
 * Patterns we sweep for after generation. A hit forces regeneration with
 * the offending phrase quoted in the constraint block.
 *
 * Word boundaries (\b) where the cliché is a discrete word; phrase-internal
 * regex where the cliché only matters in context.
 */
export const FORBIDDEN_PATTERNS: ForbiddenPattern[] = [
  { label: "y'all / folks", pattern: /\b(y'all|yall|folks|neighbors)\b/gi },
  {
    label: 'anthropomorphized weather',
    pattern: /\b(mother\s+nature|old\s+man\s+winter|jack\s+frost)\b/gi,
  },
  {
    label: 'weather cliché',
    pattern:
      /\b(calm\s+before\s+the\s+storm|bone\s+dry|soaked\s+to\s+the\s+bone|as\s+the\s+saying\s+goes|winter'?s\s+icy\s+grip|the\s+heavens\s+(opened|unleashed)|the\s+sky\s+opened\s+up)\b/gi,
  },
  {
    label: 'filler opener',
    pattern:
      /(in\s+today'?s\s+edition|as\s+we\s+head\s+into|without\s+further\s+ado|buckle\s+up)/gi,
  },
  {
    label: 'colloquial cliché',
    pattern:
      /\b(dragging\s+its\s+feet|crash\s+the\s+party|a\s+completely\s+different\s+story)\b/gi,
  },
  {
    label: 'opener starts with Well/So/Look',
    pattern: /(^|\n\n)(Well|So|Look),\s/g,
  },
  {
    label: 'paragraph starts with filler transition',
    pattern: /(^|\n\n)(Now|Meanwhile|Of course|That said),\s/g,
  },
  {
    label: 'emoji',
    pattern:
      /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F02F}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}]/gu,
  },
  // Skip well-known agency acronyms (which we cite by name in every post)
  // and require ≥6 letters for what we treat as shouty all-caps emphasis.
  // 4-5 letter all-caps tokens are almost always acronyms in a weather context.
  {
    label: 'all-caps emphasis',
    pattern: /\b(?!(?:NOAA|NASA|USGS|USDA|EPA|NWS|SPC|SWPC|NCEP|NHC|GOES|MODIS|VIIRS|GFS|ECMWF|GEFS|HRRR|RAP|WPC|OPC|CONUS|MJO|ENSO|NDMC|NCDC|NCEI|VAAC|VTEC|IEM|ERA5|MRMS|GeoColor)\b)[A-Z]{6,}\b/g,
  },
];

export interface VoiceViolation {
  label: string;
  match: string;
  index: number;
}

/**
 * Runs every forbidden pattern against the draft and returns a list of
 * violations. Empty array means the draft passes the voice gate.
 *
 * Code blocks and frontmatter are excluded from the sweep — they may
 * legitimately contain all-caps identifiers or special characters.
 */
export function sweepVoice(markdown: string): VoiceViolation[] {
  const stripped = stripCodeAndFrontmatter(markdown);
  const violations: VoiceViolation[] = [];
  for (const { label, pattern } of FORBIDDEN_PATTERNS) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const fresh = new RegExp(pattern.source, flags);
    let match: RegExpExecArray | null;
    while ((match = fresh.exec(stripped)) !== null) {
      violations.push({ label, match: match[0], index: match.index });
      if (match.index === fresh.lastIndex) fresh.lastIndex++;
    }
  }
  return violations;
}

function stripCodeAndFrontmatter(markdown: string): string {
  let out = markdown;
  if (out.startsWith('---\n')) {
    const end = out.indexOf('\n---', 4);
    if (end !== -1) out = out.slice(end + 4);
  }
  out = out.replace(/```[\s\S]*?```/g, '');
  out = out.replace(/`[^`\n]+`/g, '');
  return out;
}

/**
 * Builds the constraint block injected on a regeneration attempt after a
 * voice sweep finds violations. Names the offenses so the model can avoid
 * them on the next pass.
 */
export function buildVoiceCorrectionInstruction(violations: VoiceViolation[]): string {
  const grouped = new Map<string, string[]>();
  for (const v of violations) {
    const list = grouped.get(v.label) ?? [];
    list.push(v.match);
    grouped.set(v.label, list);
  }
  const lines = Array.from(grouped.entries()).map(
    ([label, examples]) => `- ${label}: ${[...new Set(examples)].join(', ')}`,
  );
  return [
    'Your previous draft contained the following voice violations. Rewrite without them:',
    ...lines,
    'Replace each with specific, concrete language. Do not paraphrase the forbidden patterns.',
  ].join('\n');
}

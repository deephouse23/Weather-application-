import {
  sweepVoice,
  buildVoiceCorrectionInstruction,
  FORBIDDEN_PATTERNS,
  VOICE_SYSTEM_PROMPT,
} from '../../scripts/newsletter/voice';

describe('sweepVoice', () => {
  it('returns empty for clean professional prose', () => {
    const draft = `# Sunday Outlook

The polar jet sagged south of 40°N this week, dropping freezing levels across the northern Plains by roughly 4,000 feet. Iowa stations recorded temperatures 9°F below the climatological mean.

The pattern relaxes by Wednesday as a Pacific ridge rebuilds.

## What to Watch

- Cold persists through Tuesday across the upper Midwest.
- Severe risk shifts to the Gulf Coast late week.`;
    expect(sweepVoice(draft)).toEqual([]);
  });

  it("catches y'all and folksy collective nouns", () => {
    const draft = `Hey y'all, the storm is rolling in. Folks should stay inside.`;
    const violations = sweepVoice(draft);
    const labels = violations.map((v) => v.label);
    expect(labels).toContain("y'all / folks");
    expect(violations.find((v) => v.match.toLowerCase().includes('folks'))).toBeDefined();
  });

  it('catches anthropomorphized weather', () => {
    const draft = `Mother Nature is angry this week. Old man winter is coming.`;
    const labels = sweepVoice(draft).map((v) => v.label);
    expect(labels).toContain('anthropomorphized weather');
  });

  it('catches weather clichés', () => {
    const samples = [
      'It was the calm before the storm.',
      'The fields were bone dry.',
      "We're soaked to the bone.",
      'The sky opened up around 3pm.',
      "Winter's icy grip held on.",
    ];
    for (const draft of samples) {
      const violations = sweepVoice(draft);
      expect(violations.length).toBeGreaterThan(0);
    }
  });

  it('catches filler openers', () => {
    const draft = `In today's edition, we look at the jet stream. Buckle up — without further ado, here goes.`;
    const violations = sweepVoice(draft);
    const labels = new Set(violations.map((v) => v.label));
    expect(labels.has('filler opener')).toBe(true);
  });

  it('catches paragraph-start filler transitions', () => {
    const draft = `First paragraph here.\n\nMeanwhile, the storm built.\n\nNow, conditions deteriorated.`;
    const labels = sweepVoice(draft).map((v) => v.label);
    expect(labels).toContain('paragraph starts with filler transition');
  });

  it('does NOT flag mid-sentence "now" or "meanwhile"', () => {
    const draft = `The pressure is now falling rapidly. Meanwhile is a word but also a moment.`;
    // The pattern requires paragraph-start position. Mid-sentence "now" should pass.
    const violations = sweepVoice(draft).filter(
      (v) => v.label === 'paragraph starts with filler transition',
    );
    expect(violations).toEqual([]);
  });

  it('catches openers that begin with Well, So, or Look', () => {
    const drafts = [`Well, here we are.`, `So, the storm came.`, `Look, the data is clear.`];
    for (const draft of drafts) {
      const labels = sweepVoice(draft).map((v) => v.label);
      expect(labels).toContain('opener starts with Well/So/Look');
    }
  });

  it('catches emojis across multiple unicode ranges', () => {
    const samples = ['Storm watch ⛈️', 'Hot ☀️ today', 'Wind 🌬 incoming', 'Rocket 🚀 launch'];
    for (const draft of samples) {
      const labels = sweepVoice(draft).map((v) => v.label);
      expect(labels).toContain('emoji');
    }
  });

  it('catches all-caps emphasis but not short acronyms', () => {
    const flagged = sweepVoice('The system is COMPLETELY unprecedented.');
    expect(flagged.find((v) => v.label === 'all-caps emphasis')).toBeDefined();

    const acronyms = sweepVoice('NWS issued a tornado watch over OK and TX.');
    const allCapsHits = acronyms.filter((v) => v.label === 'all-caps emphasis');
    expect(allCapsHits).toEqual([]);
  });

  it('ignores content inside code fences', () => {
    const draft = '```\ny\'all should not flag here\nMother Nature inside code\n```\n\nClean prose follows.';
    expect(sweepVoice(draft)).toEqual([]);
  });

  it('ignores content in YAML frontmatter', () => {
    const draft = `---
title: y'all are here
summary: Mother Nature stuff
---

Clean prose only.`;
    expect(sweepVoice(draft)).toEqual([]);
  });

  it('catches colloquial clichés', () => {
    const draft = `The system is dragging its feet across Texas. The heat dome will crash the party Saturday.`;
    const labels = sweepVoice(draft).map((v) => v.label);
    expect(labels).toContain('colloquial cliché');
  });
});

describe('buildVoiceCorrectionInstruction', () => {
  it('groups violations by label and lists examples', () => {
    const violations = [
      { label: "y'all / folks", match: "y'all", index: 0 },
      { label: "y'all / folks", match: 'folks', index: 20 },
      { label: 'emoji', match: '⛈', index: 50 },
    ];
    const instruction = buildVoiceCorrectionInstruction(violations);
    expect(instruction).toMatch(/y'all \/ folks: y'all, folks/);
    expect(instruction).toMatch(/emoji: ⛈/);
    expect(instruction).toMatch(/Rewrite without them/);
  });

  it('deduplicates examples within a label', () => {
    const violations = [
      { label: "y'all / folks", match: "y'all", index: 0 },
      { label: "y'all / folks", match: "y'all", index: 30 },
    ];
    const instruction = buildVoiceCorrectionInstruction(violations);
    // The label itself contains "y'all", so we check the example list (after the colon) only.
    const labelLine = instruction.split('\n').find((l) => l.startsWith("- y'all / folks: "));
    expect(labelLine).toBeDefined();
    const examples = labelLine!.replace("- y'all / folks: ", '').split(', ');
    expect(examples).toEqual(["y'all"]);
  });
});

describe('VOICE_SYSTEM_PROMPT', () => {
  it('mentions the no-emoji rule', () => {
    expect(VOICE_SYSTEM_PROMPT).toMatch(/no\s+emoji|no emojis/i);
  });

  it('warns against defaulting to "## Bottom Line"', () => {
    // The closer is rotated per-run via scripts/newsletter/closers.ts; the
    // voice spec explicitly tells the model NOT to fall back to "Bottom Line".
    expect(VOICE_SYSTEM_PROMPT).toMatch(/Bottom Line/);
    expect(VOICE_SYSTEM_PROMPT).toMatch(/rotated out|do not default/i);
  });

  it('mentions the 2-3 image requirement', () => {
    expect(VOICE_SYSTEM_PROMPT).toMatch(/2-3\s+inline\s+images/);
  });
});

describe('FORBIDDEN_PATTERNS', () => {
  it('exports a non-empty list', () => {
    expect(FORBIDDEN_PATTERNS.length).toBeGreaterThan(5);
  });

  it('every pattern has a label and a regex', () => {
    for (const fp of FORBIDDEN_PATTERNS) {
      expect(typeof fp.label).toBe('string');
      expect(fp.pattern).toBeInstanceOf(RegExp);
    }
  });
});

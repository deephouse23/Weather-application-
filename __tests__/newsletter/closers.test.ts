import { pickCloser } from '../../scripts/newsletter/closers';

describe('pickCloser', () => {
  it('returns a CloserChoice with stable id and instruction', () => {
    const choice = pickCloser(new Date('2026-04-29T12:00:00Z'));
    expect(typeof choice.id).toBe('string');
    expect(choice.id.length).toBeGreaterThan(0);
    expect(typeof choice.instruction).toBe('string');
    expect(choice.instruction.length).toBeGreaterThan(20);
  });

  it('produces distinct closers for Wed and Sun in the same week', () => {
    // April 29 is Wednesday, May 3 is Sunday — 4 days apart.
    // With an 8-element rotation, Wed=N and Sun=N+4 always differ.
    const wed = pickCloser(new Date('2026-04-29T12:00:00Z'));
    const sun = pickCloser(new Date('2026-05-03T12:00:00Z'));
    expect(wed.id).not.toBe(sun.id);
  });

  it('cycles through every closer over the year', () => {
    const seen = new Set<string>();
    for (let day = 0; day < 16; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day, 12, 0, 0));
      seen.add(pickCloser(date).id);
    }
    // 8 entries in the rotation; 16 sample days should hit all of them.
    expect(seen.size).toBe(8);
  });

  it('drops the labeled section once per cycle (natural wrap-up)', () => {
    // Find a date where the rotation lands on the null slot — the
    // 8th entry. Day-of-year 7 (Jan 8) modulo 8 → index 7.
    const choice = pickCloser(new Date('2026-01-08T12:00:00Z'));
    expect(choice.header).toBeNull();
    expect(choice.id).toBe('natural-wrapup');
    expect(choice.instruction).toMatch(/natural wrap-up|closing paragraph/i);
  });

  it('never returns "Bottom Line"', () => {
    const seen = new Set<string>();
    for (let day = 0; day < 8; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day, 12, 0, 0));
      const c = pickCloser(date);
      seen.add(c.header ?? 'null');
      expect(c.header).not.toBe('Bottom Line');
    }
  });
});

/**
 * Tests for the editorial spotlight injection in the weekly blog generator.
 *
 * The spotlight is a time-boxed instruction that gets appended to the blog
 * generation prompt so we can highlight current events (e.g. a super El Niño
 * pattern) without permanently changing the topic rotation. It must auto-expire
 * by date so stale angles do not bleed into future posts.
 */

import { getSpotlight } from '../scripts/blog-spotlight'

describe('getSpotlight', () => {
  const RealDate = Date

  afterEach(() => {
    global.Date = RealDate
  })

  function freezeDate(iso: string) {
    const fixed = new RealDate(iso)
    class MockDate extends RealDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        if (args.length === 0) {
          super(fixed.getTime())
          return
        }
        super(...args)
      }
      static now() {
        return fixed.getTime()
      }
    }
    global.Date = MockDate as DateConstructor
  }

  it('returns the super El Niño spotlight during the 2026-04-12 Sunday run', () => {
    freezeDate('2026-04-12T12:00:00Z')
    const spotlight = getSpotlight()
    expect(spotlight).not.toBeNull()
    expect(spotlight).toMatch(/super El Niño/i)
  })

  it('returns null before the Sunday window opens', () => {
    freezeDate('2026-04-11T23:59:59Z')
    expect(getSpotlight()).toBeNull()
  })

  it('returns null after the Sunday window closes', () => {
    freezeDate('2026-04-13T00:00:00Z')
    expect(getSpotlight()).toBeNull()
  })
})

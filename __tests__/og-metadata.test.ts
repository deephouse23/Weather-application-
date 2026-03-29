/**
 * Tests for Open Graph metadata configuration
 * Ensures OG images point to valid dynamic endpoints, not missing static files
 */

import { metadata } from '@/app/layout'

describe('Root layout OG metadata', () => {
  it('should not reference non-existent og-image.png in twitter images', () => {
    const twitterImages = metadata.twitter && 'images' in metadata.twitter
      ? metadata.twitter.images
      : []
    const imageStr = JSON.stringify(twitterImages)
    expect(imageStr).not.toContain('og-image.png')
    expect(imageStr).toContain('/api/og')
  })
})

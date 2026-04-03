/**
 * Tests for SEO indexing fixes to resolve "Discovered - currently not indexed" in GSC.
 */

import fs from 'fs'
import path from 'path'

describe('SEO Indexing Fixes', () => {
  it('robots.txt should not contain Crawl-delay directives', () => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt')
    const content = fs.readFileSync(robotsPath, 'utf-8')

    expect(content.toLowerCase()).not.toContain('crawl-delay')
  })

  it('robots.txt should explicitly allow key indexable sections', () => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt')
    const content = fs.readFileSync(robotsPath, 'utf-8')

    const requiredAllows = ['/blog', '/news', '/education', '/games', '/aviation', '/weather/']
    for (const route of requiredAllows) {
      expect(content).toContain(`Allow: ${route}`)
    }
  })

  it('page-wrapper should contain a footer with internal links to key sections', () => {
    const wrapperPath = path.join(process.cwd(), 'components', 'page-wrapper.tsx')
    const content = fs.readFileSync(wrapperPath, 'utf-8')

    expect(content).toContain('<footer')
    const requiredLinks = ['/radar', '/severe', '/aviation', '/education', '/blog', '/news', '/games', '/about']
    for (const link of requiredLinks) {
      expect(content).toContain(`href="${link}"`)
    }
  })

  it('sitemap should not include /ai route', async () => {
    const { default: sitemap } = await import('../app/sitemap')
    const entries = sitemap()
    const paths = entries.map((e: { url: string }) => {
      try { return new URL(e.url).pathname } catch { return e.url }
    })

    expect(paths).not.toContain('/ai')
  })

  it('sitemap should have fewer than 80 URLs to focus crawl budget', async () => {
    const { default: sitemap } = await import('../app/sitemap')
    const entries = sitemap()

    expect(entries.length).toBeLessThan(80)
  })

  it('city pages should use ISR revalidate instead of force-dynamic', () => {
    const pagePath = path.join(process.cwd(), 'app', 'weather', '[city]', 'page.tsx')
    const content = fs.readFileSync(pagePath, 'utf-8')

    expect(content).toContain('revalidate')
    expect(content).not.toContain("dynamic = 'force-dynamic'")
  })
})

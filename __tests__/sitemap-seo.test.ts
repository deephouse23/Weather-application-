/**
 * SEO tests for sitemap generation and next.config redirect rules.
 */

describe('Sitemap SEO', () => {
  it('next.config should not redirect /sitemap.xml (breaks Next.js built-in sitemap)', async () => {
    const configModule = await import('../next.config.mjs')
    const nextConfig = configModule.default

    const redirects = typeof nextConfig.redirects === 'function'
      ? await nextConfig.redirects()
      : nextConfig.redirects || []

    const sitemapRedirect = redirects.find(
      (r: { source: string }) => r.source === '/sitemap.xml'
    )
    expect(sitemapRedirect).toBeUndefined()
  })

  it('sitemap should not include URLs that permanently redirect', async () => {
    const configModule = await import('../next.config.mjs')
    const nextConfig = configModule.default

    const redirects = typeof nextConfig.redirects === 'function'
      ? await nextConfig.redirects()
      : nextConfig.redirects || []

    const permanentRedirectSources = redirects
      .filter((r: { permanent: boolean }) => r.permanent)
      .map((r: { source: string }) => r.source)

    const { default: sitemap } = await import('../app/sitemap')
    const entries = sitemap()
    const sitemapPaths = entries.map((e: { url: string }) => {
      try { return new URL(e.url).pathname } catch { return e.url }
    })

    for (const redirectSource of permanentRedirectSources) {
      expect(sitemapPaths).not.toContain(redirectSource)
    }
  })
})

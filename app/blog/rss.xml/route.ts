import { getAllPosts } from '@/lib/blog'

export async function GET() {
  const posts = getAllPosts()
  const siteUrl = 'https://www.16bitweather.co'

  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${encodeURIComponent(post.slug)}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${encodeURIComponent(post.slug)}</guid>
      <description><![CDATA[${post.summary}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author><![CDATA[16bitbot@16bitweather.co (${post.author})]]></author>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
    </item>`).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>16 Bit Weather Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Weekly weather intelligence from 16bitbot. Space weather, severe weather, phenomena, and records.</description>
    <language>en-us</language>
    <lastBuildDate>${posts.length > 0 ? new Date(posts[0].date).toUTCString() : new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  })
}

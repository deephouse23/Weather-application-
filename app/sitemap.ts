import { MetadataRoute } from 'next'
import { cityData as cityMetadata } from '@/lib/city-metadata'
import { getAllPosts } from '@/lib/blog'
import { createServerSupabaseClient } from '@/lib/supabase/server'

async function getGameSlugs(): Promise<string[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('games')
      .select('slug')
      .eq('is_active', true)
    return (data || []).map((g: { slug: string }) => g.slug)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.16bitweather.co'
  
  try {
    const staticPages: MetadataRoute.Sitemap = [
      // Core
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      
      // Weather tools (high value, frequently updated)
      { url: `${baseUrl}/radar`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
      { url: `${baseUrl}/severe`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
      { url: `${baseUrl}/space-weather`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
      { url: `${baseUrl}/tropical`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/aviation`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
      { url: `${baseUrl}/travel`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/winter`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
      { url: `${baseUrl}/extremes`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
      { url: `${baseUrl}/earth-sciences`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
      { url: `${baseUrl}/hourly`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.7 },
      { url: `${baseUrl}/situation`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
      { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },

      // Content and education
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
      { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/education`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${baseUrl}/cloud-types`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/weather-systems`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/fun-facts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${baseUrl}/education/glossary`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
      
      // Interactive
      { url: `${baseUrl}/games`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ]
  
    // Dynamic city pages
    const cityPages: MetadataRoute.Sitemap = Object.keys(cityMetadata || {}).map(citySlug => ({
      url: `${baseUrl}/weather/${citySlug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    }))
    
    // Dynamic blog posts
    let blogPosts: MetadataRoute.Sitemap = []
    try {
      blogPosts = getAllPosts().map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    } catch {
      console.error('[sitemap] Failed to load blog posts')
    }

    // Dynamic game pages
    const gameSlugs = await getGameSlugs()
    const gamePages: MetadataRoute.Sitemap = gameSlugs.map(slug => ({
      url: `${baseUrl}/games/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...cityPages, ...blogPosts, ...gamePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
      { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    ]
  }
}

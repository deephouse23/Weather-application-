import { MetadataRoute } from 'next'
import { CITY_DATA } from '@/lib/city-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.16bitweather.co'
  
  try {
    // Static pages with their priorities and change frequencies
    const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cloud-types`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/weather-systems`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/fun-facts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/extremes`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ]
  
    // Dynamic city pages - generated from CITY_DATA keys
    const cityPages: MetadataRoute.Sitemap = Object.keys(CITY_DATA || {}).map(citySlug => ({
      url: `${baseUrl}/weather/${citySlug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    }))
    
    // Combine all pages
    return [...staticPages, ...cityPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return minimal sitemap with just static pages if city data fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
    ]
  }
}

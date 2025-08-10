import { MetadataRoute } from 'next'
import { ALL_CITIES } from '@/components/random-city-links'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.16bitweather.co'
  
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
  
  // Dynamic city pages - generated from ALL_CITIES
  const cityPages: MetadataRoute.Sitemap = ALL_CITIES.map(city => ({
    url: `${baseUrl}/weather/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  }))
  
  // Combine all pages
  return [...staticPages, ...cityPages]
}

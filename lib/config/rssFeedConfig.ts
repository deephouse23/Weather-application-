/**
 * 16-Bit Weather Platform - RSS Feed Configuration
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Centralized configuration for all RSS feeds used in news aggregation
 */

import type { RSSFeedConfig } from '@/lib/types/rssFeed';

/**
 * RSS Feed Configuration Array
 * Organized by category: Weather, Space, Science
 */
export const RSS_FEEDS: RSSFeedConfig[] = [
  // ===== WEATHER FEEDS =====
  
  // NOAA/NWS Sources
  {
    id: 'noaa-alerts',
    name: 'NOAA Weather Alerts',
    url: 'https://alerts.weather.gov/cap/us.php?x=0',
    category: ['alerts', 'breaking'],
    enabled: true,
    priority: 10,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    maxAge: 24,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'noaa',
  },
  {
    id: 'spc-outlook',
    name: 'Storm Prediction Center Outlook',
    url: 'https://www.spc.noaa.gov/products/rss/',
    category: ['weather', 'severe'],
    enabled: true,
    priority: 9,
    cacheDuration: 10 * 60 * 1000, // 10 minutes
    maxAge: 24,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'spc',
  },
  {
    id: 'nhc-atlantic',
    name: 'National Hurricane Center - Atlantic',
    url: 'https://www.nhc.noaa.gov/index-at.xml',
    category: ['tropical', 'alerts', 'breaking'],
    enabled: true,
    priority: 10,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    maxAge: 72,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nhc',
  },
  {
    id: 'nhc-pacific',
    name: 'National Hurricane Center - Eastern Pacific',
    url: 'https://www.nhc.noaa.gov/index-ep.xml',
    category: ['tropical', 'alerts', 'breaking'],
    enabled: true,
    priority: 10,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    maxAge: 72,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nhc',
  },
  {
    id: 'noaa-climate',
    name: 'NOAA Climate.gov News',
    url: 'https://www.climate.gov/feeds/news',
    category: ['climate', 'weather'],
    enabled: true,
    priority: 7,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'noaa',
  },
  {
    id: 'noaa-ncei',
    name: 'NOAA NCEI News',
    url: 'https://www.ncei.noaa.gov/news/rss',
    category: ['climate', 'weather'],
    enabled: true,
    priority: 6,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'noaa',
  },

  // International Weather Agencies
  {
    id: 'metoffice-uk',
    name: 'UK Met Office Weather',
    url: 'https://www.metoffice.gov.uk/public/weather/rss',
    category: ['weather', 'local'],
    enabled: true,
    priority: 5,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 48,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'metoffice',
  },
  {
    id: 'bom-australia',
    name: 'Australia Bureau of Meteorology',
    url: 'https://www.bom.gov.au/rss/',
    category: ['weather', 'local'],
    enabled: true,
    priority: 5,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 48,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'bom',
  },

  // ===== SPACE & EARTH SCIENCE FEEDS =====
  
  // NASA Feeds
  {
    id: 'nasa-breaking',
    name: 'NASA Breaking News',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    category: ['space', 'breaking'],
    enabled: true,
    priority: 8,
    cacheDuration: 10 * 60 * 1000, // 10 minutes
    maxAge: 72,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nasa',
  },
  {
    id: 'nasa-image-day',
    name: 'NASA Image of the Day',
    url: 'https://www.nasa.gov/rss/dyn/image_of_the_day.rss',
    category: ['space', 'astronomy'],
    enabled: true,
    priority: 7,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nasa',
  },
  {
    id: 'nasa-earth',
    name: 'NASA Earth News',
    url: 'https://www.nasa.gov/rss/dyn/earth.rss',
    category: ['space', 'weather', 'climate'],
    enabled: true,
    priority: 7,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nasa',
  },
  {
    id: 'nasa-solar-system',
    name: 'NASA Solar System',
    url: 'https://www.nasa.gov/rss/dyn/solar_system.rss',
    category: ['space', 'astronomy'],
    enabled: true,
    priority: 6,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nasa',
  },
  {
    id: 'nasa-universe',
    name: 'NASA Universe',
    url: 'https://www.nasa.gov/rss/dyn/universe.rss',
    category: ['space', 'astronomy'],
    enabled: true,
    priority: 6,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nasa',
  },
  {
    id: 'nasa-earth-observatory',
    name: 'NASA Earth Observatory',
    url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss',
    category: ['space', 'weather', 'climate'],
    enabled: true,
    priority: 7,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nasa',
  },
  {
    id: 'nasa-natural-hazards',
    name: 'NASA Natural Hazards',
    url: 'https://earthobservatory.nasa.gov/feeds/natural-hazards.rss',
    category: ['weather', 'breaking', 'severe'],
    enabled: true,
    priority: 8,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 72,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'nasa',
  },
  {
    id: 'nasa-jpl',
    name: 'NASA JPL News',
    url: 'https://www.jpl.nasa.gov/rss/news.xml',
    category: ['space', 'astronomy'],
    enabled: true,
    priority: 7,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'jpl',
  },

  // Space Weather
  {
    id: 'swpc-noaa',
    name: 'NOAA Space Weather Prediction Center',
    url: 'https://www.swpc.noaa.gov/products/rss',
    category: ['space-weather', 'space'],
    enabled: true,
    priority: 8,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 72,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'swpc',
  },

  // Space Agencies
  {
    id: 'esa-main',
    name: 'European Space Agency',
    url: 'https://www.esa.int/rssfeed/ESA',
    category: ['space', 'astronomy'],
    enabled: true,
    priority: 6,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'esa',
  },
  {
    id: 'esa-space-science',
    name: 'ESA Space Science',
    url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science',
    category: ['space', 'astronomy'],
    enabled: true,
    priority: 6,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'esa',
  },

  // Space News Sites
  {
    id: 'spacecom-all',
    name: 'Space.com',
    url: 'https://www.space.com/feeds/all',
    category: ['space', 'astronomy'],
    enabled: true,
    priority: 5,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 72,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'spacecom',
  },
  {
    id: 'spacenews',
    name: 'SpaceNews.com',
    url: 'https://spacenews.com/feed/',
    category: ['space', 'breaking'],
    enabled: true,
    priority: 5,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 72,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'spacenews',
  },
  {
    id: 'spaceflightnow',
    name: 'Spaceflight Now',
    url: 'https://www.spaceflightnow.com/feed/',
    category: ['space', 'breaking'],
    enabled: true,
    priority: 5,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxAge: 72,
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'spaceflightnow',
  },

  // ===== SCIENCE & TECH FEEDS =====
  
  {
    id: 'physorg-earth-space',
    name: 'Phys.org Earth/Space',
    url: 'https://phys.org/rss-feed/space-news/earth/',
    category: ['space', 'climate', 'weather'],
    enabled: true,
    priority: 4,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'physorg',
  },
  {
    id: 'sciencedaily-weather',
    name: 'ScienceDaily Weather/Climate',
    url: 'https://www.sciencedaily.com/rss/earth_climate/weather.xml',
    category: ['weather', 'climate'],
    enabled: true,
    priority: 4,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'sciencedaily',
  },
  {
    id: 'arstechnica-science',
    name: 'Ars Technica Science',
    url: 'https://arstechnica.com/science/feed/',
    category: ['space', 'general'],
    enabled: true,
    priority: 4,
    cacheDuration: 60 * 60 * 1000, // 1 hour
    maxAge: 168, // 7 days
    retryAttempts: 3,
    retryDelay: 5000,
    errorCount: 0,
    sourceId: 'arstechnica',
  },
];

/**
 * Get enabled feeds by category
 */
export function getFeedsByCategory(category: string): RSSFeedConfig[] {
  return RSS_FEEDS.filter(
    (feed) => feed.enabled && feed.category.includes(category as any)
  );
}

/**
 * Get feed by ID
 */
export function getFeedById(id: string): RSSFeedConfig | undefined {
  return RSS_FEEDS.find((feed) => feed.id === id);
}

/**
 * Get all enabled feeds
 */
export function getEnabledFeeds(): RSSFeedConfig[] {
  return RSS_FEEDS.filter((feed) => feed.enabled);
}

/**
 * Get feeds sorted by priority
 */
export function getFeedsByPriority(): RSSFeedConfig[] {
  return [...RSS_FEEDS].sort((a, b) => b.priority - a.priority);
}



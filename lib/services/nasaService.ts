/**
 * 16-Bit Weather Platform - NASA Earth Observatory Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches weather and climate news from NASA Earth Observatory
 */

import { fetchAndParseRSS, type ParsedFeedItem } from './rssParser';
import { NewsItem } from '@/components/NewsTicker/NewsTicker';

// NASA Earth Observatory RSS feeds
const NASA_RSS_FEEDS = {
  all: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss',
  imageOfDay: 'https://earthobservatory.nasa.gov/feeds/image-of-the-day.rss',
  naturalHazards: 'https://earthobservatory.nasa.gov/feeds/natural-hazards.rss',
};

/**
 * Fetch news from NASA Earth Observatory
 */
export async function fetchNASANews(maxItems: number = 15): Promise<NewsItem[]> {
  try {
    // Fetch from Natural Hazards feed (most relevant for weather)
    const feed = await fetchAndParseRSS(NASA_RSS_FEEDS.naturalHazards);

    const newsItems: NewsItem[] = feed.items.slice(0, maxItems).map((item) => {
      return {
        id: `nasa-${item.id}`,
        title: item.title,
        url: item.link,
        source: 'NASA Earth Observatory',
        category: categorizNASAArticle(item),
        priority: prioritizeNASAArticle(item),
        timestamp: item.pubDate,
        description: item.description,
        imageUrl: item.imageUrl,
        author: item.author,
      };
    });

    return newsItems;
  } catch (error) {
    console.error('Error fetching NASA news:', error);
    return [];
  }
}

/**
 * Fetch NASA Image of the Day (can be weather-related)
 */
export async function fetchNASAImageOfDay(): Promise<NewsItem | null> {
  try {
    const feed = await fetchAndParseRSS(NASA_RSS_FEEDS.imageOfDay);

    if (feed.items.length === 0) {
      return null;
    }

    const latestImage = feed.items[0];

    // Check if it's weather/climate related
    const isWeatherRelated = isWeatherOrClimateRelated(latestImage);

    if (!isWeatherRelated) {
      return null; // Skip non-weather images
    }

    return {
      id: `nasa-image-${latestImage.id}`,
      title: latestImage.title,
      url: latestImage.link,
      source: 'NASA Image of the Day',
      category: 'weather',
      priority: 'medium',
      timestamp: latestImage.pubDate,
      description: latestImage.description,
      imageUrl: latestImage.imageUrl,
      author: latestImage.author,
    };
  } catch (error) {
    console.error('Error fetching NASA Image of the Day:', error);
    return null;
  }
}

/**
 * Categorize NASA article based on content
 */
function categorizNASAArticle(item: ParsedFeedItem): NewsItem['category'] {
  const text = `${item.title} ${item.description || ''}`.toLowerCase();

  // Check for weather keywords
  if (
    text.includes('hurricane') ||
    text.includes('cyclone') ||
    text.includes('typhoon') ||
    text.includes('tornado') ||
    text.includes('storm') ||
    text.includes('flood') ||
    text.includes('drought') ||
    text.includes('wildfire') ||
    text.includes('blizzard') ||
    text.includes('heatwave') ||
    text.includes('precipitation')
  ) {
    return 'weather';
  }

  // Default to general for NASA content
  return 'general';
}

/**
 * Prioritize NASA article based on severity/timeliness
 */
function prioritizeNASAArticle(item: ParsedFeedItem): NewsItem['priority'] {
  const text = `${item.title} ${item.description || ''}`.toLowerCase();

  // High priority keywords
  const highPriorityKeywords = [
    'catastrophic',
    'devastating',
    'unprecedented',
    'historic',
    'record-breaking',
    'extreme',
    'severe',
    'emergency',
    'life-threatening',
  ];

  for (const keyword of highPriorityKeywords) {
    if (text.includes(keyword)) {
      return 'high';
    }
  }

  // Medium priority keywords
  const mediumPriorityKeywords = [
    'hurricane',
    'typhoon',
    'cyclone',
    'wildfire',
    'flood',
    'drought',
    'blizzard',
    'heatwave',
    'storm',
  ];

  for (const keyword of mediumPriorityKeywords) {
    if (text.includes(keyword)) {
      return 'medium';
    }
  }

  // Default to low priority (informational)
  return 'low';
}

/**
 * Check if NASA image/article is weather or climate related
 */
function isWeatherOrClimateRelated(item: ParsedFeedItem): boolean {
  const text = `${item.title} ${item.description || ''} ${item.categories?.join(' ') || ''}`.toLowerCase();

  const weatherKeywords = [
    'weather',
    'climate',
    'storm',
    'hurricane',
    'cyclone',
    'typhoon',
    'tornado',
    'precipitation',
    'rain',
    'snow',
    'drought',
    'flood',
    'wildfire',
    'fire',
    'heatwave',
    'cold',
    'temperature',
    'atmosphere',
    'cloud',
    'wind',
    'moisture',
    'ice',
    'glacier',
    'sea ice',
    'ocean temperature',
    'el niño',
    'la niña',
    'monsoon',
    'lightning',
    'thunder',
    'blizzard',
  ];

  for (const keyword of weatherKeywords) {
    if (text.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Fetch all NASA weather/climate content
 */
export async function fetchAllNASAWeatherNews(maxItems: number = 20): Promise<NewsItem[]> {
  try {
    const [naturalHazards, imageOfDay] = await Promise.allSettled([
      fetchNASANews(maxItems),
      fetchNASAImageOfDay(),
    ]);

    const allNews: NewsItem[] = [];

    if (naturalHazards.status === 'fulfilled') {
      allNews.push(...naturalHazards.value);
    }

    if (imageOfDay.status === 'fulfilled' && imageOfDay.value) {
      allNews.push(imageOfDay.value);
    }

    // Sort by timestamp (newest first)
    allNews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return allNews.slice(0, maxItems);
  } catch (error) {
    console.error('Error fetching all NASA weather news:', error);
    return [];
  }
}

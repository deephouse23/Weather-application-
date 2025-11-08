/**
 * 16-Bit Weather Platform - FOX Weather RSS Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches breaking weather news from FOX Weather RSS feeds
 */

import { fetchAndParseRSS, type ParsedFeedItem } from './rssParser';
import { NewsItem } from '@/components/NewsTicker/NewsTicker';

// FOX Weather RSS feeds
const FOX_WEATHER_RSS_FEEDS = {
  latest: 'https://www.foxweather.com/feeds/public/latest.rss',
  extremeWeather: 'https://www.foxweather.com/feeds/public/extreme-weather.rss',
  weatherNews: 'https://www.foxweather.com/feeds/public/weather-news.rss',
};

/**
 * Fetch latest headlines from FOX Weather
 */
export async function fetchFOXWeatherNews(
  feed: keyof typeof FOX_WEATHER_RSS_FEEDS = 'latest',
  maxItems: number = 15
): Promise<NewsItem[]> {
  try {
    const feedUrl = FOX_WEATHER_RSS_FEEDS[feed];
    const parsedFeed = await fetchAndParseRSS(feedUrl);

    const newsItems: NewsItem[] = parsedFeed.items.slice(0, maxItems).map((item) => {
      return {
        id: `fox-${feed}-${item.id}`,
        title: item.title,
        url: item.link,
        source: 'FOX Weather',
        category: categorizeFOXArticle(item),
        priority: prioritizeFOXArticle(item, feed),
        timestamp: item.pubDate,
        description: item.description,
        imageUrl: item.imageUrl,
        author: item.author,
      };
    });

    return newsItems;
  } catch (error) {
    // Only log errors in development mode to reduce noise in tests/production
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error fetching FOX Weather ${feed} feed:`, error);
    }
    return [];
  }
}

/**
 * Fetch all FOX Weather feeds
 */
export async function fetchAllFOXWeatherNews(maxItems: number = 30): Promise<NewsItem[]> {
  try {
    const [latest, extreme, weatherNews] = await Promise.allSettled([
      fetchFOXWeatherNews('latest', 10),
      fetchFOXWeatherNews('extremeWeather', 10),
      fetchFOXWeatherNews('weatherNews', 10),
    ]);

    const allNews: NewsItem[] = [];

    if (latest.status === 'fulfilled') {
      allNews.push(...latest.value);
    }

    if (extreme.status === 'fulfilled') {
      allNews.push(...extreme.value);
    }

    if (weatherNews.status === 'fulfilled') {
      allNews.push(...weatherNews.value);
    }

    // Deduplicate by title (case-insensitive)
    const seen = new Map<string, NewsItem>();
    allNews.forEach((item) => {
      const key = item.title.toLowerCase().substring(0, 50);
      if (!seen.has(key)) {
        seen.set(key, item);
      }
    });

    const uniqueNews = Array.from(seen.values());

    // Sort by timestamp (newest first)
    uniqueNews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return uniqueNews.slice(0, maxItems);
  } catch (error) {
    // Only log errors in development mode to reduce noise in tests/production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching all FOX Weather news:', error);
    }
    return [];
  }
}

/**
 * Categorize FOX Weather article based on content
 */
function categorizeFOXArticle(item: ParsedFeedItem): NewsItem['category'] {
  const text = `${item.title} ${item.description || ''}`.toLowerCase();

  // Check for severe weather keywords
  if (
    text.includes('hurricane') ||
    text.includes('tornado') ||
    text.includes('severe storm') ||
    text.includes('blizzard') ||
    text.includes('flood') ||
    text.includes('wildfire') ||
    text.includes('extreme weather')
  ) {
    return 'weather';
  }

  // Check for local/regional content
  if (
    text.includes('forecast') ||
    text.includes('your area') ||
    text.includes('local weather')
  ) {
    return 'local';
  }

  // Default to general weather
  return 'weather';
}

/**
 * Prioritize FOX Weather article based on severity and feed type
 */
function prioritizeFOXArticle(
  item: ParsedFeedItem,
  feed: keyof typeof FOX_WEATHER_RSS_FEEDS
): NewsItem['priority'] {
  const text = `${item.title} ${item.description || ''}`.toLowerCase();

  // Extreme weather feed items are automatically medium-high priority
  if (feed === 'extremeWeather') {
    // Check for high severity keywords
    const highSeverityKeywords = [
      'catastrophic',
      'life-threatening',
      'emergency',
      'evacuation',
      'disaster',
      'unprecedented',
      'historic',
      'record-breaking',
      'extreme',
    ];

    for (const keyword of highSeverityKeywords) {
      if (text.includes(keyword)) {
        return 'high';
      }
    }

    return 'medium'; // Default for extreme weather feed
  }

  // Check for high priority keywords in other feeds
  const highPriorityKeywords = [
    'breaking',
    'urgent',
    'emergency',
    'catastrophic',
    'life-threatening',
    'major hurricane',
    'tornado warning',
    'flash flood warning',
  ];

  for (const keyword of highPriorityKeywords) {
    if (text.includes(keyword)) {
      return 'high';
    }
  }

  // Check for medium priority keywords
  const mediumPriorityKeywords = [
    'watch',
    'warning',
    'advisory',
    'alert',
    'severe',
    'tropical storm',
    'winter storm',
    'heat wave',
    'cold snap',
  ];

  for (const keyword of mediumPriorityKeywords) {
    if (text.includes(keyword)) {
      return 'medium';
    }
  }

  // Default to low priority (general news)
  return 'low';
}

/**
 * Fetch only breaking/severe weather from FOX
 */
export async function fetchFOXBreakingWeather(maxItems: number = 10): Promise<NewsItem[]> {
  try {
    const extremeWeather = await fetchFOXWeatherNews('extremeWeather', maxItems);

    // Filter for only high and medium priority
    const breakingNews = extremeWeather.filter(
      (item) => item.priority === 'high' || item.priority === 'medium'
    );

    return breakingNews;
  } catch (error) {
    // Only log errors in development mode to reduce noise in tests/production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching FOX breaking weather:', error);
    }
    return [];
  }
}

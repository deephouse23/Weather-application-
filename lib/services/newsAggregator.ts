/**
 * 16-Bit Weather Platform - News Aggregator Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Aggregates weather news from multiple sources with intelligent deduplication
 */

import { NewsItem } from '@/components/NewsTicker/NewsTicker';
import { newsService } from './newsService'; // Existing NOAA + NewsAPI service
import { fetchAllNASAWeatherNews } from './nasaService';
import { fetchAllFOXWeatherNews } from './foxWeatherService';
import { fetchAllRedditWeatherNews } from './redditService';

export interface AggregatedNewsOptions {
  categories?: ('breaking' | 'weather' | 'local' | 'general')[];
  priority?: 'high' | 'medium' | 'low' | 'all';
  sources?: ('noaa' | 'nasa' | 'fox' | 'reddit' | 'newsapi')[];
  maxItems?: number;
  maxAge?: number; // Maximum age in hours
}

export interface NewsSourceStats {
  source: string;
  fetched: number;
  included: number;
  errors: number;
}

export interface AggregatedNewsResult {
  items: NewsItem[];
  stats: NewsSourceStats[];
  totalFetched: number;
  totalIncluded: number;
  cacheHit: boolean;
}

// In-memory cache
const cache = new Map<string, { data: AggregatedNewsResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Main aggregator function - fetches from all sources
 */
export async function aggregateNews(
  options: AggregatedNewsOptions = {}
): Promise<AggregatedNewsResult> {
  const {
    categories = ['weather'],
    priority = 'all',
    sources = ['noaa', 'nasa', 'fox', 'reddit', 'newsapi'],
    maxItems = 30,
    maxAge = 72, // 72 hours default
  } = options;

  // Check cache first
  const cacheKey = JSON.stringify({ categories, priority, sources, maxItems, maxAge });
  const cached = getFromCache(cacheKey);
  if (cached) {
    return { ...cached, cacheHit: true };
  }

  const stats: NewsSourceStats[] = [];
  let allNews: NewsItem[] = [];

  // Fetch from each enabled source
  const fetchPromises: Promise<{ source: string; items: NewsItem[] }>[] = [];

  if (sources.includes('noaa')) {
    fetchPromises.push(
      fetchWithStats('NOAA', () => newsService.fetchNews(categories, maxItems))
    );
  }

  if (sources.includes('nasa')) {
    fetchPromises.push(fetchWithStats('NASA', () => fetchAllNASAWeatherNews(maxItems)));
  }

  if (sources.includes('fox')) {
    fetchPromises.push(fetchWithStats('FOX Weather', () => fetchAllFOXWeatherNews(maxItems)));
  }

  if (sources.includes('reddit')) {
    fetchPromises.push(
      fetchWithStats('Reddit', () => fetchAllRedditWeatherNews(maxItems))
    );
  }

  if (sources.includes('newsapi')) {
    // NewsAPI is already included in newsService.fetchNews
    // We could add a separate direct NewsAPI fetch here if needed
  }

  // Wait for all fetches
  const results = await Promise.allSettled(fetchPromises);

  // Collect results and stats
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { source, items } = result.value;
      allNews.push(...items);
      stats.push({
        source,
        fetched: items.length,
        included: items.length,
        errors: 0,
      });
    } else {
      console.error(`Failed to fetch from source:`, result.reason);
      stats.push({
        source: 'Unknown',
        fetched: 0,
        included: 0,
        errors: 1,
      });
    }
  });

  // Filter by max age
  const cutoffTime = Date.now() - maxAge * 60 * 60 * 1000;
  allNews = allNews.filter((item) => item.timestamp.getTime() >= cutoffTime);

  // Filter by priority
  if (priority !== 'all') {
    allNews = filterByPriority(allNews, priority);
  }

  // Deduplicate across sources
  const deduplicatedNews = deduplicateNews(allNews);

  // Sort by priority and timestamp
  const sortedNews = sortNews(deduplicatedNews);

  // Limit to maxItems
  const finalNews = sortedNews.slice(0, maxItems);

  const aggregatedResult: AggregatedNewsResult = {
    items: finalNews,
    stats,
    totalFetched: allNews.length,
    totalIncluded: finalNews.length,
    cacheHit: false,
  };

  // Cache the result
  saveToCache(cacheKey, aggregatedResult);

  return aggregatedResult;
}

/**
 * Fetch news from a source with error handling and stats
 */
async function fetchWithStats(
  sourceName: string,
  fetchFn: () => Promise<NewsItem[]>
): Promise<{ source: string; items: NewsItem[] }> {
  try {
    const items = await fetchFn();
    return { source: sourceName, items };
  } catch (error) {
    console.error(`Error fetching from ${sourceName}:`, error);
    return { source: sourceName, items: [] };
  }
}

/**
 * Deduplicate news items across sources using fuzzy title matching
 */
function deduplicateNews(news: NewsItem[]): NewsItem[] {
  const seen = new Map<string, NewsItem>();
  const titleKeys = new Set<string>();

  news.forEach((item) => {
    // Create a normalized key from title
    const titleKey = normalizeTitle(item.title);

    // Check for exact match first
    if (titleKeys.has(titleKey)) {
      return; // Skip duplicate
    }

    // Check for fuzzy duplicates (similar titles)
    let isDuplicate = false;
    for (const existingKey of titleKeys) {
      if (isSimilarTitle(titleKey, existingKey)) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      return; // Skip similar title
    }

    // Add to set
    titleKeys.add(titleKey);
    seen.set(item.id, item);
  });

  return Array.from(seen.values());
}

/**
 * Normalize title for comparison
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .substring(0, 60); // First 60 chars
}

/**
 * Check if two titles are similar (fuzzy match)
 */
function isSimilarTitle(title1: string, title2: string): boolean {
  // If titles are exactly the same
  if (title1 === title2) {
    return true;
  }

  // Calculate similarity ratio (simple word overlap)
  const words1 = new Set(title1.split(' ').filter((w) => w.length > 3));
  const words2 = new Set(title2.split(' ').filter((w) => w.length > 3));

  if (words1.size === 0 || words2.size === 0) {
    return false;
  }

  // Count overlapping words
  let overlap = 0;
  words1.forEach((word) => {
    if (words2.has(word)) {
      overlap++;
    }
  });

  // If 70%+ words overlap, consider it a duplicate
  const similarityRatio = overlap / Math.max(words1.size, words2.size);
  return similarityRatio >= 0.7;
}

/**
 * Filter news by priority level
 */
function filterByPriority(
  news: NewsItem[],
  priority: 'high' | 'medium' | 'low'
): NewsItem[] {
  if (priority === 'high') {
    return news.filter((item) => item.priority === 'high');
  }

  if (priority === 'medium') {
    return news.filter((item) => item.priority === 'high' || item.priority === 'medium');
  }

  return news.filter((item) => item.priority === priority);
}

/**
 * Sort news by priority first, then timestamp
 */
function sortNews(news: NewsItem[]): NewsItem[] {
  return news.sort((a, b) => {
    // Priority order
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // Then by timestamp (newest first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

/**
 * Get from cache
 */
function getFromCache(key: string): AggregatedNewsResult | null {
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

/**
 * Save to cache
 */
function saveToCache(key: string, data: AggregatedNewsResult): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Limit cache size (keep only 50 entries)
  if (cache.size > 50) {
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }
}

/**
 * Clear cache
 */
export function clearNewsCache(): void {
  cache.clear();
}

/**
 * Get cache stats
 */
export function getNewsCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

/**
 * Fetch only severe/breaking weather across all sources
 */
export async function fetchBreakingWeather(maxItems: number = 10): Promise<NewsItem[]> {
  const result = await aggregateNews({
    priority: 'high',
    sources: ['noaa', 'fox', 'nasa'],
    maxItems,
    maxAge: 24, // Last 24 hours only
  });

  return result.items;
}

/**
 * Fetch news by specific category
 */
export async function fetchNewsByCategory(
  category: 'breaking' | 'weather' | 'local' | 'general',
  maxItems: number = 20
): Promise<NewsItem[]> {
  const result = await aggregateNews({
    categories: [category],
    maxItems,
  });

  return result.items;
}

/**
 * Get featured story (highest priority, most recent)
 */
export async function getFeaturedStory(): Promise<NewsItem | null> {
  const result = await aggregateNews({
    priority: 'all',
    maxItems: 50,
    maxAge: 12, // Last 12 hours
  });

  if (result.items.length === 0) {
    return null;
  }

  // Return the first high-priority item with an image
  const highPriorityWithImage = result.items.find(
    (item) => item.priority === 'high' && item.imageUrl
  );

  if (highPriorityWithImage) {
    return highPriorityWithImage;
  }

  // Fallback to first high-priority item
  const highPriority = result.items.find((item) => item.priority === 'high');

  if (highPriority) {
    return highPriority;
  }

  // Fallback to first item
  return result.items[0];
}

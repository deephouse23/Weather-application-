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
import { fetchAllRedditWeatherNews } from './redditService';
import { fetchAllGFSModelNews } from './gfsModelService';
import { getEnabledFeeds, getFeedsByCategory } from '@/lib/config/rssFeedConfig';
import { createRSSFeedService } from './rssFeedService';
import type { NewsCategory } from '@/lib/types/news';

export interface AggregatedNewsOptions {
  categories?: NewsCategory[];
  priority?: 'high' | 'medium' | 'low' | 'all';
  sources?: ('noaa' | 'nasa' | 'reddit' | 'newsapi' | 'gfs' | 'rss')[];
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

// In-memory cache with tiered durations
const cache = new Map<string, { data: AggregatedNewsResult; timestamp: number; duration: number }>();

/**
 * Get cache duration based on categories
 * Tiered caching: alerts (5min), breaking (10min), general (30min), space (1hr)
 */
function getCacheDuration(categories: NewsCategory[]): number {
  if (categories.includes('alerts') || categories.includes('breaking')) {
    return 5 * 60 * 1000; // 5 minutes for alerts/breaking
  }
  if (categories.includes('weather') || categories.includes('severe')) {
    return 10 * 60 * 1000; // 10 minutes for weather
  }
  if (categories.includes('space') || categories.includes('astronomy') || categories.includes('space-weather')) {
    return 60 * 60 * 1000; // 1 hour for space/science
  }
  return 30 * 60 * 1000; // 30 minutes default
}

/**
 * Main aggregator function - fetches from all sources
 */
export async function aggregateNews(
  options: AggregatedNewsOptions = {}
): Promise<AggregatedNewsResult> {
  const {
    categories = ['weather'],
    priority = 'all',
    sources = ['noaa', 'nasa', 'reddit', 'newsapi', 'gfs', 'rss'],
    maxItems = 30,
    maxAge = 72, // 72 hours default
  } = options;

  // Check cache first with tiered duration
  const cacheKey = JSON.stringify({ categories, priority, sources, maxItems, maxAge });
  const cacheDuration = getCacheDuration(categories);
  const cached = getFromCache(cacheKey, cacheDuration);
  if (cached) {
    return { ...cached, cacheHit: true };
  }

  const stats: NewsSourceStats[] = [];
  let allNews: NewsItem[] = [];

  // Fetch from each enabled source
  const fetchPromises: Promise<{ source: string; items: NewsItem[] }>[] = [];

  if (sources.includes('noaa')) {
    fetchPromises.push(
      fetchWithStats('NOAA', () => newsService.fetchNews(categories as any, maxItems))
    );
  }

  if (sources.includes('nasa')) {
    fetchPromises.push(fetchWithStats('NASA', () => fetchAllNASAWeatherNews(maxItems)));
  }

  if (sources.includes('reddit')) {
    fetchPromises.push(
      fetchWithStats('Reddit', () => fetchAllRedditWeatherNews(maxItems))
    );
  }

  if (sources.includes('gfs')) {
    fetchPromises.push(
      fetchWithStats('GFS Models', () => fetchAllGFSModelNews())
    );
  }

  if (sources.includes('newsapi')) {
    // NewsAPI is already included in newsService.fetchNews
    // We could add a separate direct NewsAPI fetch here if needed
  }

  // Fetch from RSS feeds
  if (sources.includes('rss')) {
    const rssFeeds = getEnabledFeeds();
    
    // Filter feeds by requested categories
    const relevantFeeds = rssFeeds.filter((feed) =>
      feed.category.some((cat) => categories.includes(cat))
    );

    // Create RSS feed services and fetch
    for (const feedConfig of relevantFeeds) {
      const rssService = createRSSFeedService(feedConfig);
      fetchPromises.push(
        fetchWithStats(feedConfig.name, () => rssService.fetch())
      );
    }
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

  // Deduplicate across sources with improved algorithm
  const deduplicatedNews = deduplicateNewsImproved(allNews);

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

  // Cache the result with tiered duration
  saveToCache(cacheKey, aggregatedResult, cacheDuration);

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
 * Improved deduplication with URL matching, content hash, and time-based grouping
 */
function deduplicateNewsImproved(news: NewsItem[]): NewsItem[] {
  // Separate alerts from articles
  const alerts = news.filter((item) => item.category === 'alerts');
  const articles = news.filter((item) => item.category !== 'alerts');

  // Deduplicate each group separately with improved algorithm
  const deduplicatedAlerts = deduplicateGroupImproved(alerts);
  const deduplicatedArticles = deduplicateGroupImproved(articles);

  // Combine and return
  return [...deduplicatedAlerts, ...deduplicatedArticles];
}

/**
 * Deduplicate news items across sources using fuzzy title matching
 * Separates alerts from articles to prevent keyword overlap issues
 * @deprecated Use deduplicateNewsImproved instead
 */
function deduplicateNews(news: NewsItem[]): NewsItem[] {
  return deduplicateNewsImproved(news);
}

/**
 * Improved deduplication group with URL matching, content hash, and source priority
 */
function deduplicateGroupImproved(news: NewsItem[]): NewsItem[] {
  const seen = new Map<string, NewsItem>();
  const urlMap = new Map<string, NewsItem>(); // URL-based exact matching
  const titleKeys = new Set<string>();
  const contentHashes = new Map<string, NewsItem>(); // Content hash for near-duplicates

  // Source priority: NOAA > NASA > Others
  const sourcePriority: Record<string, number> = {
    'NOAA': 10,
    'National Weather Service': 10,
    'NOAA NHC': 10,
    'NOAA GFS': 10,
    'NOAA SWPC': 10,
    'NASA': 8,
    'NASA Earth Observatory': 8,
    'NASA JPL': 8,
    'ESA': 6,
    'Space.com': 5,
    'SpaceNews.com': 5,
    'Reddit': 4,
  };

  function getSourcePriority(source: string): number {
    return sourcePriority[source] || 3;
  }

  news.forEach((item) => {
    // Step 1: URL-based exact matching (highest priority)
    const normalizedUrl = normalizeUrl(item.url);
    if (normalizedUrl && urlMap.has(normalizedUrl)) {
      const existing = urlMap.get(normalizedUrl)!;
      // Keep the one with higher source priority
      if (getSourcePriority(item.source) > getSourcePriority(existing.source)) {
        urlMap.set(normalizedUrl, item);
        seen.set(item.id, item);
      }
      return; // Skip duplicate URL
    }

    // Step 2: Content hash matching (for near-duplicates)
    const contentHash = getContentHash(item);
    if (contentHash && contentHashes.has(contentHash)) {
      const existing = contentHashes.get(contentHash)!;
      // Keep the one with higher source priority or more recent
      if (
        getSourcePriority(item.source) > getSourcePriority(existing.source) ||
        (getSourcePriority(item.source) === getSourcePriority(existing.source) &&
          item.timestamp > existing.timestamp)
      ) {
        contentHashes.set(contentHash, item);
        seen.set(item.id, item);
      }
      return; // Skip duplicate content
    }

    // Step 3: Title-based fuzzy matching
    const titleKey = normalizeTitle(item.title);
    
    // Check for exact title match
    if (titleKeys.has(titleKey)) {
      return; // Skip exact duplicate
    }

    // Check for fuzzy duplicates (similar titles)
    let isDuplicate = false;
    let duplicateItem: NewsItem | null = null;
    
    for (const existingKey of titleKeys) {
      if (isSimilarTitle(titleKey, existingKey)) {
        // Find the item with this title key
        const existing = Array.from(seen.values()).find(
          (n) => normalizeTitle(n.title) === existingKey
        );
        if (existing) {
          duplicateItem = existing;
          isDuplicate = true;
          break;
        }
      }
    }

    if (isDuplicate && duplicateItem) {
      // Time-based grouping: same story from different sources within 2 hours
      const timeDiff = Math.abs(
        item.timestamp.getTime() - duplicateItem.timestamp.getTime()
      );
      const twoHours = 2 * 60 * 60 * 1000;

      if (timeDiff < twoHours) {
        // Keep the one with higher source priority
        if (getSourcePriority(item.source) > getSourcePriority(duplicateItem.source)) {
          // Replace the duplicate
          seen.delete(duplicateItem.id);
          titleKeys.delete(normalizeTitle(duplicateItem.title));
          if (normalizedUrl) urlMap.delete(normalizedUrl);
          if (contentHash) contentHashes.delete(contentHash);
          
          // Add new item
          titleKeys.add(titleKey);
          seen.set(item.id, item);
          if (normalizedUrl) urlMap.set(normalizedUrl, item);
          if (contentHash) contentHashes.set(contentHash, item);
        }
      }
      return; // Skip duplicate
    }

    // Add new item
    titleKeys.add(titleKey);
    seen.set(item.id, item);
    if (normalizedUrl) urlMap.set(normalizedUrl, item);
    if (contentHash) contentHashes.set(contentHash, item);
  });

  return Array.from(seen.values());
}

/**
 * Deduplicate a group of news items
 * @deprecated Use deduplicateGroupImproved instead
 */
function deduplicateGroup(news: NewsItem[]): NewsItem[] {
  return deduplicateGroupImproved(news);
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
 * Normalize URL for comparison (remove query params, fragments, trailing slashes)
 */
function normalizeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove query params and fragments for comparison
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.replace(/\/$/, '');
  } catch {
    return null;
  }
}

/**
 * Generate content hash for near-duplicate detection
 * Uses title + description (first 200 chars)
 */
function getContentHash(item: NewsItem): string | null {
  const content = `${item.title} ${item.description || ''}`.substring(0, 200);
  if (!content.trim()) return null;
  
  // Simple hash function (for production, consider using crypto.createHash)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
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
 * Get from cache with tiered duration
 */
function getFromCache(key: string, duration: number): AggregatedNewsResult | null {
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  // Use the duration stored with the cache entry
  const cacheDuration = cached.duration || duration;
  const isExpired = Date.now() - cached.timestamp > cacheDuration;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

/**
 * Save to cache with tiered duration
 */
function saveToCache(key: string, data: AggregatedNewsResult, duration: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration,
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
    sources: ['noaa', 'nasa'],
    maxItems,
    maxAge: 24, // Last 24 hours only
  });

  return result.items;
}

/**
 * Fetch news by specific category
 */
export async function fetchNewsByCategory(
  category: NewsCategory,
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

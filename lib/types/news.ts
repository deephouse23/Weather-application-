/**
 * 16-Bit Weather Platform - News Type Definitions
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Extended type definitions for news aggregation system
 */

/**
 * Base news item (extends existing NewsItem from NewsTicker)
 */
export interface ExtendedNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  category: NewsCategory;
  priority: NewsPriority;
  timestamp: Date;
  description?: string;
  imageUrl?: string;
  author?: string;
  content?: string;
  tags?: string[];
  location?: string;
  readTime?: number; // Estimated read time in minutes
}

/**
 * News categories
 */
export type NewsCategory =
  | 'breaking' // Breaking news/alerts
  | 'weather' // General weather
  | 'local' // Local/regional weather
  | 'general' // General interest
  | 'severe' // Severe weather (subset of weather)
  | 'climate' // Climate news
  | 'tropical' // Tropical weather (hurricanes, etc.)
  | 'community'; // Community posts (Reddit, etc.)

/**
 * Priority levels
 */
export type NewsPriority = 'high' | 'medium' | 'low';

/**
 * News sources
 */
export type NewsSource =
  | 'noaa' // NOAA/NWS
  | 'nasa' // NASA Earth Observatory
  | 'fox' // FOX Weather
  | 'reddit' // Reddit
  | 'newsapi' // NewsAPI
  | 'spc' // Storm Prediction Center
  | 'nhc'; // National Hurricane Center

/**
 * Filter options for news
 */
export interface NewsFilterOptions {
  category?: NewsCategory | 'all';
  priority?: NewsPriority | 'all';
  sources?: NewsSource[];
  searchQuery?: string;
  maxAge?: number; // Hours
  minPriority?: NewsPriority;
}

/**
 * News aggregation result with metadata
 */
export interface NewsAggregationResult {
  items: ExtendedNewsItem[];
  total: number;
  filtered: number;
  sources: {
    source: NewsSource;
    count: number;
    errors: number;
  }[];
  timestamp: Date;
  cacheHit: boolean;
}

/**
 * News source configuration
 */
export interface NewsSourceConfig {
  id: NewsSource;
  name: string;
  enabled: boolean;
  priority: number; // Higher priority sources are fetched first
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  cacheDuration?: number; // Milliseconds
  requiresApiKey?: boolean;
}

/**
 * Category configuration
 */
export interface CategoryConfig {
  id: NewsCategory;
  label: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  description: string;
}

/**
 * Priority configuration
 */
export interface PriorityConfig {
  level: NewsPriority;
  label: string;
  icon: string;
  color: string; // Tailwind color class
  borderColor: string;
  textColor: string;
}

/**
 * News fetch error
 */
export interface NewsFetchError {
  source: NewsSource;
  error: string;
  timestamp: Date;
  retryAfter?: number; // Milliseconds
}

/**
 * News cache entry
 */
export interface NewsCacheEntry {
  key: string;
  data: NewsAggregationResult;
  timestamp: number;
  ttl: number; // Time to live in ms
}

/**
 * Stats for news dashboard
 */
export interface NewsStats {
  totalArticles: number;
  byCategory: Record<NewsCategory, number>;
  byPriority: Record<NewsPriority, number>;
  bySource: Record<NewsSource, number>;
  avgAge: number; // Average age in hours
  cacheHitRate: number; // Percentage
  errors: NewsFetchError[];
}

/**
 * RSS feed metadata
 */
export interface RSSFeedMeta {
  title: string;
  description?: string;
  link: string;
  language?: string;
  lastBuildDate?: Date;
  image?: {
    url: string;
    title: string;
    link: string;
  };
}

/**
 * Reddit post metadata
 */
export interface RedditPostMeta {
  subreddit: string;
  upvotes: number;
  comments: number;
  flair?: string;
  awards?: number;
  isStickie?: boolean;
}

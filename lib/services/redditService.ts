/**
 * 16-Bit Weather Platform - Reddit Weather Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches weather content from Reddit using public JSON API
 */

import { NewsItem } from '@/components/NewsTicker/NewsTicker';

// Reddit subreddits for weather content
const WEATHER_SUBREDDITS = {
  weather: 'weather',
  tropicalWeather: 'TropicalWeather',
  weatherGifs: 'WeatherGifs',
  severWeather: 'SevereWeather',
};

interface RedditPost {
  kind: string;
  data: {
    id: string;
    title: string;
    author: string;
    selftext: string;
    url: string;
    permalink: string;
    created_utc: number;
    ups: number;
    num_comments: number;
    thumbnail?: string;
    preview?: {
      images: Array<{
        source: {
          url: string;
          width: number;
          height: number;
        };
      }>;
    };
    post_hint?: string;
    link_flair_text?: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
    after?: string;
  };
}

/**
 * Fetch posts from a subreddit using Reddit's public JSON API
 */
export async function fetchRedditPosts(
  subreddit: string,
  limit: number = 20,
  minUpvotes: number = 50
): Promise<NewsItem[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/.json?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': '16BitWeather/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 600 } // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit posts: ${response.status}`);
    }

    const data: RedditResponse = await response.json();

    const newsItems: NewsItem[] = [];

    for (const post of data.data.children) {
      // Filter by minimum upvotes
      if (post.data.ups < minUpvotes) {
        continue;
      }

      // Filter out removed/deleted posts
      if (post.data.selftext === '[removed]' || post.data.selftext === '[deleted]') {
        continue;
      }

      // Extract image URL
      let imageUrl: string | undefined;

      if (post.data.preview?.images[0]?.source?.url) {
        imageUrl = post.data.preview.images[0].source.url.replace(/&amp;/g, '&');
      } else if (post.data.thumbnail && post.data.thumbnail.startsWith('http')) {
        imageUrl = post.data.thumbnail;
      }

      const newsItem: NewsItem = {
        id: `reddit-${subreddit}-${post.data.id}`,
        title: post.data.title,
        url: `https://www.reddit.com${post.data.permalink}`,
        source: `r/${subreddit}`,
        category: 'weather', // Could be refined based on subreddit
        priority: prioritizeRedditPost(post.data),
        timestamp: new Date(post.data.created_utc * 1000),
        description: truncateText(post.data.selftext, 200),
        imageUrl: imageUrl,
        author: post.data.author,
      };

      newsItems.push(newsItem);
    }

    return newsItems;
  } catch (error) {
    console.error(`Error fetching Reddit posts from r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Fetch posts from multiple weather subreddits
 */
export async function fetchAllRedditWeatherNews(maxItems: number = 30): Promise<NewsItem[]> {
  try {
    const [weather, tropicalWeather, weatherGifs, severeWeather] = await Promise.allSettled([
      fetchRedditPosts(WEATHER_SUBREDDITS.weather, 15, 50),
      fetchRedditPosts(WEATHER_SUBREDDITS.tropicalWeather, 15, 30),
      fetchRedditPosts(WEATHER_SUBREDDITS.weatherGifs, 10, 100),
      fetchRedditPosts(WEATHER_SUBREDDITS.severWeather, 10, 30),
    ]);

    const allPosts: NewsItem[] = [];

    if (weather.status === 'fulfilled') {
      allPosts.push(...weather.value);
    }

    if (tropicalWeather.status === 'fulfilled') {
      allPosts.push(...tropicalWeather.value);
    }

    if (weatherGifs.status === 'fulfilled') {
      // Mark gifs as community content
      allPosts.push(
        ...weatherGifs.value.map((item) => ({
          ...item,
          category: 'general' as const,
        }))
      );
    }

    if (severeWeather.status === 'fulfilled') {
      allPosts.push(...severeWeather.value);
    }

    // Deduplicate by title (case-insensitive, first 40 chars)
    const seen = new Map<string, NewsItem>();
    allPosts.forEach((item) => {
      const key = item.title.toLowerCase().substring(0, 40).trim();
      if (!seen.has(key)) {
        seen.set(key, item);
      }
    });

    const uniquePosts = Array.from(seen.values());

    // Sort by priority first, then timestamp
    uniquePosts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return uniquePosts.slice(0, maxItems);
  } catch (error) {
    console.error('Error fetching all Reddit weather news:', error);
    return [];
  }
}

/**
 * Fetch only trending weather posts (high upvotes)
 */
export async function fetchTrendingRedditWeather(maxItems: number = 10): Promise<NewsItem[]> {
  try {
    const [weather, tropicalWeather] = await Promise.allSettled([
      fetchRedditPosts(WEATHER_SUBREDDITS.weather, 10, 200),
      fetchRedditPosts(WEATHER_SUBREDDITS.tropicalWeather, 10, 100),
    ]);

    const allPosts: NewsItem[] = [];

    if (weather.status === 'fulfilled') {
      allPosts.push(...weather.value);
    }

    if (tropicalWeather.status === 'fulfilled') {
      allPosts.push(...tropicalWeather.value);
    }

    // Sort by upvotes (inferred from priority and recency)
    allPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return allPosts.slice(0, maxItems);
  } catch (error) {
    console.error('Error fetching trending Reddit weather:', error);
    return [];
  }
}

/**
 * Prioritize Reddit post based on content and engagement
 */
function prioritizeRedditPost(postData: RedditPost['data']): NewsItem['priority'] {
  const text = `${postData.title} ${postData.selftext}`.toLowerCase();
  const flair = postData.link_flair_text?.toLowerCase() || '';

  // High priority: Many upvotes + severe weather keywords
  if (postData.ups > 500) {
    const highSeverityKeywords = [
      'hurricane',
      'tornado',
      'evacuation',
      'emergency',
      'catastrophic',
      'major hurricane',
      'life-threatening',
    ];

    for (const keyword of highSeverityKeywords) {
      if (text.includes(keyword) || flair.includes(keyword)) {
        return 'high';
      }
    }
  }

  // Medium priority: Moderate engagement or weather alerts
  if (postData.ups > 200 || flair.includes('alert') || flair.includes('warning')) {
    return 'medium';
  }

  const mediumKeywords = [
    'watch',
    'warning',
    'advisory',
    'tropical storm',
    'severe weather',
    'winter storm',
    'flood',
  ];

  for (const keyword of mediumKeywords) {
    if (text.includes(keyword) || flair.includes(keyword)) {
      return 'medium';
    }
  }

  // Default to low priority
  return 'low';
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Search Reddit for specific weather events
 */
export async function searchRedditWeather(
  query: string,
  maxItems: number = 10
): Promise<NewsItem[]> {
  try {
    // Search r/weather for the query
    const url = `https://www.reddit.com/r/weather/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${maxItems}&sort=relevance&t=week`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': '16BitWeather/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to search Reddit: ${response.status}`);
    }

    const data: RedditResponse = await response.json();

    const newsItems: NewsItem[] = data.data.children.map((post) => {
      let imageUrl: string | undefined;

      if (post.data.preview?.images[0]?.source?.url) {
        imageUrl = post.data.preview.images[0].source.url.replace(/&amp;/g, '&');
      }

      return {
        id: `reddit-search-${post.data.id}`,
        title: post.data.title,
        url: `https://www.reddit.com${post.data.permalink}`,
        source: 'r/weather',
        category: 'weather',
        priority: prioritizeRedditPost(post.data),
        timestamp: new Date(post.data.created_utc * 1000),
        description: truncateText(post.data.selftext, 200),
        imageUrl: imageUrl,
        author: post.data.author,
      };
    });

    return newsItems;
  } catch (error) {
    console.error(`Error searching Reddit for "${query}":`, error);
    return [];
  }
}

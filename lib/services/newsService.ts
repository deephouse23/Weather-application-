/**
 * 16-Bit Weather Platform - News Service
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * News API Integration Service
 */

import { NewsItem } from '@/components/NewsTicker/NewsTicker';

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
  }>;
}

interface WeatherAlertResponse {
  features: Array<{
    properties: {
      id: string;
      headline: string;
      description: string;
      severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
      urgency: 'Immediate' | 'Expected' | 'Future' | 'Past';
      event: string;
      effective: string;
      expires: string;
      web: string;
    };
  }>;
}

export class NewsService {
  private static instance: NewsService;
  private cache: Map<string, { data: NewsItem[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
  private readonly NEWS_API_URL = 'https://newsapi.org/v2';
  private readonly WEATHER_ALERTS_URL = 'https://api.weather.gov/alerts/active?';
  private readonly isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
  
  // Trusted weather domains - only get news from these sources
  private readonly WEATHER_DOMAINS = [
    'noaa.gov',
    'weather.gov',
    'nhc.noaa.gov',
    'spc.noaa.gov',
    'weather.com',
    'accuweather.com',
    'wunderground.com',
    'metoffice.gov.uk',
    'bom.gov.au'
  ].join(',');

  private constructor() {}

  public static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  /**
   * Fetch news from multiple sources and combine them
   */
  public async fetchNews(
    categories: ('breaking' | 'weather' | 'local' | 'general')[],
    maxItems: number = 10
  ): Promise<NewsItem[]> {
    const cacheKey = `news-${categories.join('-')}-${maxItems}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const allNews: NewsItem[] = [];

      // Fetch based on categories - focus on weather only
      const fetchPromises: Promise<NewsItem[]>[] = [];

      if (categories.includes('weather')) {
        // Always fetch weather alerts and news
        fetchPromises.push(this.fetchWeatherAlerts());
        fetchPromises.push(this.fetchSevereWeatherNews());
        fetchPromises.push(this.fetchExtremeWeatherNews());
        fetchPromises.push(this.fetchClimateNews());
      }

      // Wait for all fetches to complete
      const results = await Promise.allSettled(fetchPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value);
        }
      });

      // Sort by timestamp and priority
      const sortedNews = this.sortAndPrioritizeNews(allNews);
      
      // Limit to maxItems
      const limitedNews = sortedNews.slice(0, maxItems);

      // Cache the results
      this.saveToCache(cacheKey, limitedNews);

      return limitedNews;
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.getFallbackNews();
    }
  }

  /**
   * Fetch weather alerts from NOAA
   */
  private async fetchWeatherAlerts(): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${this.WEATHER_ALERTS_URL}status=actual`, {
        headers: {
          'Accept': 'application/geo+json',
          'User-Agent': '16-Bit Weather Platform'
        },
        next: { revalidate: 300 } // Cache for 5 minutes in Next.js
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weather alerts');
      }

      const data: WeatherAlertResponse = await response.json();
      
      // Limit to first 15 alerts
      const limitedFeatures = data.features.slice(0, 15);
      
      return limitedFeatures.map(feature => ({
        id: feature.properties.id,
        title: feature.properties.headline,
        url: feature.properties.web,
        source: 'National Weather Service',
        category: 'weather' as const,
        priority: this.mapSeverityToPriority(feature.properties.severity),
        timestamp: new Date(feature.properties.effective)
      }));
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }

  /**
   * Fetch severe weather news from trusted weather domains
   */
  private async fetchSevereWeatherNews(): Promise<NewsItem[]> {
    if (!this.NEWS_API_KEY) {
      return [];
    }

    try {
      let response;
      
      // Use specific weather query with domain filtering
      const weatherQuery = '("hurricane" OR "tornado" OR "derecho" OR "blizzard" OR "flood" OR "heat wave" OR "severe storm" OR "winter storm" OR "tropical storm" OR "cyclone" OR "typhoon") AND (warning OR alert OR emergency OR watch OR advisory)';
      
      if (this.isProduction) {
        response = await fetch(
          `/api/news?endpoint=everything&q=${encodeURIComponent(weatherQuery)}&domains=${encodeURIComponent(this.WEATHER_DOMAINS)}&language=en&pageSize=20`
        );
      } else {
        response = await fetch(
          `${this.NEWS_API_URL}/everything?q=${encodeURIComponent(weatherQuery)}&domains=${this.WEATHER_DOMAINS}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${this.NEWS_API_KEY}`
        );
      }

      if (!response.ok) {
        throw new Error('Failed to fetch severe weather news');
      }

      const data: NewsAPIResponse = await response.json();
      
      return data.articles.map(article => ({
        id: `severe-${article.publishedAt}-${article.title.substring(0, 10)}`,
        title: article.title,
        url: article.url,
        source: article.source.name,
        category: 'weather' as const,
        priority: 'high' as const,
        timestamp: new Date(article.publishedAt)
      }));
    } catch (error) {
      console.error('Error fetching severe weather news:', error);
      return [];
    }
  }

  /**
   * Fetch extreme weather news from trusted sources
   */
  private async fetchExtremeWeatherNews(): Promise<NewsItem[]> {
    if (!this.NEWS_API_KEY) {
      return [];
    }

    try {
      let response;
      
      const extremeQuery = '("record temperature" OR "unprecedented" OR "historic storm" OR "emergency evacuation" OR "disaster declaration" OR "catastrophic flooding" OR "life-threatening")';
      
      if (this.isProduction) {
        response = await fetch(
          `/api/news?endpoint=everything&q=${encodeURIComponent(extremeQuery)}&domains=${encodeURIComponent(this.WEATHER_DOMAINS)}&language=en&pageSize=15`
        );
      } else {
        response = await fetch(
          `${this.NEWS_API_URL}/everything?q=${encodeURIComponent(extremeQuery)}&domains=${this.WEATHER_DOMAINS}&language=en&sortBy=publishedAt&pageSize=15&apiKey=${this.NEWS_API_KEY}`
        );
      }

      if (!response.ok) {
        throw new Error('Failed to fetch extreme weather news');
      }

      const data: NewsAPIResponse = await response.json();
      
      return data.articles.map(article => ({
        id: `extreme-${article.publishedAt}-${article.title.substring(0, 10)}`,
        title: article.title,
        url: article.url,
        source: article.source.name,
        category: 'weather' as const,
        priority: 'high' as const,
        timestamp: new Date(article.publishedAt)
      }));
    } catch (error) {
      console.error('Error fetching extreme weather news:', error);
      return [];
    }
  }

  /**
   * Fetch climate and weather pattern news
   */
  private async fetchClimateNews(): Promise<NewsItem[]> {
    if (!this.NEWS_API_KEY) {
      return [];
    }

    try {
      let response;
      
      const climateQuery = '("El Nino" OR "La Nina" OR "polar vortex" OR "atmospheric river" OR "jet stream" OR "weather pattern" OR "climate change impact")';
      
      if (this.isProduction) {
        response = await fetch(
          `/api/news?endpoint=everything&q=${encodeURIComponent(climateQuery)}&domains=${encodeURIComponent(this.WEATHER_DOMAINS)}&language=en&pageSize=10`
        );
      } else {
        response = await fetch(
          `${this.NEWS_API_URL}/everything?q=${encodeURIComponent(climateQuery)}&domains=${this.WEATHER_DOMAINS}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${this.NEWS_API_KEY}`
        );
      }

      if (!response.ok) {
        throw new Error('Failed to fetch climate news');
      }

      const data: NewsAPIResponse = await response.json();
      
      return data.articles.map(article => ({
        id: `climate-${article.publishedAt}-${article.title.substring(0, 10)}`,
        title: article.title,
        url: article.url,
        source: article.source.name,
        category: 'weather' as const,
        priority: 'medium' as const,
        timestamp: new Date(article.publishedAt)
      }));
    } catch (error) {
      console.error('Error fetching climate news:', error);
      return [];
    }
  }

  /**
   * Map weather alert severity to priority
   */
  private mapSeverityToPriority(severity: string): 'high' | 'medium' | 'low' {
    switch (severity) {
      case 'Extreme':
      case 'Severe':
        return 'high';
      case 'Moderate':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Sort and prioritize news items
   */
  private sortAndPrioritizeNews(news: NewsItem[]): NewsItem[] {
    return news.sort((a, b) => {
      // First sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // Then sort by timestamp (newest first)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  /**
   * Get cached data if still valid
   */
  private getFromCache(key: string): NewsItem[] | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Save data to cache
   */
  private saveToCache(key: string, data: NewsItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get fallback news if API fails
   */
  private getFallbackNews(): NewsItem[] {
    return [
      {
        id: 'fallback-1',
        title: 'Weather alerts will appear here when available',
        url: 'https://www.weather.gov/alerts',
        source: 'NOAA',
        category: 'weather',
        priority: 'low',
        timestamp: new Date()
      }
    ];
  }
}

// Export singleton instance
export const newsService = NewsService.getInstance();
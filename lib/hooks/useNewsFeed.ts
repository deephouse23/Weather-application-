/**
 * 16-Bit Weather Platform - News Feed Hook
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Custom hook for fetching and managing news data
 */

import { useState, useEffect, useCallback } from 'react';
import { NewsItem } from '@/components/NewsTicker/NewsTicker';
import { newsService } from '@/lib/services/newsService';

interface UseNewsFeedOptions {
  categories: ('breaking' | 'weather' | 'local' | 'general')[];
  maxItems: number;
  priority: 'high' | 'medium' | 'low' | 'all';
  autoRefresh: number;
  enabled?: boolean;
}

interface UseNewsFeedReturn {
  news: NewsItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useNewsFeed({
  categories,
  maxItems,
  priority,
  autoRefresh,
  enabled = true
}: UseNewsFeedOptions): UseNewsFeedReturn {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Filter news by priority
  const filterByPriority = useCallback((items: NewsItem[]): NewsItem[] => {
    if (priority === 'all') {
      return items;
    }
    
    return items.filter(item => {
      if (priority === 'high') {
        return item.priority === 'high';
      }
      if (priority === 'medium') {
        return item.priority === 'high' || item.priority === 'medium';
      }
      return item.priority === priority;
    });
  }, [priority]);

  // Fetch news data
  const fetchNews = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const fetchedNews = await newsService.fetchNews(categories, maxItems * 2); // Fetch extra for filtering
      const filteredNews = filterByPriority(fetchedNews).slice(0, maxItems);
      
      setNews(filteredNews);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch news'));
      
      // Use mock data as fallback
      const mockNews: NewsItem[] = [
        {
          id: 'mock-1',
          title: 'Unable to fetch live news. Check your internet connection.',
          url: '#',
          source: 'System',
          category: 'general',
          priority: 'low',
          timestamp: new Date()
        }
      ];
      setNews(mockNews);
    } finally {
      setLoading(false);
    }
  }, [categories, maxItems, priority, filterByPriority, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto-refresh
  useEffect(() => {
    if (!enabled || autoRefresh <= 0) {
      return;
    }

    const interval = setInterval(() => {
      fetchNews();
    }, autoRefresh);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchNews, enabled]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    newsService.clearCache(); // Clear cache to force fresh data
    await fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    refresh
  };
}
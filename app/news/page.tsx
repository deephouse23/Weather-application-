/**
 * 16-Bit Weather Platform - News Page (Redesigned)
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Dynamic multi-source weather news aggregation with retro aesthetics
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import NewsHero from '@/components/news/NewsHero';
import NewsFilter from '@/components/news/NewsFilter';
import NewsGrid from '@/components/news/NewsGrid';
import NewsSkeleton from '@/components/news/NewsSkeleton';
import type { NewsItem } from '@/components/NewsTicker/NewsTicker';
import type { NewsCategory } from '@/lib/types/news';

export default function NewsPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  // State
  const [news, setNews] = useState<NewsItem[]>([]);
  const [featuredStory, setFeaturedStory] = useState<NewsItem | null>(null);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<NewsCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch news from aggregator API
  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch aggregated news
      const response = await fetch('/api/news/aggregate?maxItems=50');

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();

      if (data.status === 'ok' && data.items) {
        setNews(data.items);
        setFilteredNews(data.items);
      } else {
        throw new Error(data.message || 'No news available');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load news');
      setNews([]);
      setFilteredNews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch featured story
  const fetchFeaturedStory = useCallback(async () => {
    try {
      const response = await fetch('/api/news/aggregate?featured=true');

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.status === 'ok' && data.featured) {
        setFeaturedStory(data.featured);
      }
    } catch (err) {
      console.error('Error fetching featured story:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNews();
    fetchFeaturedStory();
  }, [fetchNews, fetchFeaturedStory]);

  // Filter news based on category and search query
  useEffect(() => {
    let filtered = [...news];

    // Filter by category
    if (currentCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === currentCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query)
      );
    }

    setFilteredNews(filtered);
  }, [news, currentCategory, searchQuery]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchNews();
    fetchFeaturedStory();
  }, [fetchNews, fetchFeaturedStory]);

  // Determine empty state type
  const getEmptyType = (): 'no-alerts' | 'no-results' | 'error' | 'no-news' => {
    if (error) return 'error';
    if (searchQuery || currentCategory !== 'all') return 'no-results';
    if (currentCategory !== 'all' && (currentCategory === 'breaking' || currentCategory === 'severe')) return 'no-alerts';
    return 'no-news';
  };

  return (
    <PageWrapper>
      <div className={cn('container mx-auto px-4 py-6', themeClasses.background)}>
        {/* Header */}
        <div className="mb-6">
          <h1
            className={cn(
              'text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 font-mono',
              themeClasses.accentText
            )}
          >
            16-BIT WEATHER NEWS
          </h1>
          <p className={cn('text-sm sm:text-base font-mono', themeClasses.text)}>
            Real-time weather news from NASA, NOAA, FOX Weather, Reddit, and more
          </p>
        </div>

        {/* Filter Controls */}
        <NewsFilter
          onCategoryChange={setCurrentCategory}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          currentCategory={currentCategory}
          searchQuery={searchQuery}
          isLoading={isLoading}
          className="mb-6"
        />

        {/* Featured Story */}
        {featuredStory && !isLoading && currentCategory === 'all' && !searchQuery && (
          <div className="mb-8">
            <h2 className={cn('text-xl font-bold font-mono mb-4', themeClasses.headerText)}>
              🔥 FEATURED STORY
            </h2>
            <NewsHero item={featuredStory} />
          </div>
        )}

        {/* News Grid */}
        <div>
          {currentCategory !== 'all' || searchQuery ? (
            <h2 className={cn('text-xl font-bold font-mono mb-4', themeClasses.headerText)}>
              {filteredNews.length} ARTICLE{filteredNews.length !== 1 ? 'S' : ''} FOUND
            </h2>
          ) : (
            <h2 className={cn('text-xl font-bold font-mono mb-4', themeClasses.headerText)}>
              LATEST NEWS
            </h2>
          )}

          <NewsGrid
            items={filteredNews}
            isLoading={isLoading}
            error={error}
            emptyType={getEmptyType()}
            onRetry={handleRefresh}
          />
        </div>

        {/* Stats Footer */}
        {!isLoading && filteredNews.length > 0 && (
          <div className={cn('mt-8 pt-6 border-t-2 text-center', themeClasses.borderColor)}>
            <p className={cn('text-xs font-mono', themeClasses.text)}>
              Displaying {filteredNews.length} of {news.length} articles
              {currentCategory !== 'all' && ` in ${currentCategory.toUpperCase()}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            <p className={cn('text-xs font-mono mt-2', themeClasses.text)}>
              Sources: NOAA • NASA • FOX Weather • Reddit • NewsAPI
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

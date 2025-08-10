/**
 * 16-Bit Weather Platform - News Ticker Feature
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * News Ticker Component - Core Implementation
 */

"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Cloud, Globe, Loader2 } from 'lucide-react';
import NewsTickerItem from './NewsTickerItem';
import styles from './NewsTicker.module.css';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { useNewsFeed } from '@/lib/hooks/useNewsFeed';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  category: 'breaking' | 'weather' | 'local' | 'general';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export interface NewsTickerProps {
  categories?: ('breaking' | 'weather' | 'local' | 'general')[];
  autoRefresh?: number; // in milliseconds
  maxItems?: number;
  priority?: 'high' | 'medium' | 'low' | 'all';
}

const NewsTicker: React.FC<NewsTickerProps> = ({
  categories = ['weather'],
  autoRefresh = 300000, // 5 minutes default
  maxItems = 30,
  priority = 'all'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [useRealData, setUseRealData] = useState(true);
  const { theme } = useTheme();
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation');

  // Use the custom hook for fetching news
  const { news, loading, error, refresh } = useNewsFeed({
    categories,
    maxItems,
    priority,
    autoRefresh,
    enabled: useRealData
  });

  // Use news directly from the feed - already filtered by domain
  const newsItems = useRealData && news.length > 0 
    ? news
    : [{
        id: 'loading',
        title: 'Loading weather updates...',
        url: '#',
        source: 'System',
        category: 'weather' as const,
        priority: 'low' as const,
        timestamp: new Date()
      }];

  // Calculate animation duration based on content length
  const getAnimationDuration = () => {
    const totalLength = newsItems.reduce((acc, item) => acc + item.title.length, 0);
    const baseDuration = 60; // seconds
    const adjustedDuration = Math.max(baseDuration, totalLength / 10);
    return `${adjustedDuration}s`;
  };

  // Check API key availability
  useEffect(() => {
    const hasApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!hasApiKey) {
      console.warn('News API key not configured.');
      setUseRealData(true); // Still try NOAA
    }
  }, []);

  if (!isVisible || newsItems.length === 0) {
    return null;
  }

  // Show loading state
  if (loading && newsItems.length === 0) {
    return (
      <div className={`relative w-full overflow-hidden ${themeClasses.background}`}
           style={{ height: '32px' }}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-xs font-mono">Loading weather alerts...</span>
        </div>
      </div>
    );
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breaking':
        return <AlertTriangle className="w-3 h-3" />;
      case 'weather':
        return <Cloud className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: string, priority: string) => {
    if (priority === 'high') {
      return theme === 'dark' ? 'bg-red-900 text-red-200' : 
             theme === 'miami' ? 'bg-pink-600 text-white' : 
             'bg-cyan-500 text-black';
    }
    return theme === 'dark' ? 'bg-blue-800 text-blue-100' : 
           theme === 'miami' ? 'bg-purple-500 text-white' : 
           'bg-blue-400 text-black';
  };

  // Create continuous content string
  const tickerContent = (
    <>
      {newsItems.map((item, index) => (
        <span key={`${item.id}-${index}`} className="inline-flex items-center mx-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-1 py-0.5 rounded-sm text-xs font-bold mr-2 ${getCategoryColor(item.category, item.priority)}`}>
            {getCategoryIcon(item.category)}
            <span className="ml-1">WEATHER</span>
          </span>
          <NewsTickerItem item={item} theme={theme as ThemeType} />
          {index < newsItems.length - 1 && (
            <span className={`text-xs mx-2 opacity-50 ${themeClasses.text}`}>•</span>
          )}
        </span>
      ))}
    </>
  );

  return (
    <div className={`relative w-full overflow-hidden ${themeClasses.background}`}
         style={{ height: '32px' }}>
      <div className={styles.tickerWrapper}>
        <div 
          className={styles.tickerScroll}
          style={{
            animationDuration: getAnimationDuration()
          }}
        >
          {tickerContent}
          {/* Add spacing before loop */}
          <span className="inline-block" style={{ width: '100px' }}></span>
          {tickerContent}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
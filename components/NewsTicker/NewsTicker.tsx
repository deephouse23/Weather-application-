/**
 * 16-Bit Weather Platform - News Ticker Feature
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * News Ticker Component - Core Implementation
 */

"use client"

import React, { useState, useEffect, useRef } from 'react';
import { X, Pause, Play, RefreshCw, AlertTriangle, Cloud, Globe, Loader2 } from 'lucide-react';
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

// Fallback data for when API is not available
const getFallbackNewsItems = (): NewsItem[] => {
  return [
    {
      id: 'fallback-1',
      title: 'Loading news updates...',
      url: '#',
      source: 'System',
      category: 'general',
      priority: 'low',
      timestamp: new Date()
    }
  ];
};

const NewsTicker: React.FC<NewsTickerProps> = ({
  categories = ['breaking', 'weather', 'local', 'general'],
  autoRefresh = 300000, // 5 minutes default
  maxItems = 10,
  priority = 'all'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [useRealData, setUseRealData] = useState(true);
  const tickerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  // Use real news if available, otherwise use fallback
  const newsItems = useRealData && news.length > 0 ? news : getFallbackNewsItems();

  // Fixed animation speed (between medium and fast)
  const animationSpeed = '30s';

  // Handle visibility toggle
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsTickerClosed', 'true');
  };

  // Handle pause/play
  const togglePause = () => {
    setIsPaused(!isPaused);
  };



  // Check if ticker was previously closed
  useEffect(() => {
    const wasClosed = localStorage.getItem('newsTickerClosed');
    if (wasClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  // Check if we should use real data based on environment
  useEffect(() => {
    const hasApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    
    if (!hasApiKey) {
      console.warn('News API key not configured.');
      // Still try to fetch NOAA alerts which don't need a key
      setUseRealData(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  // Show loading state initially
  if (loading && newsItems.length === 0) {
    return (
      <div className={`relative w-full overflow-hidden border-b-4 pixel-border ${themeClasses.background} ${themeClasses.borderColor}`}
           style={{ height: '40px' }}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm font-mono">Loading news...</span>
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return null;
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

  // Get category color based on theme
  const getCategoryColor = (category: string, priority: string) => {
    if (priority === 'high') {
      return theme === 'dark' ? 'bg-red-900 text-red-200' : 
             theme === 'miami' ? 'bg-pink-600 text-white' : 
             'bg-cyan-500 text-black';
    }
    
    switch (category) {
      case 'breaking':
        return theme === 'dark' ? 'bg-red-800 text-red-100' : 
               theme === 'miami' ? 'bg-pink-500 text-white' : 
               'bg-cyan-400 text-black';
      case 'weather':
        return theme === 'dark' ? 'bg-blue-800 text-blue-100' : 
               theme === 'miami' ? 'bg-purple-500 text-white' : 
               'bg-blue-400 text-black';
      case 'local':
        return theme === 'dark' ? 'bg-green-800 text-green-100' : 
               theme === 'miami' ? 'bg-orange-500 text-white' : 
               'bg-green-400 text-black';
      default:
        return theme === 'dark' ? 'bg-gray-800 text-gray-100' : 
               theme === 'miami' ? 'bg-yellow-500 text-black' : 
               'bg-gray-400 text-black';
    }
  };

  return (
    <div 
      className={`relative w-full overflow-hidden border-b-4 pixel-border ${themeClasses.background} ${themeClasses.borderColor}`}
      style={{ height: '40px' }}
    >
      {/* Controls */}
      <div className="absolute left-0 top-0 h-full flex items-center z-20 px-2"
           style={{ 
             background: `linear-gradient(90deg, 
               ${theme === 'dark' ? 'rgba(0,0,0,1)' : 
                 theme === 'miami' ? 'rgba(255,192,203,1)' : 
                 'rgba(0,255,255,1)'} 0%, 
               transparent 100%)`
           }}>
        <button
          onClick={togglePause}
          className={`p-1 border-2 ${themeClasses.background} ${themeClasses.borderColor} hover:${themeClasses.accentBg} transition-colors`}
          title={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </button>
        {useRealData && (
          <button
            onClick={refresh}
            className={`p-1 border-2 ml-1 ${themeClasses.background} ${themeClasses.borderColor} hover:${themeClasses.accentBg} transition-colors`}
            title="Refresh news"
            disabled={loading}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Close button */}
      <div className="absolute right-0 top-0 h-full flex items-center z-20 px-2"
           style={{ 
             background: `linear-gradient(270deg, 
               ${theme === 'dark' ? 'rgba(0,0,0,1)' : 
                 theme === 'miami' ? 'rgba(255,192,203,1)' : 
                 'rgba(0,255,255,1)'} 0%, 
               transparent 100%)`
           }}>
        <button
          onClick={handleClose}
          className={`p-1 border-2 ${themeClasses.background} ${themeClasses.borderColor} hover:bg-red-500 hover:text-white transition-colors`}
          title="Close ticker"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Scrolling content */}
      <div 
        ref={scrollRef}
        className={`flex items-center h-full ${styles.tickerScroll} ${isPaused ? styles.paused : ''}`}
        style={{
          animationDuration: animationSpeed,
          paddingLeft: '100%'
        }}
      >
        {/* Duplicate items for seamless loop */}
        {[...newsItems, ...newsItems].map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center mx-4 whitespace-nowrap"
          >
            <span className={`flex items-center px-2 py-1 rounded-sm text-xs font-bold mr-2 ${getCategoryColor(item.category, item.priority)}`}>
              {getCategoryIcon(item.category)}
              <span className="ml-1">{item.category.toUpperCase()}</span>
            </span>
            <NewsTickerItem item={item} theme={theme as ThemeType} />
            <span className={`text-xs mx-2 opacity-50 ${themeClasses.text}`}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;
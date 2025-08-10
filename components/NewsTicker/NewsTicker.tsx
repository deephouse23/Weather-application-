/**
 * 16-Bit Weather Platform - News Ticker Feature
 * Version 0.3.31 - Mobile Optimization Update
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * News Ticker Component - Mobile Optimized Version
 */

"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Cloud, Globe, Loader2, Pause, Play } from 'lucide-react';
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
  mobileSpeedFactor?: number; // Speed multiplier for mobile (1 = normal, 2 = 2x slower)
  enableMobileControls?: boolean; // Show play/pause on mobile
}

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet };
};

// Touch detection hook
const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
};

const NewsTicker: React.FC<NewsTickerProps> = ({
  categories = ['weather'],
  autoRefresh = 300000, // 5 minutes default
  maxItems = 30,
  priority = 'all',
  mobileSpeedFactor = 3, // 3x slower on mobile by default
  enableMobileControls = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [useRealData, setUseRealData] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const { theme } = useTheme();
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation');
  const { isMobile, isTablet } = useIsMobile();
  const isTouch = useIsTouchDevice();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Calculate animation duration based on content length and device type
  const getAnimationDuration = () => {
    const totalLength = newsItems.reduce((acc, item) => acc + item.title.length, 0);
    
    // Base durations - significantly slower
    let baseDuration = 120; // Desktop: 120s (2 minutes)
    
    if (isMobile) {
      baseDuration = 180 * mobileSpeedFactor; // Mobile: 180s × 3 = 540s (9 minutes)
    } else if (isTablet) {
      baseDuration = 150 * 1.5; // Tablet: 225s (3.75 minutes)
    }
    
    // Additional slowdown for longer content
    const contentFactor = Math.max(1, totalLength / 500);
    const adjustedDuration = baseDuration * contentFactor;
    
    return `${adjustedDuration}s`;
  };

  // Handle pause/play for mobile
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    setUserHasInteracted(true);
  }, []);

  // Auto-pause on mobile when user starts scrolling
  useEffect(() => {
    if (!isMobile || !enableMobileControls) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (!userHasInteracted) {
        setIsPaused(true);
      }
      
      // Resume after user stops scrolling for 3 seconds
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!userHasInteracted) {
          setIsPaused(false);
        }
      }, 3000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile, enableMobileControls, userHasInteracted]);

  // Check API key availability
  useEffect(() => {
    const hasApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!hasApiKey) {
      console.warn('News API key not configured.');
      setUseRealData(true); // Still try NOAA
    }
  }, []);

  // Touch-friendly click handler for mobile
  const handleItemClick = useCallback((e: React.MouseEvent, url: string) => {
    if (isTouch) {
      e.preventDefault();
      // Add a small delay for touch feedback
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 100);
    }
  }, [isTouch]);

  if (!isVisible || newsItems.length === 0) {
    return null;
  }

  // Show loading state
  if (loading && newsItems.length === 0) {
    return (
      <div className={`relative w-full overflow-hidden ${themeClasses.background}`}
           style={{ height: isMobile ? '48px' : '32px' }}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className={`text-xs font-mono ${isMobile ? 'text-sm' : ''}`}>
            Loading weather alerts...
          </span>
        </div>
      </div>
    );
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconSize = isMobile ? 'w-4 h-4' : 'w-3 h-3';
    switch (category) {
      case 'breaking':
        return <AlertTriangle className={iconSize} />;
      case 'weather':
        return <Cloud className={iconSize} />;
      default:
        return <Globe className={iconSize} />;
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

  // Create continuous content string with mobile optimizations
  const tickerContent = (
    <>
      {newsItems.map((item, index) => (
        <span 
          key={`${item.id}-${index}`} 
          className={`inline-flex items-center mx-4 whitespace-nowrap ${
            isMobile ? 'touch-manipulation' : ''
          }`}
          onClick={(e) => handleItemClick(e, item.url)}
          style={{ cursor: isTouch ? 'pointer' : 'default' }}
        >
          <span className={`inline-flex items-center px-${isMobile ? '2' : '1'} py-${isMobile ? '1' : '0.5'} rounded-sm text-${isMobile ? 'sm' : 'xs'} font-bold mr-2 ${getCategoryColor(item.category, item.priority)}`}>
            {getCategoryIcon(item.category)}
            <span className={`ml-${isMobile ? '2' : '1'}`}>WEATHER</span>
          </span>
          <div className={isMobile ? 'text-sm' : ''}>
            <NewsTickerItem item={item} theme={theme as ThemeType} />
          </div>
          {index < newsItems.length - 1 && (
            <span className={`text-${isMobile ? 'sm' : 'xs'} mx-${isMobile ? '3' : '2'} opacity-50 ${themeClasses.text}`}>
              •
            </span>
          )}
        </span>
      ))}
    </>
  );

  return (
    <div 
      className={`relative w-full overflow-hidden ${themeClasses.background} ${
        isMobile ? 'touch-manipulation' : ''
      }`}
      style={{ 
        height: isMobile ? '48px' : '32px',
        WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
      }}
    >
      {/* Mobile controls */}
      {isMobile && enableMobileControls && (
        <button
          onClick={togglePause}
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded ${themeClasses.background} ${themeClasses.border} opacity-80 hover:opacity-100 transition-opacity`}
          aria-label={isPaused ? 'Play news ticker' : 'Pause news ticker'}
        >
          {isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </button>
      )}
      
      <div 
        className={styles.tickerWrapper}
        style={{ 
          paddingLeft: isMobile && enableMobileControls ? '48px' : '0' 
        }}
      >
        <div 
          ref={scrollRef}
          className={`${styles.tickerScroll} ${isPaused ? styles.paused : ''}`}
          style={{
            animationDuration: getAnimationDuration(),
            animationPlayState: isPaused ? 'paused' : 'running',
            // Optimize for mobile rendering
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: 1000
          }}
        >
          {tickerContent}
          {/* Add more spacing before loop on mobile */}
          <span className="inline-block" style={{ width: isMobile ? '200px' : '100px' }}></span>
          {tickerContent}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
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
import { X, Pause, Play, ChevronLeft, ChevronRight, AlertTriangle, Cloud, Globe } from 'lucide-react';
import NewsTickerItem from './NewsTickerItem';
import styles from './NewsTicker.module.css';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';

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
  speed?: 'slow' | 'medium' | 'fast';
  autoRefresh?: number; // in milliseconds
  maxItems?: number;
  priority?: 'high' | 'medium' | 'low' | 'all';
}

// Mock data for Phase 1
const mockNewsItems: NewsItem[] = [
  {
    id: '1',
    title: 'BREAKING: Severe flooding reported in Wisconsin following heavy rainfall',
    url: '#',
    source: 'Weather Service',
    category: 'breaking',
    priority: 'high',
    timestamp: new Date()
  },
  {
    id: '2',
    title: 'Heat wave continues across California with temperatures reaching 105°F',
    url: '#',
    source: 'Local News',
    category: 'weather',
    priority: 'medium',
    timestamp: new Date()
  },
  {
    id: '3',
    title: 'Tornado watch issued for Kansas and Oklahoma through midnight',
    url: '#',
    source: 'National Weather Service',
    category: 'weather',
    priority: 'high',
    timestamp: new Date()
  },
  {
    id: '4',
    title: 'Local schools announce closures due to winter storm warning',
    url: '#',
    source: 'School District',
    category: 'local',
    priority: 'high',
    timestamp: new Date()
  },
  {
    id: '5',
    title: 'New climate report shows record-breaking temperatures in 2024',
    url: '#',
    source: 'Climate Central',
    category: 'general',
    priority: 'low',
    timestamp: new Date()
  },
  {
    id: '6',
    title: 'Hurricane season outlook: Above-average activity expected',
    url: '#',
    source: 'NOAA',
    category: 'weather',
    priority: 'medium',
    timestamp: new Date()
  }
];

const NewsTicker: React.FC<NewsTickerProps> = ({
  categories = ['breaking', 'weather', 'local', 'general'],
  speed = 'medium',
  autoRefresh = 300000, // 5 minutes default
  maxItems = 10,
  priority = 'all'
}) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(mockNewsItems);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const tickerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation');

  // Filter news items based on categories and priority
  const filteredItems = newsItems.filter(item => {
    const categoryMatch = categories.includes(item.category);
    const priorityMatch = priority === 'all' || item.priority === priority || 
                         (priority === 'high' && item.priority === 'high') ||
                         (priority === 'medium' && (item.priority === 'high' || item.priority === 'medium'));
    return categoryMatch && priorityMatch;
  }).slice(0, maxItems);

  // Speed mapping for animation
  const speedMap = {
    slow: '60s',
    medium: '40s',
    fast: '20s'
  };

  // Handle visibility toggle
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsTickerClosed', 'true');
  };

  // Handle pause/play
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle speed change
  const cycleSpeed = () => {
    const speeds: ('slow' | 'medium' | 'fast')[] = ['slow', 'medium', 'fast'];
    const currentIndex = speeds.indexOf(currentSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setCurrentSpeed(speeds[nextIndex]);
  };

  // Check if ticker was previously closed
  useEffect(() => {
    const wasClosed = localStorage.getItem('newsTickerClosed');
    if (wasClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  // Auto-refresh news items
  useEffect(() => {
    if (autoRefresh > 0) {
      const interval = setInterval(() => {
        // In Phase 1, we just shuffle the mock data
        // In Phase 2, this will fetch real news
        setNewsItems(prev => [...prev].sort(() => Math.random() - 0.5));
      }, autoRefresh);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (!isVisible || filteredItems.length === 0) {
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
      <div className="absolute left-0 top-0 h-full flex items-center z-20 px-2 space-x-1"
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
        <button
          onClick={cycleSpeed}
          className={`px-2 py-1 border-2 text-xs font-mono ${themeClasses.background} ${themeClasses.borderColor} hover:${themeClasses.accentBg} transition-colors`}
          title="Change speed"
        >
          {currentSpeed.toUpperCase()}
        </button>
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
          animationDuration: speedMap[currentSpeed],
          paddingLeft: '100%'
        }}
      >
        {/* Duplicate items for seamless loop */}
        {[...filteredItems, ...filteredItems].map((item, index) => (
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
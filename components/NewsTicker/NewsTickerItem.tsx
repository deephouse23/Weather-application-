/**
 * 16-Bit Weather Platform - News Ticker Feature
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * News Ticker Item Component
 */

"use client"

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { NewsItem } from './NewsTicker';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';

interface NewsTickerItemProps {
  item: NewsItem;
  theme: ThemeType;
}

const NewsTickerItem: React.FC<NewsTickerItemProps> = ({ item, theme }) => {
  const themeClasses = getComponentStyles(theme, 'navigation');
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // In Phase 2, this will open the actual news article
    // For now, just log the click
    console.log('News item clicked:', item);
    
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <a
      href={item.url}
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 hover:underline cursor-pointer ${themeClasses.text}`}
      title={`${item.title} - ${item.source}`}
    >
      <span className="text-sm font-mono">
        {item.title}
      </span>
      <span className={`text-xs opacity-70`}>
        ({item.source})
      </span>
      {item.url && item.url !== '#' && (
        <ExternalLink className="w-3 h-3 opacity-50" />
      )}
      <span className={`text-xs opacity-50`}>
        {formatTime(item.timestamp)}
      </span>
    </a>
  );
};

export default NewsTickerItem;
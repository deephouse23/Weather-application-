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
import { safeExternalUrl } from '@/lib/safe-url';

interface NewsTickerItemProps {
  item: NewsItem;
  theme: ThemeType;
}

const NewsTickerItem: React.FC<NewsTickerItemProps> = ({ item, theme }) => {
  const themeClasses = getComponentStyles(theme, 'navigation');
  const safeUrl = safeExternalUrl(item.url);

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

  const inner = (
    <>
      <span className="text-xs font-mono">{item.title}</span>
      <span className={`text-xs opacity-60`}>({item.source})</span>
      {safeUrl && (
        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
      )}
      <span className={`text-xs opacity-40`}>{formatTime(item.timestamp)}</span>
    </>
  );

  if (!safeUrl) {
    return (
      <span
        className={`inline-flex items-center space-x-1 ${themeClasses.text}`}
        title={`${item.title} - ${item.source}`}
      >
        {inner}
      </span>
    );
  }

  return (
    <a
      href={safeUrl}
      className={`inline-flex items-center space-x-1 hover:underline cursor-pointer ${themeClasses.text}`}
      title={`${item.title} - ${item.source}`}
    >
      {inner}
    </a>
  );
};

export default NewsTickerItem;
/**
 * 16-Bit Weather Platform - Simple News Section
 * Version 0.3.32 - Back to Basics
 */

"use client"

import React, { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-state';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { useNewsFeed } from '@/lib/hooks/useNewsFeed';

const NewsSection: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useTheme();
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation');

  const { news, loading, error, refresh } = useNewsFeed({
    categories: ['weather'],
    maxItems: 10,
    priority: 'all',
    autoRefresh: 300000,
    enabled: true
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const truncateHeadline = (headline: string, maxLength: number = 50) => {
    if (headline.length <= maxLength) return headline;
    return headline.slice(0, maxLength).trim() + '...';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-weather-primary';
    }
  };

  if (error) {
    return null; // Hide if there's an error
  }

  return (
    <div className={`news-section ${themeClasses.background} border-2 ${themeClasses.borderColor} my-4 font-mono`}>
      {/* Header */}
      <div className={`news-header ${themeClasses.accentBg} text-black px-3 py-2 flex justify-between items-center`}>
        <h3 className="text-sm font-bold uppercase tracking-wider">WEATHER NEWS</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="refresh-btn bg-transparent text-black font-bold px-1 hover:opacity-80 transition-opacity disabled:opacity-50"
          aria-label="Refresh news"
        >
          {isRefreshing || loading ? <LoadingSpinner size="sm" label="Refreshing news" /> : '↻'}
        </button>
      </div>

      {/* News List */}
      <div className="news-list p-3 space-y-1">
        {loading && news.length === 0 ? (
          <div className={`text-center py-4 ${themeClasses.text}`}>
            Loading weather updates...
          </div>
        ) : news.length === 0 ? (
          <div className={`text-center py-4 ${themeClasses.text}`}>
            No weather alerts at this time
          </div>
        ) : (
          news.slice(0, 5).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`news-item block ${themeClasses.text} hover:${themeClasses.accentText} transition-colors py-1 text-sm`}
            >
              <span className={`bullet ${getPriorityColor(item.priority)} mr-2`}>►</span>
              <span className="headline">{truncateHeadline(item.title)}</span>
            </a>
          ))
        )}
        
        {news.length > 5 && (
          <div className="mt-3 pt-2 border-t border-weather-border">
            <button className={`view-all w-full ${themeClasses.background} border border-weather-border ${themeClasses.text} py-2 text-xs font-mono hover:${themeClasses.accentBg} hover:text-black transition-colors`}>
              View All {news.length} Weather Updates
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSection;
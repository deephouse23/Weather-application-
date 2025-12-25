/**
 * 16-Bit Weather Platform - News Hero Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React, { useState } from 'react';
import { ExternalLink, Clock, MapPin, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import CategoryBadge from './CategoryBadge';
import PriorityIndicator from './PriorityIndicator';
import type { RSSItem } from '@/lib/services/rss/rssAggregator';

interface NewsHeroProps {
  item: RSSItem;
  className?: string;
}

export default function NewsHero({ item, className }: NewsHeroProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  const [imageError, setImageError] = useState(false);

  // Calculate time ago
  const timeAgo = getTimeAgo(new Date(item.timestamp));

  return (
    <Card
      className={cn(
        'border-4 overflow-hidden group cursor-pointer transition-all hover:shadow-xl',
        item.priority === 'high' ? 'border-red-500' : themeClasses.borderColor,
        themeClasses.background,
        className
      )}
      onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image */}
        {item.imageUrl && !imageError ? (
          <div className="relative w-full lg:w-1/2 h-64 lg:h-80 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <PriorityIndicator priority={item.priority} showLabel size="md" />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'w-full lg:w-1/2 h-64 lg:h-80 flex items-center justify-center border-b-2 lg:border-b-0 lg:border-r-2',
              themeClasses.borderColor,
              themeClasses.background
            )}
          >
            <div className="text-center p-8">
              <CategoryBadge category={item.category} className="text-lg px-4 py-2" />
              {item.magnitude && (
                <div className="mt-4">
                  <span className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 text-2xl font-bold border-4 rounded font-mono',
                    item.magnitude >= 6 ? 'bg-red-600 text-white border-red-800' :
                    item.magnitude >= 5 ? 'bg-orange-500 text-white border-orange-700' :
                    'bg-yellow-500 text-black border-yellow-700'
                  )}>
                    <Activity className="w-6 h-6" />
                    M{item.magnitude.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <CardContent className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <CategoryBadge category={item.category} />
              {item.magnitude && (
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border-2 rounded font-mono',
                  item.magnitude >= 6 ? 'bg-red-600 text-white border-red-800' :
                  item.magnitude >= 5 ? 'bg-orange-500 text-white border-orange-700' :
                  'bg-yellow-500 text-black border-yellow-700'
                )}>
                  <Activity className="w-3 h-3" />
                  M{item.magnitude.toFixed(1)}
                </span>
              )}
            </div>
            <h2
              className={cn(
                'text-xl sm:text-2xl lg:text-3xl font-bold font-mono mb-4 group-hover:underline',
                themeClasses.headerText
              )}
            >
              {item.title}
            </h2>
            {item.description && (
              <p className={cn('text-sm sm:text-base lg:text-lg mb-4', themeClasses.text)}>
                {item.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t-2 border-dashed">
            <div className="flex flex-col gap-1">
              <div className={cn('text-sm flex items-center gap-2', themeClasses.text)}>
                <Clock className="w-4 h-4" />
                <span>{timeAgo}</span>
                <span>•</span>
                <span>{item.source}</span>
              </div>
              {item.location && (
                <div className={cn('text-sm flex items-center gap-2', themeClasses.text)}>
                  <MapPin className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className={cn('font-mono font-bold border-2', themeClasses.accentText)}
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, '_blank', 'noopener,noreferrer');
              }}
            >
              READ FULL STORY <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

/**
 * Calculate time ago string
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

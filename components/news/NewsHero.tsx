/**
 * 16-Bit Weather Platform - News Hero Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Clock, User, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import CategoryBadge from './CategoryBadge';
import PriorityIndicator from './PriorityIndicator';
import type { NewsItem } from '@/components/NewsTicker/NewsTicker';

interface NewsHeroProps {
  item: NewsItem;
  className?: string;
}

export default function NewsHero({ item, className }: NewsHeroProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  const [imageError, setImageError] = useState(false);

  const timeAgo = getTimeAgo(item.timestamp);

  // Priority border
  const priorityBorderClass =
    item.priority === 'high'
      ? 'border-red-500'
      : item.priority === 'medium'
      ? 'border-yellow-500'
      : themeClasses.borderColor;

  return (
    <Card
      className={cn(
        'border-2 overflow-hidden',
        priorityBorderClass,
        themeClasses.background,
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        {item.imageUrl && !imageError ? (
          <div className="relative w-full md:w-1/2 h-64 md:h-80">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              priority
              onError={() => setImageError(true)}
            />
            {/* Overlay badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className={cn('px-3 py-1.5 rounded font-mono font-bold text-xs flex items-center gap-2 bg-black/70 text-white')}>
                <TrendingUp className="w-4 h-4" />
                FEATURED STORY
              </div>
              <PriorityIndicator priority={item.priority} showLabel size="md" />
            </div>
          </div>
        ) : (
          // Fallback if no image
          <div
            className={cn(
              'w-full md:w-1/2 h-64 md:h-80 flex flex-col items-center justify-center gap-4 border-r-2',
              themeClasses.borderColor,
              themeClasses.accentBg
            )}
          >
            <div className={cn('px-4 py-2 rounded font-mono font-bold text-sm')}>
              <TrendingUp className="w-8 h-8 mb-2" />
              FEATURED STORY
            </div>
            <CategoryBadge category={item.category as any} />
            <PriorityIndicator priority={item.priority} showLabel size="lg" />
          </div>
        )}

        {/* Content Section */}
        <CardContent className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          {/* Header */}
          <div className="flex-1">
            <div className="flex gap-2 mb-4 flex-wrap">
              <CategoryBadge category={item.category as any} />
              {(!item.imageUrl || imageError) && (
                <PriorityIndicator priority={item.priority} showLabel size="sm" />
              )}
            </div>

            <h2
              className={cn(
                'text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono mb-4 leading-tight',
                themeClasses.headerText
              )}
            >
              {item.title}
            </h2>

            {item.description && (
              <p className={cn('text-base sm:text-lg mb-6 line-clamp-4', themeClasses.text)}>
                {item.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t-2">
            <div className="flex flex-col gap-2">
              <div className={cn('text-sm flex items-center gap-2', themeClasses.text)}>
                <Clock className="w-4 h-4" />
                <span className="font-mono">{timeAgo}</span>
              </div>
              <div className={cn('text-sm flex items-center gap-2', themeClasses.text)}>
                <User className="w-4 h-4" />
                <span className="font-mono">{item.source}</span>
              </div>
            </div>

            <Button
              size="lg"
              className={cn(
                'font-mono font-bold text-sm border-2',
                themeClasses.accentBg,
                'hover:scale-105 transition-transform'
              )}
              onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
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
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

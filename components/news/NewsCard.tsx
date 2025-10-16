/**
 * 16-Bit Weather Platform - News Card Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Clock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import CategoryBadge from './CategoryBadge';
import PriorityIndicator from './PriorityIndicator';
import type { NewsItem } from '@/components/NewsTicker/NewsTicker';

interface NewsCardProps {
  item: NewsItem;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export default function NewsCard({ item, variant = 'default', className }: NewsCardProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Calculate time ago
  const timeAgo = getTimeAgo(item.timestamp);

  // Truncate title and description
  const maxTitleLength = variant === 'compact' ? 60 : 80;
  const maxDescriptionLength = variant === 'compact' ? 100 : 150;

  const truncatedTitle =
    item.title.length > maxTitleLength
      ? item.title.substring(0, maxTitleLength).trim() + '...'
      : item.title;

  const truncatedDescription = item.description
    ? item.description.length > maxDescriptionLength
      ? item.description.substring(0, maxDescriptionLength).trim() + '...'
      : item.description
    : '';

  // Priority-based border styles
  const priorityBorderClass =
    item.priority === 'high'
      ? 'border-red-500 hover:border-red-400'
      : item.priority === 'medium'
      ? 'border-yellow-500 hover:border-yellow-400'
      : themeClasses.borderColor;

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'border-2 transition-all hover:shadow-lg cursor-pointer group',
          priorityBorderClass,
          themeClasses.background,
          className
        )}
        onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Image thumbnail */}
            {item.imageUrl && !imageError ? (
              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden border-2 rounded">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div
                className={cn(
                  'w-16 h-16 flex-shrink-0 border-2 rounded flex items-center justify-center',
                  themeClasses.borderColor
                )}
              >
                <CategoryBadge category={item.category as any} />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <PriorityIndicator priority={item.priority} size="sm" />
                <CategoryBadge category={item.category as any} />
              </div>
              <h3
                className={cn(
                  'text-sm font-bold font-mono line-clamp-2 group-hover:underline',
                  themeClasses.headerText
                )}
              >
                {truncatedTitle}
              </h3>
              <p className={cn('text-xs mt-1', themeClasses.text)}>{item.source} • {timeAgo}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn(
        'border-2 transition-all hover:shadow-lg overflow-hidden group flex flex-col h-full',
        priorityBorderClass,
        themeClasses.background,
        className
      )}
    >
      {/* Image */}
      {item.imageUrl && !imageError && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <PriorityIndicator priority={item.priority} size="md" />
          </div>
        </div>
      )}

      {/* Header */}
      <CardHeader className="flex-1">
        <div className="flex gap-2 mb-2 flex-wrap">
          <CategoryBadge category={item.category as any} />
          {!item.imageUrl && <PriorityIndicator priority={item.priority} showLabel size="sm" />}
        </div>
        <CardTitle
          className={cn(
            'text-base sm:text-lg font-bold font-mono line-clamp-3',
            themeClasses.headerText
          )}
        >
          {truncatedTitle}
        </CardTitle>
      </CardHeader>

      {/* Description */}
      {truncatedDescription && (
        <CardContent className="pt-0">
          <p className={cn('text-sm line-clamp-3', themeClasses.text)}>{truncatedDescription}</p>
        </CardContent>
      )}

      {/* Footer */}
      <CardFooter className="flex justify-between items-center border-t-2 pt-4">
        <div className="flex flex-col gap-1">
          <div className={cn('text-xs flex items-center gap-1', themeClasses.text)}>
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
          <div className={cn('text-xs flex items-center gap-1', themeClasses.text)}>
            <User className="w-3 h-3" />
            <span>{item.source}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn('font-mono font-bold text-xs border-2', themeClasses.accentText)}
          onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
        >
          READ MORE <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Format as date if older than 7 days
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

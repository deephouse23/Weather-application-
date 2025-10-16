/**
 * 16-Bit Weather Platform - News Grid Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import NewsCard from './NewsCard';
import NewsEmpty from './NewsEmpty';
import NewsSkeleton from './NewsSkeleton';
import type { NewsItem } from '@/components/NewsTicker/NewsTicker';

interface NewsGridProps {
  items: NewsItem[];
  isLoading?: boolean;
  error?: string | null;
  variant?: 'default' | 'compact';
  emptyType?: 'no-alerts' | 'no-results' | 'error' | 'no-news';
  onRetry?: () => void;
  className?: string;
}

export default function NewsGrid({
  items,
  isLoading = false,
  error = null,
  variant = 'default',
  emptyType = 'no-news',
  onRetry,
  className,
}: NewsGridProps) {
  // Loading state
  if (isLoading && items.length === 0) {
    return <NewsSkeleton count={6} variant={variant === 'compact' ? 'compact' : 'card'} />;
  }

  // Error state
  if (error) {
    return <NewsEmpty type="error" message={error} onRetry={onRetry} />;
  }

  // Empty state
  if (items.length === 0) {
    return <NewsEmpty type={emptyType} />;
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {items.map((item) => (
          <NewsCard key={item.id} item={item} variant="compact" />
        ))}
      </div>
    );
  }

  // Default grid layout
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {items.map((item) => (
        <NewsCard key={item.id} item={item} variant="default" />
      ))}
    </div>
  );
}

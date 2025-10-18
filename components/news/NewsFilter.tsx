/**
 * 16-Bit Weather Platform - News Filter Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { NewsCategory, NewsPriority } from '@/lib/types/news';

interface NewsFilterProps {
  onCategoryChange: (category: NewsCategory | 'all') => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  currentCategory?: NewsCategory | 'all';
  searchQuery?: string;
  isLoading?: boolean;
  className?: string;
}

const categories: { id: NewsCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'alerts', label: 'ALERTS' },
  { id: 'breaking', label: 'BREAKING' },
  { id: 'severe', label: 'SEVERE' },
  { id: 'climate', label: 'CLIMATE' },
  { id: 'local', label: 'LOCAL' },
  { id: 'community', label: 'COMMUNITY' },
];

export default function NewsFilter({
  onCategoryChange,
  onSearchChange,
  onRefresh,
  currentCategory = 'all',
  searchQuery = '',
  isLoading = false,
  className,
}: NewsFilterProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'navigation');

  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  // Debounce search input
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timeout);
  }, [localSearch, onSearchChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Refresh */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4', themeClasses.text)} />
          <Input
            type="text"
            placeholder="Search weather news..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={cn(
              'pl-10 font-mono border-2',
              themeClasses.borderColor,
              themeClasses.background,
              themeClasses.text
            )}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className={cn('border-2 font-mono', themeClasses.borderColor)}
          title="Refresh news"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={currentCategory}
        onValueChange={(value) => onCategoryChange(value as NewsCategory | 'all')}
        className="w-full"
      >
        <TabsList
          className={cn(
            'w-full grid grid-cols-3 sm:grid-cols-7 gap-1 p-1 border-2 font-mono',
            themeClasses.background,
            themeClasses.borderColor
          )}
        >
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className={cn(
                'text-xs sm:text-sm font-bold uppercase tracking-wide border-2 data-[state=active]:border-current transition-all',
                themeClasses.text,
                themeClasses.borderColor
              )}
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Active filters indicator */}
      {(searchQuery || currentCategory !== 'all') && (
        <div className={cn('flex items-center gap-2 text-xs font-mono', themeClasses.text)}>
          <span>Active filters:</span>
          {currentCategory !== 'all' && (
            <span className={cn('px-2 py-1 rounded border', themeClasses.accentText)}>
              {currentCategory.toUpperCase()}
            </span>
          )}
          {searchQuery && (
            <span className={cn('px-2 py-1 rounded border', themeClasses.accentText)}>
              &quot;{searchQuery}&quot;
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
              onCategoryChange('all');
            }}
            className="text-xs font-mono underline"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

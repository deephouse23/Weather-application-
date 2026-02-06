/**
 * 16-Bit Weather Platform - Model Card Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Special card component for displaying weather model graphics (GFS, NHC, etc.)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, RefreshCw, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { NewsItem } from '@/components/NewsTicker/NewsTicker';

interface ModelCardProps {
  item: NewsItem;
  variant?: 'default' | 'featured';
  className?: string;
}

export default function ModelCard({ item, variant = 'default', className }: ModelCardProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'card');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - only calculate time on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const isFeatured = variant === 'featured';

  // Format timestamp - only calculate after mount to prevent hydration mismatch
  const timeAgo = React.useMemo(() => {
    if (!mounted) return '...';
    const now = new Date();
    const diff = now.getTime() - item.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return item.timestamp.toLocaleDateString();
  }, [item.timestamp, mounted]);

  return (
    <div
      className={cn(
        'group relative border-2 overflow-hidden transition-all duration-200',
        themeClasses.borderColor,
        themeClasses.background,
        'hover:scale-[1.02] hover:shadow-lg',
        isFeatured ? 'col-span-full' : '',
        className
      )}
    >
      {/* Model Image */}
      {item.imageUrl && (
        <div
          className={cn(
            'relative w-full bg-black/20',
            isFeatured ? 'h-[400px] md:h-[500px]' : 'h-[300px]'
          )}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className={cn('w-8 h-8 animate-spin', themeClasses.accentText)} />
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <MapPin className={cn('w-12 h-12 mb-2', themeClasses.accentText)} />
              <p className={cn('text-sm font-mono text-center', themeClasses.text)}>
                Model image temporarily unavailable
              </p>
            </div>
          ) : (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className={cn(
                'object-contain transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized // GFS images are external and change frequently
            />
          )}

          {/* Source Badge */}
          <div className="absolute top-3 left-3">
            <div
              className={cn(
                'px-3 py-1 border-2 font-mono text-xs font-bold uppercase',
                themeClasses.borderColor,
                themeClasses.background,
                themeClasses.accentText
              )}
            >
              {item.source}
            </div>
          </div>

          {/* Update Time */}
          <div className="absolute top-3 right-3">
            <div
              className={cn(
                'px-3 py-1 border-2 font-mono text-xs',
                themeClasses.borderColor,
                themeClasses.background,
                themeClasses.text
              )}
            >
              {timeAgo}
            </div>
          </div>
        </div>
      )}

      {/* Model Info */}
      <div className="p-4">
        {/* Title */}
        <h3
          className={cn(
            'font-mono font-bold mb-2 line-clamp-2',
            isFeatured ? 'text-xl md:text-2xl' : 'text-base',
            themeClasses.headerText
          )}
        >
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p
            className={cn(
              'font-mono mb-3 line-clamp-3',
              isFeatured ? 'text-base' : 'text-sm',
              themeClasses.text
            )}
          >
            {item.description}
          </p>
        )}

        {/* View Full Model Button */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 border-2 font-mono text-sm font-bold uppercase',
            'transition-all duration-200',
            themeClasses.borderColor,
            themeClasses.text,
            'hover:scale-105',
            themeClasses.accentText,
            'hover:bg-opacity-10'
          )}
        >
          <span>View Full Model</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Priority Indicator */}
      {item.priority === 'high' && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-1',
            'bg-gradient-to-r from-red-500 to-orange-500'
          )}
        />
      )}
    </div>
  );
}

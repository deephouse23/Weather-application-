/**
 * 16-Bit Weather Platform - Learning Card Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Card component for educational content sections on Learn hub page
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';

interface LearningCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  itemCount?: number;
}

export default function LearningCard({
  href,
  icon: Icon,
  title,
  description,
  itemCount
}: LearningCardProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  return (
    <Link
      href={href}
      className={cn(
        'group block p-6 border-4 transition-all duration-300',
        'hover:scale-105 hover:shadow-lg',
        themeClasses.background,
        themeClasses.borderColor,
        themeClasses.text
      )}
    >
      {/* Icon Section */}
      <div className={cn(
        'w-16 h-16 flex items-center justify-center border-2 mb-4 transition-colors',
        'group-hover:animate-pulse',
        themeClasses.accentBg,
        themeClasses.borderColor
      )}>
        <Icon className="w-8 h-8 text-black" />
      </div>

      {/* Title */}
      <h3 className={cn(
        'text-xl font-bold font-mono uppercase mb-2 transition-colors',
        'group-hover:' + themeClasses.accentText,
        themeClasses.headerText
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn(
        'text-sm font-mono mb-4',
        themeClasses.text
      )}>
        {description}
      </p>

      {/* Item Count Badge (if provided) */}
      {itemCount !== undefined && (
        <div className={cn(
          'inline-block px-3 py-1 border-2 text-xs font-mono font-bold',
          themeClasses.borderColor,
          themeClasses.text
        )}>
          {itemCount} ITEMS
        </div>
      )}

      {/* Learn More Arrow */}
      <div className={cn(
        'mt-4 pt-4 border-t-2 flex items-center justify-between',
        themeClasses.borderColor
      )}>
        <span className={cn(
          'text-sm font-mono font-bold uppercase',
          themeClasses.accentText
        )}>
          EXPLORE
        </span>
        <span className={cn(
          'text-lg font-bold transition-transform group-hover:translate-x-2',
          themeClasses.accentText
        )}>
          →
        </span>
      </div>
    </Link>
  );
}

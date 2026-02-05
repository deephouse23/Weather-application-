/**
 * 16-Bit Weather Platform - Priority Indicator Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewsPriority } from '@/lib/types/news';
import { useTheme } from '@/components/theme-provider';

interface PriorityIndicatorProps {
  priority: NewsPriority;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const priorityConfig: Record<
  NewsPriority,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    textClass: string;
  }
> = {
  high: {
    label: 'URGENT',
    icon: AlertTriangle,
    colorClass: 'text-red-500',
    textClass: 'text-red-600 font-bold',
  },
  medium: {
    label: 'WARNING',
    icon: AlertCircle,
    colorClass: 'text-yellow-500',
    textClass: 'text-yellow-600 font-semibold',
  },
  low: {
    label: 'INFO',
    icon: Info,
    colorClass: 'text-terminal-accent-info',
    textClass: 'text-terminal-accent-info font-normal',
  },
};

export default function PriorityIndicator({
  priority,
  showLabel = false,
  size = 'md',
  className,
}: PriorityIndicatorProps) {
  const { theme } = useTheme();
  const config = priorityConfig[priority];
  const Icon = config.icon;

  // Size classes
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Adjust colors for themes
  const themeColorClass =
    theme === 'miami'
      ? priority === 'high'
        ? 'text-pink-500'
        : priority === 'medium'
        ? 'text-purple-500'
        : 'text-cyan-500'
      : config.colorClass;

  const themeTextClass =
    theme === 'miami'
      ? priority === 'high'
        ? 'text-pink-400'
        : priority === 'medium'
        ? 'text-purple-400'
        : 'text-cyan-400'
      : config.textClass;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon className={cn(sizeClasses[size], themeColorClass)} />
      {showLabel && (
        <span className={cn('text-xs font-mono uppercase tracking-wide', themeTextClass)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

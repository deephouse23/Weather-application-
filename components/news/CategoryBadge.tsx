/**
 * 16-Bit Weather Platform - Category Badge Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React from 'react';
import { Cloud, AlertTriangle, Globe, Users, Thermometer, Wind, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NewsCategory } from '@/lib/types/news';
import { useTheme } from '@/components/theme-provider';

interface CategoryBadgeProps {
  category: NewsCategory;
  className?: string;
}

const categoryConfig: Record<
  NewsCategory,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
  }
> = {
  alerts: {
    label: 'ALERTS',
    icon: Bell,
    colorClass: 'bg-yellow-600 text-black border-yellow-800',
  },
  breaking: {
    label: 'BREAKING',
    icon: AlertTriangle,
    colorClass: 'bg-red-600 text-white border-red-800',
  },
  weather: {
    label: 'WEATHER',
    icon: Cloud,
    colorClass: 'bg-blue-600 text-white border-blue-800',
  },
  severe: {
    label: 'SEVERE',
    icon: AlertTriangle,
    colorClass: 'bg-orange-600 text-white border-orange-800',
  },
  local: {
    label: 'LOCAL',
    icon: Globe,
    colorClass: 'bg-green-600 text-white border-green-800',
  },
  climate: {
    label: 'CLIMATE',
    icon: Thermometer,
    colorClass: 'bg-indigo-600 text-white border-indigo-800',
  },
  tropical: {
    label: 'TROPICAL',
    icon: Wind,
    colorClass: 'bg-cyan-600 text-white border-cyan-800',
  },
  community: {
    label: 'COMMUNITY',
    icon: Users,
    colorClass: 'bg-purple-600 text-white border-purple-800',
  },
  general: {
    label: 'NEWS',
    icon: Globe,
    colorClass: 'bg-gray-600 text-white border-gray-800',
  },
};

export default function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const { theme } = useTheme();
  const config = categoryConfig[category] || categoryConfig.general;
  const Icon = config.icon;

  // Adjust colors for Miami theme
  const themeColorClass =
    theme === 'miami'
      ? category === 'breaking' || category === 'severe' || category === 'alerts'
        ? 'bg-pink-600 text-white border-pink-800'
        : 'bg-purple-600 text-white border-purple-800'
      : theme === 'tron'
      ? 'bg-cyan-500 text-black border-cyan-700'
      : config.colorClass;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide border-2 font-mono',
        themeColorClass,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

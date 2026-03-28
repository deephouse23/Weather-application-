/**
 * 16-Bit Weather Platform - Space Weather Navigation Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Horizontal tab navigation bar for space weather categories
 */

'use client';

import React from 'react';
import { Monitor, Sun, Activity, Wind, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';

export type SpaceWeatherTabId = 'command' | 'solar' | 'geomagnetic' | 'wind' | 'alerts';

interface SpaceWeatherNavProps {
  activeTab: string;
  onTabChange: (tab: SpaceWeatherTabId) => void;
}

const tabs: { id: SpaceWeatherTabId; label: string; icon: React.ElementType }[] = [
  { id: 'command', label: 'Command Center', icon: Monitor },
  { id: 'solar', label: 'Solar Activity', icon: Sun },
  { id: 'geomagnetic', label: 'Geomagnetic', icon: Activity },
  { id: 'wind', label: 'Solar Wind', icon: Wind },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
];

export default function SpaceWeatherNav({ activeTab, onTabChange }: SpaceWeatherNavProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');

  return (
    <nav
      className={cn(
        'container-primary overflow-x-auto scrollbar-none',
        themeClasses.background
      )}
      role="tablist"
      aria-label="Space weather sections"
    >
      <div className="flex min-w-max md:min-w-0">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${id}`}
              onClick={() => onTabChange(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-wider',
                'transition-colors duration-200 whitespace-nowrap',
                'border-b-2 md:flex-1 md:justify-center',
                isActive
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                  : cn(
                      'border-transparent hover:border-gray-600 hover:bg-gray-800/50',
                      themeClasses.text,
                      'opacity-60 hover:opacity-100'
                    )
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-cyan-400' : '')} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

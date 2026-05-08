/**
 * 16-Bit Weather Platform - Turbulence Map Legend
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';

interface LegendItem {
  label: string;
  cssVar: string;
}

const ITEMS: LegendItem[] = [
  { label: 'None/Light', cssVar: '--severity-light' },
  { label: 'Moderate', cssVar: '--severity-moderate' },
  { label: 'Severe', cssVar: '--severity-severe' },
  { label: 'Extreme', cssVar: '--severity-extreme' },
];

export default function TurbulenceLegend() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');

  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono', themeClasses.text)}
      role="list"
      aria-label="Turbulence intensity legend"
    >
      <span className="uppercase font-bold">Turbulence Intensity:</span>
      {ITEMS.map((item) => (
        <div key={item.cssVar} className="flex items-center gap-1" role="listitem">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: `var(${item.cssVar})` }}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

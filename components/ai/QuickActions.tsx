/**
 * 16-Bit Weather Platform - Quick Actions Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Quick action buttons for common AI queries
 */

'use client';

import React from 'react';
import { Plane, Cloud, Thermometer, Wind, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Button } from '@/components/ui/button';

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ElementType;
  category: 'aviation' | 'weather' | 'education';
}

const quickActions: QuickAction[] = [
  {
    id: 'turbulence-check',
    label: 'Check Turbulence',
    prompt: 'What are the current turbulence conditions across the US?',
    icon: AlertTriangle,
    category: 'aviation'
  },
  {
    id: 'flight-conditions',
    label: 'Flight Conditions',
    prompt: 'What are the general flying conditions today?',
    icon: Plane,
    category: 'aviation'
  },
  {
    id: 'weather-forecast',
    label: 'Weather Forecast',
    prompt: 'What\'s the weather forecast for today?',
    icon: Cloud,
    category: 'weather'
  },
  {
    id: 'temperature-extremes',
    label: 'Temperature Extremes',
    prompt: 'What are the hottest and coldest places on Earth right now?',
    icon: Thermometer,
    category: 'weather'
  },
  {
    id: 'jet-stream',
    label: 'Jet Stream',
    prompt: 'Where is the jet stream positioned today and how might it affect weather?',
    icon: Wind,
    category: 'aviation'
  },
  {
    id: 'explain-turbulence',
    label: 'Explain Turbulence',
    prompt: 'What causes clear air turbulence and how can pilots detect it?',
    icon: HelpCircle,
    category: 'education'
  }
];

interface QuickActionsProps {
  onActionClick: (prompt: string) => void;
  disabled?: boolean;
}

export default function QuickActions({ onActionClick, disabled = false }: QuickActionsProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');

  return (
    <div className="space-y-4">
      <h3 className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => onActionClick(action.prompt)}
              disabled={disabled}
              className={cn(
                'h-auto py-3 px-3 flex flex-col items-center gap-2 font-mono text-xs',
                'border-2 transition-all duration-200',
                'hover:scale-105',
                themeClasses.borderColor,
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className={cn('w-5 h-5', themeClasses.accentText)} />
              <span className="text-center leading-tight">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

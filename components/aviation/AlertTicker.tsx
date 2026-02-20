/**
 * 16-Bit Weather Platform - Aviation Alert Ticker Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Scrolling display for SIGMET/AIRMET alerts in teletype format
 */

'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';

export interface AviationAlert {
  id: string;
  type: 'SIGMET' | 'AIRMET' | 'CWA' | 'PIREP';
  severity: 'low' | 'moderate' | 'severe' | 'extreme';
  hazard: string;
  region: string;
  validFrom: string;
  validTo: string;
  text: string;
  rawText?: string;
}

interface AlertTickerProps {
  alerts: AviationAlert[];
  isLoading?: boolean;
}

export default function AlertTicker({ alerts, isLoading = false }: AlertTickerProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Severity color mapping
  const getSeverityColor = (severity: AviationAlert['severity']) => {
    switch (severity) {
      case 'extreme':
        return 'text-red-500 bg-red-500/10';
      case 'severe':
        return 'text-orange-500 bg-orange-500/10';
      case 'moderate':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
      default:
        return 'text-green-500 bg-green-500/10';
    }
  };

  const getAlertIcon = (type: AviationAlert['type']) => {
    switch (type) {
      case 'SIGMET':
        return <AlertTriangle className="w-4 h-4" />;
      case 'PIREP':
        return <Plane className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Typewriter effect for alerts
  useEffect(() => {
    if (alerts.length === 0 || isLoading) return;

    const currentAlert = alerts[currentIndex];
    const fullText = `[${currentAlert.type}] ${currentAlert.hazard.toUpperCase()} - ${currentAlert.region} - VALID ${currentAlert.validFrom} TO ${currentAlert.validTo}`;

    let charIndex = 0;
    setDisplayText('');
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        // Type 2 characters at a time for faster display
        setDisplayText(fullText.slice(0, charIndex + 2));
        charIndex += 2;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);

        // Move to next alert after a pause
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % alerts.length);
        }, 4000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentIndex, alerts, isLoading]);

  if (isLoading) {
    return (
      <div className={cn(
        'border-4 p-3 font-mono',
        themeClasses.borderColor,
        themeClasses.background
      )}>
        <div className="flex items-center gap-2">
          <div className="animate-pulse flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className={cn('text-xs', themeClasses.text)}>LOADING AVIATION ALERTS...</span>
          </div>
          <span className="animate-pulse text-yellow-500">_</span>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className={cn(
        'border-4 p-3 font-mono',
        themeClasses.borderColor,
        themeClasses.background
      )}>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-green-500" />
          <span className={cn('text-xs text-green-500')}>
            NO ACTIVE AVIATION ALERTS - ALL CLEAR
          </span>
        </div>
      </div>
    );
  }

  const currentAlert = alerts[currentIndex];

  return (
    <div className={cn(
      'border-4 p-3 font-mono overflow-hidden',
      themeClasses.borderColor,
      themeClasses.background
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 border-2',
            getSeverityColor(currentAlert.severity),
            themeClasses.borderColor
          )}>
            {getAlertIcon(currentAlert.type)}
          </span>
          <span className={cn(
            'text-xs font-bold uppercase',
            getSeverityColor(currentAlert.severity)
          )}>
            {currentAlert.type}
          </span>
        </div>
        <span className={cn('text-xs', themeClasses.text)}>
          {currentIndex + 1}/{alerts.length}
        </span>
      </div>

      {/* Ticker Display */}
      <div className={cn('text-sm', getSeverityColor(currentAlert.severity))}>
        {displayText}
        {isTyping && <span className="animate-pulse">_</span>}
      </div>

      {/* Alert Counter */}
      <div className="flex gap-1 mt-2">
        {alerts.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'h-1 flex-1 transition-all duration-300',
              idx === currentIndex
                ? themeClasses.accentBg
                : 'bg-gray-700'
            )}
          />
        ))}
      </div>
    </div>
  );
}

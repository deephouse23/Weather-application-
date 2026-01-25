/**
 * 16-Bit Weather Platform - Aviation Page
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Real-time aviation weather alerts and turbulence information
 */

'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import type { AviationAlert } from '@/components/aviation';

// Lazy load the heavy terminal component
const FlightConditionsTerminal = lazy(() => import('@/components/aviation/FlightConditionsTerminal'));

export default function AviationPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  const [alerts, setAlerts] = useState<AviationAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/aviation/alerts');

        if (!response.ok) {
          throw new Error('Failed to fetch aviation alerts');
        }

        const data = await response.json();
        setAlerts(data.alerts || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching aviation alerts:', err);
        setError('Unable to load aviation alerts. Please try again later.');
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageWrapper>
      <div className={cn('container mx-auto px-4 py-8', themeClasses.background)}>
        {/* Header Section */}
        <div className="mb-8">
          <h1
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 font-mono',
              themeClasses.accentText,
              themeClasses.glow
            )}
          >
            AVIATION WEATHER
          </h1>
          <p className={cn('text-base sm:text-lg font-mono max-w-3xl', themeClasses.text)}>
            Real-time aviation weather intelligence. Monitor SIGMETs, AIRMETs, and turbulence
            forecasts with our retro terminal interface. Not for operational flight planning.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className={cn(
            'mb-6 p-4 border-4 border-red-500 bg-red-500/10 font-mono text-sm',
            'text-red-500'
          )}>
            {error}
          </div>
        )}

        {/* Main Terminal */}
        <Suspense fallback={
          <div className={cn('container-primary p-8 text-center font-mono', themeClasses.background)}>
            <div className="animate-pulse">Loading aviation terminal...</div>
          </div>
        }>
          <FlightConditionsTerminal
            alerts={alerts}
            isLoading={isLoading}
          />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

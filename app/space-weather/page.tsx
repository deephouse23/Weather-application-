/**
 * 16-Bit Weather Platform - Space Weather Page
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Real-time space weather monitoring with solar data visualization
 */

'use client';

import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import type { SpaceWeatherAlert } from '@/components/space-weather/SpaceWeatherAlertTicker';
import type { KpIndexData } from '@/components/space-weather/KpIndexGauge';
import type { SolarWindData } from '@/components/space-weather/SolarWindStats';
import type { SunspotData } from '@/components/space-weather/SunspotDisplay';
import type { XRayFluxData } from '@/components/space-weather/XRayFluxChart';
import type { AuroraForecastData } from '@/components/space-weather/AuroraForecastMap';
import type { SpaceWeatherScalesData } from '@/components/space-weather/SpaceWeatherScales';

// Lazy load the heavy terminal component
const SolarCommandTerminal = lazy(() => import('@/components/space-weather/SolarCommandTerminal'));

interface SpaceWeatherData {
  scales: SpaceWeatherScalesData | null;
  alerts: SpaceWeatherAlert[];
  kpIndex: KpIndexData | null;
  solarWind: SolarWindData | null;
  sunspots: SunspotData | null;
  xrayFlux: XRayFluxData | null;
  auroraForecast: AuroraForecastData | null;
}

export default function SpaceWeatherPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  const [data, setData] = useState<SpaceWeatherData>({
    scales: null,
    alerts: [],
    kpIndex: null,
    solarWind: null,
    sunspots: null,
    xrayFlux: null,
    auroraForecast: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all space weather data in parallel
      const [scalesRes, alertsRes, kpRes, windRes, sunspotsRes, xrayRes, auroraRes] = await Promise.allSettled([
        fetch('/api/space-weather/scales'),
        fetch('/api/space-weather/alerts'),
        fetch('/api/space-weather/kp-index'),
        fetch('/api/space-weather/solar-wind'),
        fetch('/api/space-weather/sunspots'),
        fetch('/api/space-weather/xray-flux'),
        fetch('/api/space-weather/aurora'),
      ]);

      // Parse results with error handling for each
      const parseResult = async <T,>(result: PromiseSettledResult<Response>, defaultValue: T): Promise<T> => {
        if (result.status === 'fulfilled' && result.value.ok) {
          try {
            return await result.value.json();
          } catch {
            return defaultValue;
          }
        }
        return defaultValue;
      };

      const scales = await parseResult<SpaceWeatherScalesData | null>(scalesRes, null);
      const alertsData = await parseResult<{ alerts: SpaceWeatherAlert[] }>(alertsRes, { alerts: [] });
      const kpIndex = await parseResult<KpIndexData | null>(kpRes, null);
      const solarWind = await parseResult<SolarWindData | null>(windRes, null);
      const sunspots = await parseResult<SunspotData | null>(sunspotsRes, null);
      const xrayFlux = await parseResult<XRayFluxData | null>(xrayRes, null);
      const auroraForecast = await parseResult<AuroraForecastData | null>(auroraRes, null);

      setData({
        scales,
        alerts: alertsData.alerts || [],
        kpIndex,
        solarWind,
        sunspots,
        xrayFlux,
        auroraForecast,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching space weather data:', err);
      setError('Unable to load space weather data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

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
            SPACE WEATHER
          </h1>
          <p className={cn('text-base sm:text-lg font-mono max-w-3xl', themeClasses.text)}>
            Real-time solar monitoring and space weather intelligence. Track solar flares,
            geomagnetic storms, and aurora forecasts with data from NOAA SWPC, NASA SDO,
            and ESA/NASA SOHO.
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
          <div className={cn('border-4 p-8 text-center font-mono', themeClasses.borderColor, themeClasses.background)}>
            <div className="animate-pulse">Initializing Solar Command Terminal...</div>
          </div>
        }>
          <SolarCommandTerminal
            scales={data.scales}
            alerts={data.alerts}
            kpIndex={data.kpIndex}
            solarWind={data.solarWind}
            sunspots={data.sunspots}
            xrayFlux={data.xrayFlux}
            auroraForecast={data.auroraForecast}
            isLoading={isLoading}
          />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

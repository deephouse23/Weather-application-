/**
 * 16-Bit Weather Platform - Turbulence Map Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Displays turbulence forecast data from NOAA GTG
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { RefreshCw, Plane } from 'lucide-react';

interface TurbulenceDataPoint {
  lat: number;
  lon: number;
  severity: 'smooth' | 'light' | 'moderate' | 'severe' | 'extreme';
  edr: number;
}

interface TurbulenceData {
  success: boolean;
  data: {
    validTime: string;
    altitude: string;
    forecastHour: number;
    turbulence: TurbulenceDataPoint[];
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  source: string;
}

interface TurbulenceMapProps {
  initialAltitude?: string;
  initialForecast?: number;
}

// Severity to color mapping matching PRD
const SEVERITY_COLORS: Record<string, string> = {
  smooth: '#22c55e',   // Green
  light: '#eab308',    // Yellow
  moderate: '#f97316', // Orange
  severe: '#ef4444',   // Red
  extreme: '#a855f7',  // Purple
};

// Map bounds for CONUS
const MAP_BOUNDS = {
  north: 50,
  south: 25,
  east: -65,
  west: -125,
};

export default function TurbulenceMap({
  initialAltitude = 'FL350',
  initialForecast = 0,
}: TurbulenceMapProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  const [altitude, setAltitude] = useState(initialAltitude);
  const [forecast, setForecast] = useState(initialForecast);
  const [data, setData] = useState<TurbulenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const altitudeOptions = [
    { value: 'FL200', label: 'FL200 (20,000 ft)' },
    { value: 'FL250', label: 'FL250 (25,000 ft)' },
    { value: 'FL300', label: 'FL300 (30,000 ft)' },
    { value: 'FL350', label: 'FL350 (35,000 ft)' },
    { value: 'FL400', label: 'FL400 (40,000 ft)' },
    { value: 'FL450', label: 'FL450 (45,000 ft)' },
  ];

  const forecastOptions = [
    { value: 0, label: 'Current' },
    { value: 6, label: '+6 hours' },
    { value: 12, label: '+12 hours' },
    { value: 18, label: '+18 hours' },
  ];

  const fetchTurbulenceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/aviation/turbulence?altitude=${altitude}&forecast=${forecast}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch turbulence data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Turbulence fetch error:', err);
      setError('Unable to load turbulence data');
    } finally {
      setIsLoading(false);
    }
  }, [altitude, forecast]);

  useEffect(() => {
    fetchTurbulenceData();
  }, [fetchTurbulenceData]);

  // Convert lat/lon to SVG coordinates
  const toSvgCoords = useCallback((lat: number, lon: number, width: number, height: number) => {
    const x = ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * width;
    const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * height;
    return { x, y };
  }, []);

  // Render turbulence points as SVG
  const turbulenceOverlay = useMemo(() => {
    if (!data?.data?.turbulence) return null;

    const width = 600;
    const height = 400;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* CONUS outline (simplified) */}
        <path
          d="M50 100 L100 80 L200 70 L300 60 L400 50 L500 60 L550 80 L550 150 L540 200 L500 250 L450 280 L400 300 L350 320 L300 340 L250 350 L200 340 L150 320 L100 280 L70 240 L50 200 L40 150 Z"
          fill="rgba(75, 85, 99, 0.3)"
          stroke="rgba(156, 163, 175, 0.5)"
          strokeWidth="1"
        />

        {/* Turbulence data points */}
        {data.data.turbulence.map((point, index) => {
          const { x, y } = toSvgCoords(point.lat, point.lon, width, height);
          const size = Math.max(8, point.edr * 30);

          return (
            <circle
              key={`turb-${index}`}
              cx={x}
              cy={y}
              r={size}
              fill={SEVERITY_COLORS[point.severity] || SEVERITY_COLORS.smooth}
              opacity={0.7}
            >
              <title>
                {`${point.severity.toUpperCase()}: EDR ${point.edr.toFixed(2)}`}
              </title>
            </circle>
          );
        })}
      </svg>
    );
  }, [data, toSvgCoords]);

  const formatValidTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toUTCString().replace('GMT', 'Z');
    } catch {
      return isoString;
    }
  };

  return (
    <div className={cn('space-y-3', themeClasses.background)}>
      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Altitude Selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="altitude-select"
            className={cn('text-xs font-mono uppercase', themeClasses.text)}
          >
            Altitude:
          </label>
          <select
            id="altitude-select"
            value={altitude}
            onChange={(e) => setAltitude(e.target.value)}
            className={cn(
              'px-2 py-1 text-xs font-mono border-2 rounded bg-gray-900',
              themeClasses.borderColor,
              themeClasses.text
            )}
          >
            {altitudeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Forecast Selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="forecast-select"
            className={cn('text-xs font-mono uppercase', themeClasses.text)}
          >
            Forecast:
          </label>
          <select
            id="forecast-select"
            value={forecast}
            onChange={(e) => setForecast(parseInt(e.target.value, 10))}
            className={cn(
              'px-2 py-1 text-xs font-mono border-2 rounded bg-gray-900',
              themeClasses.borderColor,
              themeClasses.text
            )}
          >
            {forecastOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchTurbulenceData}
          disabled={isLoading}
          className={cn(
            'p-1.5 border-2 rounded hover:bg-gray-700 transition-colors',
            themeClasses.borderColor,
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Refresh turbulence data"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Map Container */}
      <div
        className={cn(
          'relative border-4 rounded-lg overflow-hidden bg-gray-900',
          themeClasses.borderColor
        )}
        style={{ minHeight: '300px' }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Plane className={cn('w-8 h-8 mx-auto mb-2 animate-bounce', themeClasses.accentText)} />
              <div className={cn('text-xs font-mono', themeClasses.text)}>
                Loading Turbulence Data...
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-red-500">
              <div className="text-2xl mb-2">!</div>
              <div className="text-xs font-mono">{error}</div>
            </div>
          </div>
        ) : (
          <>
            {turbulenceOverlay}
            {/* Valid time overlay */}
            {data?.data?.validTime && (
              <div
                className={cn(
                  'absolute bottom-2 left-2 px-2 py-1 text-xs font-mono bg-gray-900/80 rounded',
                  themeClasses.text
                )}
              >
                Valid: {formatValidTime(data.data.validTime)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div className={cn('flex flex-wrap items-center gap-4 text-xs font-mono', themeClasses.text)}>
        <span className="uppercase font-bold">Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span>Smooth</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Light</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span>Severe</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Extreme</span>
        </div>
      </div>

      {/* Source attribution */}
      <div className={cn('text-xs font-mono opacity-60', themeClasses.text)}>
        Data: {data?.source || 'NOAA GTG'}
      </div>
    </div>
  );
}

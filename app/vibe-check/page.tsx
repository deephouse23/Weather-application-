'use client';

/**
 * 16-Bit Weather Platform - Vibe Check Page
 *
 * "What's the vibe today?" — Comfort scoring for your location.
 * Categories: Rough → Meh → Decent → Vibin → Immaculate
 */

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import type { VibeResult } from '@/lib/services/vibe-check';

interface DailyVibe extends VibeResult {
  dt: number;
  highTemp: number;
  lowTemp: number;
  condition: string;
  icon: string;
}

interface VibeData {
  current: VibeResult | null;
  daily: DailyVibe[];
  bestDay: { dt: number; score: number } | null;
  location: string;
}

const categoryColors: Record<string, string> = {
  Immaculate: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  Vibin: 'text-green-400 border-green-500/40 bg-green-500/10',
  Decent: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  Meh: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  Rough: 'text-red-400 border-red-500/40 bg-red-500/10',
};

const categoryEmoji: Record<string, string> = {
  Immaculate: '✨',
  Vibin: '😎',
  Decent: '👍',
  Meh: '😐',
  Rough: '💀',
};

function getDayName(dt: number, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}

function getDayDate(dt: number): string {
  return new Date(dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const breakdownLabels: Record<string, { label: string; icon: string }> = {
  temperature: { label: 'TEMP', icon: '🌡' },
  humidity: { label: 'HUMIDITY', icon: '💧' },
  wind: { label: 'WIND', icon: '💨' },
  precipitation: { label: 'PRECIP', icon: '🌧' },
  uv: { label: 'UV', icon: '☀' },
  clouds: { label: 'CLOUDS', icon: '☁' },
};

export default function VibeCheckPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');
  const [data, setData] = useState<VibeData>({ current: null, daily: [], bestDay: null, location: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  const fetchVibe = useCallback(async () => {
    try {
      // Get user location
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });

      const { latitude, longitude } = pos.coords;
      const response = await fetch(`/api/weather/vibe?lat=${latitude}&lon=${longitude}`);

      if (!response.ok) throw new Error('Failed to fetch vibe data');

      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error('[Vibe Check]', err);
      setError('Could not get your location. Enable location access to check the vibe.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVibe();
  }, [fetchVibe]);

  const displayVibe = selectedDay === 0 ? data.current : data.daily[selectedDay] ?? null;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono uppercase">
            Vibe Check
          </h1>
          <p className="text-sm font-mono text-muted-foreground tracking-wider">
            // OUTDOOR COMFORT SCORE // WHAT&apos;S THE VIBE TODAY?
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <p className="text-lg font-mono text-muted-foreground animate-pulse">
              CHECKING THE VIBE...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-16 border border-border rounded-lg bg-card/30">
            <p className="text-lg font-mono text-orange-400">{error}</p>
          </div>
        )}

        {/* Main Score */}
        {displayVibe && !isLoading && (
          <>
            <div className={cn(
              'border rounded-lg p-8 text-center',
              categoryColors[displayVibe.category]
            )}>
              <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">
                {selectedDay === 0 ? 'Current Vibe' : getDayName(data.daily[selectedDay]?.dt ?? 0, selectedDay)}
              </p>
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="text-5xl">{categoryEmoji[displayVibe.category]}</span>
                <span className="text-7xl md:text-8xl font-extrabold font-mono">{displayVibe.score}</span>
                <span className="text-lg font-mono text-muted-foreground self-end mb-2">/ 100</span>
              </div>
              <p className={cn('text-2xl font-bold font-mono tracking-wider', categoryColors[displayVibe.category]?.split(' ')[0])}>
                {displayVibe.category.toUpperCase()}
              </p>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(displayVibe.breakdown).map(([key, value]) => {
                const info = breakdownLabels[key];
                if (!info) return null;
                const barColor = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : value >= 20 ? 'bg-orange-500' : 'bg-red-500';
                return (
                  <div key={key} className="border border-border rounded-lg p-4 bg-card/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{info.icon}</span>
                      <span className="text-xs font-mono text-muted-foreground tracking-wider">{info.label}</span>
                    </div>
                    <p className="text-2xl font-bold font-mono mb-2">{value}</p>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div className={cn('h-2 rounded-full transition-all', barColor)} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 7-Day Forecast */}
        {data.daily.length > 0 && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-mono tracking-wider uppercase">
              7-Day Vibe Forecast
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {data.daily.map((day, i) => {
                const isSelected = i === selectedDay;
                const isBest = data.bestDay?.dt === day.dt;
                return (
                  <button
                    key={day.dt}
                    onClick={() => setSelectedDay(i)}
                    className={cn(
                      'border rounded-lg p-3 text-center transition-all font-mono',
                      isSelected
                        ? cn('border-2', categoryColors[day.category])
                        : 'border-border bg-card/30 hover:bg-card/60',
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{getDayName(day.dt, i)}</p>
                    <p className="text-xs text-muted-foreground">{getDayDate(day.dt)}</p>
                    <p className={cn(
                      'text-2xl font-extrabold my-1',
                      isSelected ? categoryColors[day.category]?.split(' ')[0] : ''
                    )}>
                      {day.score}
                    </p>
                    <p className="text-xs font-bold">{day.category}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {day.highTemp}° / {day.lowTemp}°
                    </p>
                    {isBest && (
                      <span className="text-xs text-emerald-400 font-bold">BEST</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

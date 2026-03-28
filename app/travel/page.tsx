'use client';

/**
 * 16-Bit Weather Platform - Travel Weather Page
 *
 * Interstate corridor driving conditions map with weather severity scoring,
 * worst corridors ranking, and WPC daily outlook images.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import dynamic from 'next/dynamic';
import { MapSkeleton } from '@/components/skeletons/map-skeleton';
import { useInView } from 'react-intersection-observer';
import WorstCorridors from '@/components/travel/WorstCorridors';
import DailyOutlookImages from '@/components/travel/DailyOutlookImages';
import type { SeverityLevel } from '@/lib/services/travel-corridor-service';

const TravelCorridorMap = dynamic(() => import('@/components/travel/TravelCorridorMap'), {
  ssr: false,
  loading: () => <MapSkeleton height="h-[500px]" />,
});

interface CorridorData {
  name: string;
  score: number;
  level: SeverityLevel;
  color: string;
  hazard: string;
  path: number[][];
  segments: Array<{ lat: number; lon: number; score: number; level: SeverityLevel; color: string }>;
}

interface CorridorsResponse {
  corridors: CorridorData[];
  worstCorridors: CorridorData[];
  forecastDay: number;
  fetchedAt: string;
}

const DAY_LABELS = ['Today', 'Tomorrow', 'Day 3'];

export default function TravelPage() {
  const { theme } = useTheme();
  getComponentStyles((theme || 'nord') as ThemeType, 'weather');

  const [day, setDay] = useState(0);
  const [data, setData] = useState<CorridorsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
    threshold: 0,
  });

  const fetchCorridors = useCallback(async (forecastDay: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/travel/corridors?day=${forecastDay}`, { signal: controller.signal });
      if (!res.ok) throw new Error('Failed to fetch corridor data');
      const result: CorridorsResponse = await res.json();
      if (controller.signal.aborted) return;
      setData(result);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('[Travel]', err);
      setError('Unable to load travel corridor data');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCorridors(day);
  }, [day, fetchCorridors]);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono uppercase">Travel Weather</h1>
          <p className="text-sm font-mono text-muted-foreground tracking-wider">// INTERSTATE DRIVING CONDITIONS &amp; OUTLOOKS</p>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 justify-center">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDay(i)}
              className={cn(
                'px-5 py-2 rounded-lg font-mono text-sm font-bold transition-colors',
                day === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/50 text-muted-foreground hover:bg-card/80 border border-border'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-center py-8 border border-border rounded-lg bg-card/30">
            <p className="text-sm font-mono text-orange-400">{error}</p>
          </div>
        )}

        {/* Corridor Map */}
        <div ref={ref} style={{ minHeight: '500px', contain: 'layout style paint' }}>
          {inView ? (
            <TravelCorridorMap
              corridors={data?.corridors ?? []}
              isLoading={isLoading}
            />
          ) : (
            <MapSkeleton height="h-[500px]" />
          )}
        </div>

        {/* Worst Corridors - hidden during error state */}
        {!error && (
          <WorstCorridors
            corridors={data?.worstCorridors ?? []}
            isLoading={isLoading}
          />
        )}

        {/* Daily Outlook Images */}
        <DailyOutlookImages />

        {data?.fetchedAt && (
          <p className="text-center text-xs font-mono text-muted-foreground">
            Last updated: {new Date(data.fetchedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </PageWrapper>
  );
}

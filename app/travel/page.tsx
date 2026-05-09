'use client';

/**
 * 16-Bit Weather Platform - Travel Hub Page
 *
 * Unified hub for "will my trip suck?" — Fly mode shows the airport misery board,
 * Drive mode shows the interstate corridor map + outlook images. A shared trip
 * planner (origin → destination) sits above the mode toggle.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import PageWrapper from '@/components/page-wrapper';
import dynamic from 'next/dynamic';
import { MapSkeleton } from '@/components/skeletons/map-skeleton';
import { useInView } from 'react-intersection-observer';
import WorstCorridors from '@/components/travel/WorstCorridors';
import DailyOutlookImages from '@/components/travel/DailyOutlookImages';
import TravelHub from '@/components/travel/TravelHub';
import TripInput from '@/components/travel/TripInput';
import TripScoreCard from '@/components/travel/TripScoreCard';
import { AirportMiseryBoard } from '@/components/aviation';
import type { TripScoreResponse } from '@/components/travel/trip-types';
import type { SeverityLevel } from '@/lib/services/travel-corridor-service';
import { ShareButtons } from '@/components/share-buttons';

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
  const [tripResult, setTripResult] = useState<TripScoreResponse | null>(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState<string | null>(null);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ShareButtons
          config={{
            title: 'Travel Hub',
            text: 'Plan your trip — flight delays, road conditions, and weather misery scoring at 16bitweather.co',
            url: 'https://www.16bitweather.co/travel',
          }}
          className="mb-6 justify-center"
        />

        <TravelHub
          tripInput={
            <TripInput
              onResult={(result) => {
                setTripResult(result);
                setTripError(null);
              }}
              onLoadingChange={setTripLoading}
              onError={(message) => {
                setTripError(message);
                setTripResult(null);
              }}
            />
          }
          tripResult={
            tripError ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 font-mono text-sm text-destructive"
              >
                {tripError}
              </div>
            ) : tripResult || tripLoading ? (
              <TripScoreCard result={tripResult ?? createPlaceholder()} isLoading={tripLoading && !tripResult} />
            ) : null
          }
          flyContent={<FlyContent />}
          driveContent={<DriveContent />}
        />
      </div>
    </PageWrapper>
  );
}

/* Placeholder used while tripLoading is true and we don't yet have a result.
   TripScoreCard will render its skeleton state and ignore the placeholder shape. */
function createPlaceholder(): TripScoreResponse {
  const placeholderMisery = {
    score: 0,
    level: 'green' as const,
    color: '#22c55e',
    label: 'SMOOTH',
    drivers: [],
    context: 'route' as const,
  };
  return {
    mode: 'drive',
    score: placeholderMisery,
    route: { corridorName: '', segments: [] },
    worstSegment: { lat: 0, lon: 0, score: placeholderMisery, hazard: '' },
  };
}

/* -------------------------------------------------------------------------- */
/* Fly mode content                                                            */
/* -------------------------------------------------------------------------- */

function FlyContent() {
  return (
    <div className="space-y-8">
      <AirportMiseryBoard />
      <div className="text-center">
        <Link
          href="/aviation"
          className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border bg-card/50 hover:bg-card font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          Open detail console (SIGMETs · turbulence · METARs) →
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Drive mode content (preserves existing corridor map + outlooks UI)          */
/* -------------------------------------------------------------------------- */

function DriveContent() {
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

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
          // Interstate driving conditions &amp; outlooks
        </p>
      </div>

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

      <div ref={ref} style={{ minHeight: '500px', contain: 'layout style paint' }}>
        {inView ? (
          <TravelCorridorMap corridors={data?.corridors ?? []} isLoading={isLoading} />
        ) : (
          <MapSkeleton height="h-[500px]" />
        )}
      </div>

      {!error && (
        <WorstCorridors corridors={data?.worstCorridors ?? []} isLoading={isLoading} />
      )}

      <DailyOutlookImages />

      {data?.fetchedAt && (
        <p className="text-center text-xs font-mono text-muted-foreground">
          Last updated: {new Date(data.fetchedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

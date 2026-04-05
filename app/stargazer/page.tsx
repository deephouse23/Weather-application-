'use client';

/**
 * 16-Bit Weather Platform - Stargazer Page
 *
 * Astrophotography forecast: tonight's conditions including seeing,
 * transparency, moon phase, planet visibility, deep sky targets,
 * ISS passes, and upcoming launches.
 */

import React, { useEffect, useState, useCallback, startTransition } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import { ShareButtons } from '@/components/share-buttons';
import type { StargazerData } from '@/lib/stargazer/types';
import FullHourlyTimeline from '@/components/stargazer/HourlyTimeline';

// ============================================================================
// Score color helpers
// ============================================================================

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  if (score >= 60) return 'text-green-400 border-green-500/40 bg-green-500/10';
  if (score >= 40) return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
  if (score >= 20) return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
  return 'text-red-400 border-red-500/40 bg-red-500/10';
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-400';
  if (score >= 60) return 'bg-green-400';
  if (score >= 40) return 'bg-yellow-400';
  if (score >= 20) return 'bg-orange-400';
  return 'bg-red-400';
}

function formatTime(date: Date | string | null): string {
  if (!date) return '--:--';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ============================================================================
// Sub-components
// ============================================================================

function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="border-2 border-border/40 bg-black/20 p-4 animate-pulse">
      <div className="h-5 w-1/3 bg-white/10 rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 w-full bg-white/10 rounded mb-2" />
      ))}
    </div>
  );
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('border-2 border-border/40 bg-black/20 p-4 sm:p-6', className)}>
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 font-mono">
        {title}
      </h2>
      {children}
    </div>
  );
}

// 1. Hero - StargazerScore
function StargazerScoreHero({ data }: { data: StargazerData }) {
  const { score, darkWindow, location } = data;
  return (
    <div className={cn('border-4 p-6 sm:p-8 text-center', scoreColor(score.overall))}>
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
        Tonight&apos;s Stargazing Forecast
        {location.name ? ` -- ${location.name}` : ''}
      </p>
      <div className="text-7xl sm:text-8xl font-extrabold font-mono tabular-nums leading-none mb-2">
        {Math.round(score.overall)}
      </div>
      <div className="text-xl sm:text-2xl font-bold font-mono mb-3">{score.label}</div>
      <p className="text-sm font-mono max-w-xl mx-auto text-muted-foreground mb-4">
        {score.summary}
      </p>

      {/* Sub-scores */}
      <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto text-xs font-mono">
        {Object.entries(score.subScores).map(([key, val]) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span className="uppercase text-muted-foreground">{key}</span>
            <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
              <div className={cn('h-full rounded', scoreBarColor(val))} style={{ width: `${val}%` }} />
            </div>
            <span>{Math.round(val)}</span>
          </div>
        ))}
      </div>

      {/* Dark window */}
      {darkWindow && (
        <p className="mt-4 text-xs font-mono text-muted-foreground">
          Dark window: {formatTime(darkWindow.astronomicalDusk)} &ndash;{' '}
          {formatTime(darkWindow.astronomicalDawn)}
        </p>
      )}
    </div>
  );
}

// 2. HourlyTimeline - uses full component from components/stargazer/
function HourlyTimeline({ data }: { data: StargazerData }) {
  const { hourlyConditions, darkWindow } = data;
  if (!hourlyConditions || hourlyConditions.length === 0) return null;

  // Rehydrate dates from JSON serialization
  const conditions = hourlyConditions.map((h) => ({
    ...h,
    time: typeof h.time === 'string' ? new Date(h.time) : h.time,
  }));

  const rehydratedDarkWindow = {
    sunset: typeof darkWindow.sunset === 'string' ? new Date(darkWindow.sunset) : darkWindow.sunset,
    sunrise: typeof darkWindow.sunrise === 'string' ? new Date(darkWindow.sunrise) : darkWindow.sunrise,
    astronomicalDusk: typeof darkWindow.astronomicalDusk === 'string' ? new Date(darkWindow.astronomicalDusk) : darkWindow.astronomicalDusk,
    astronomicalDawn: typeof darkWindow.astronomicalDawn === 'string' ? new Date(darkWindow.astronomicalDawn) : darkWindow.astronomicalDawn,
  };

  return <FullHourlyTimeline conditions={conditions} darkWindow={rehydratedDarkWindow} />;
}

// 3. MoonIntel
function MoonIntel({ data }: { data: StargazerData }) {
  const { moon } = data;
  if (!moon) return null;

  return (
    <SectionCard title="Moon Intel">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-mono">
        <div>
          <span className="text-muted-foreground block text-xs">Phase</span>
          <span className="font-bold">{moon.phaseName}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Illumination</span>
          <span className="font-bold">{Math.round(moon.illumination)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Rise</span>
          <span>{formatTime(moon.rise)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Set</span>
          <span>{formatTime(moon.set)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Moon Up (Dark Window)</span>
          <span>{Math.round(moon.moonUpDuringDarkWindowPercent)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Next New Moon</span>
          <span>{formatDate(moon.nextNewMoon)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Next Full Moon</span>
          <span>{formatDate(moon.nextFullMoon)}</span>
        </div>
      </div>
    </SectionCard>
  );
}

// 4. PlanetTable
function PlanetTable({ data }: { data: StargazerData }) {
  const { planets } = data;
  if (!planets || planets.length === 0) return null;

  return (
    <SectionCard title="Planet Visibility">
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full text-xs font-mono min-w-[500px]">
          <thead>
            <tr className="text-muted-foreground border-b border-border/40">
              <th className="text-left py-2 pr-3">Planet</th>
              <th className="text-left py-2 pr-3">Rise</th>
              <th className="text-left py-2 pr-3">Set</th>
              <th className="text-right py-2 pr-3">Peak Alt</th>
              <th className="text-right py-2 pr-3">Mag</th>
              <th className="text-left py-2">Constellation</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((p) => (
              <tr key={p.name} className="border-b border-border/20">
                <td className="py-2 pr-3 font-bold">{p.name}</td>
                <td className="py-2 pr-3">{formatTime(p.rise)}</td>
                <td className="py-2 pr-3">{formatTime(p.set)}</td>
                <td className="py-2 pr-3 text-right">{Math.round(p.peakAltitude)}&deg;</td>
                <td className="py-2 pr-3 text-right">{p.magnitude.toFixed(1)}</td>
                <td className="py-2">{p.constellation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {planets.some((p) => p.notes) && (
        <div className="mt-3 text-xs font-mono text-muted-foreground space-y-1">
          {planets
            .filter((p) => p.notes)
            .map((p) => (
              <p key={p.name}>
                <span className="font-bold">{p.name}:</span> {p.notes}
              </p>
            ))}
        </div>
      )}
    </SectionCard>
  );
}

// 5. DeepSkyHighlights
function DeepSkyHighlights({ data }: { data: StargazerData }) {
  const { deepSkyHighlights } = data;
  if (!deepSkyHighlights || deepSkyHighlights.length === 0) return null;

  const difficultyColor: Record<string, string> = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-orange-400',
  };

  return (
    <SectionCard title="Deep Sky Highlights">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deepSkyHighlights.map((obj) => (
          <div key={obj.id} className="border border-border/30 bg-black/10 p-3">
            <div className="flex items-start justify-between mb-1">
              <div>
                <span className="text-sm font-bold font-mono">{obj.name}</span>
                {obj.altNames.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {obj.altNames[0]}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] uppercase font-mono',
                  difficultyColor[obj.difficulty] || 'text-muted-foreground'
                )}
              >
                {obj.difficulty}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mb-2">
              {obj.type.replace(/_/g, ' ')} in {obj.constellation}
            </p>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-muted-foreground">
              <div>Mag {obj.magnitude.toFixed(1)}</div>
              <div>Alt {Math.round(obj.maxAltitude)}&deg;</div>
              <div>Transit {formatTime(obj.transitTime)}</div>
            </div>
            <p className="mt-2 text-xs font-mono text-muted-foreground leading-relaxed">
              {obj.description}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// 6. SkyEvents
function SkyEvents({ data }: { data: StargazerData }) {
  const { skyEvents, meteorShowers } = data;
  const hasEvents = (skyEvents && skyEvents.length > 0) || (meteorShowers && meteorShowers.length > 0);
  if (!hasEvents) return null;

  const typeIcon: Record<string, string> = {
    meteor_shower: '☄',
    conjunction: '☍',
    opposition: '☍',
    lunar_eclipse: '🌑',
    solar_eclipse: '🌒',
    equinox: '⚖',
    solstice: '☀',
  };

  return (
    <SectionCard title="Sky Events">
      <div className="space-y-3">
        {/* Meteor showers first */}
        {meteorShowers &&
          meteorShowers.map((ms) => (
            <div key={ms.name} className="border border-border/30 bg-black/10 p-3 text-xs font-mono">
              <div className="flex items-center gap-2 mb-1">
                <span>☄</span>
                <span className="font-bold">{ms.name}</span>
                <span className="text-muted-foreground">Peak: {ms.peak}</span>
              </div>
              <p className="text-muted-foreground">{ms.description}</p>
              <div className="flex gap-4 mt-1 text-muted-foreground">
                <span>ZHR: {ms.zhr}</span>
                <span>Speed: {ms.speed} km/s</span>
                <span>Moon: {ms.moonInterference}</span>
              </div>
            </div>
          ))}
        {/* Other sky events */}
        {skyEvents &&
          skyEvents.map((evt, i) => (
            <div key={i} className="border border-border/30 bg-black/10 p-3 text-xs font-mono">
              <div className="flex items-center gap-2 mb-1">
                <span>{typeIcon[evt.type] || '★'}</span>
                <span className="font-bold">{evt.title}</span>
                <span className="text-muted-foreground">{formatDate(evt.date)}</span>
              </div>
              <p className="text-muted-foreground">{evt.description}</p>
            </div>
          ))}
      </div>
    </SectionCard>
  );
}

// 7. ISSPasses
function ISSPasses({ data }: { data: StargazerData }) {
  const { issPasses } = data;
  if (!issPasses || issPasses.length === 0) return null;

  return (
    <SectionCard title="ISS Passes">
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full text-xs font-mono min-w-[450px]">
          <thead>
            <tr className="text-muted-foreground border-b border-border/40">
              <th className="text-left py-2 pr-3">Date</th>
              <th className="text-left py-2 pr-3">Rise</th>
              <th className="text-right py-2 pr-3">Max El</th>
              <th className="text-left py-2 pr-3">Set</th>
              <th className="text-right py-2">Mag</th>
            </tr>
          </thead>
          <tbody>
            {issPasses.map((pass, i) => (
              <tr key={i} className="border-b border-border/20">
                <td className="py-2 pr-3">{formatDate(pass.date)}</td>
                <td className="py-2 pr-3">
                  {formatTime(pass.riseTime)} {pass.riseDirection}
                </td>
                <td className="py-2 pr-3 text-right">{Math.round(pass.maxElevation)}&deg;</td>
                <td className="py-2 pr-3">
                  {formatTime(pass.setTime)} {pass.setDirection}
                </td>
                <td className="py-2 text-right">{pass.brightness.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// 8. LaunchSchedule
function LaunchSchedule({ data }: { data: StargazerData }) {
  const { launches } = data;
  if (!launches || launches.length === 0) return null;

  return (
    <SectionCard title="Upcoming Launches">
      <div className="space-y-3">
        {launches.map((launch) => (
          <div key={launch.id} className="border border-border/30 bg-black/10 p-3 text-xs font-mono">
            <div className="flex items-start justify-between mb-1">
              <span className="font-bold">{launch.name}</span>
              <span className="text-muted-foreground shrink-0 ml-2">
                {formatDateTime(launch.net)}
              </span>
            </div>
            <div className="text-muted-foreground space-y-0.5">
              <p>
                {launch.provider} -- {launch.vehicle}
              </p>
              <p>{launch.padLocation}</p>
              {launch.missionDescription && (
                <p className="mt-1">{launch.missionDescription}</p>
              )}
            </div>
            <div className="flex gap-3 mt-1">
              <span
                className={cn(
                  'text-[10px] uppercase px-1.5 py-0.5 border',
                  launch.status === 'Go'
                    ? 'text-green-400 border-green-500/40'
                    : 'text-yellow-400 border-yellow-500/40'
                )}
              >
                {launch.status}
              </span>
              {launch.isCrewed && (
                <span className="text-[10px] uppercase px-1.5 py-0.5 border text-cyan-400 border-cyan-500/40">
                  Crewed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// 9. Attribution
function StargazerAttribution() {
  return (
    <div className="text-[10px] font-mono text-muted-foreground mt-8 border-t border-border/30 pt-4 space-y-1">
      <p>
        Data sources: 7Timer (astro forecasts), Astronomy Engine (celestial mechanics),
        CelesTrak (ISS TLE), Launch Library 2 (launches).
      </p>
      <p>
        Forecast accuracy depends on atmospheric models and may vary from actual conditions.
        Always verify conditions before planning observation sessions.
      </p>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function StargazerPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');
  const [data, setData] = useState<StargazerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user location via browser geolocation
      let latitude: number;
      let longitude: number;
      let usedFallback = false;

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // Geolocation failed -- fall back to NYC
        latitude = 40.7128;
        longitude = -74.006;
        usedFallback = true;
      }

      const response = await fetch(
        `/api/stargazer?lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();
      setData(json);

      if (usedFallback) {
        setError(
          'Could not determine your location. Showing forecast for New York City. Enable location access for personalized forecasts.'
        );
      }
    } catch (err) {
      console.error('[Stargazer]', err);
      setError(
        'Failed to load stargazer forecast. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchData();
    });
  }, [fetchData]);

  return (
    <PageWrapper>
      <div className={cn('container mx-auto px-4 py-8', themeClasses.background)}>
        {/* Header */}
        <div className="mb-8">
          <h1
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 font-mono',
              themeClasses.accentText,
              themeClasses.glow
            )}
          >
            STARGAZER
          </h1>
          <p className={cn('text-base sm:text-lg font-mono max-w-3xl', themeClasses.text)}>
            Tonight&apos;s astrophotography forecast. Seeing, transparency, moon phase, planet
            visibility, deep sky targets, ISS passes, and upcoming launches -- all in one place.
          </p>
        </div>
        <ShareButtons
          config={{
            title: 'Stargazer - Astrophotography Forecast',
            text: "Tonight's stargazing conditions at 16bitweather.co",
            url: 'https://www.16bitweather.co/stargazer',
          }}
          className="mt-3 mb-6"
        />

        {/* Error */}
        {error && (
          <div
            className={cn(
              'mb-6 p-4 border-4 border-red-500 bg-red-500/10 font-mono text-sm text-red-500'
            )}
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            <SkeletonCard rows={5} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard rows={4} />
              <SkeletonCard rows={4} />
            </div>
            <SkeletonCard rows={6} />
          </div>
        )}

        {/* Content */}
        {data && !isLoading && (
          <div className="space-y-6">
            {/* 1. Hero Score */}
            <StargazerScoreHero data={data} />

            {/* 2. Hourly Timeline */}
            <HourlyTimeline data={data} />

            {/* 3-4. Moon and Planets side by side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoonIntel data={data} />
              <PlanetTable data={data} />
            </div>

            {/* 5. Deep Sky */}
            <DeepSkyHighlights data={data} />

            {/* 6. Sky Events */}
            <SkyEvents data={data} />

            {/* 7-8. ISS and Launches side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ISSPasses data={data} />
              <LaunchSchedule data={data} />
            </div>

            {/* 9. Attribution */}
            <StargazerAttribution />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

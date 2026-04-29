'use client';

/**
 * Live dashboard body for the /situation page — polls /api/weather/alerts
 * every 5 minutes and renders the WIS score, severity breakdown, and alert
 * list. Everything above (page chrome) is server-rendered.
 */
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NWSAlert, WISScore } from '@/lib/services/nws-alerts-service';

interface SituationData {
  alerts: NWSAlert[];
  wis: WISScore | null;
  total: number;
}

const levelColors: Record<string, string> = {
  green: 'text-green-400 border-green-500/40',
  yellow: 'text-yellow-400 border-yellow-500/40',
  orange: 'text-orange-400 border-orange-500/40',
  red: 'text-red-400 border-red-500/40',
};

const levelBg: Record<string, string> = {
  green: 'bg-green-500/10',
  yellow: 'bg-yellow-500/10',
  orange: 'bg-orange-500/10',
  red: 'bg-red-500/10',
};

const severityBadge: Record<string, string> = {
  Extreme: 'bg-red-500/20 text-red-400 border-red-500/50',
  Severe: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  Moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  Minor: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
};

function getTimeRemaining(expires: string): string {
  const now = Date.now();
  const exp = new Date(expires).getTime();
  const diff = exp - now;
  if (diff <= 0) return 'EXPIRED';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export default function SituationDashboard() {
  const [data, setData] = useState<SituationData>({ alerts: [], wis: null, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/weather/alerts');
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('[Situation]', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const wis = data.wis;

  const severityOrder: Record<string, number> = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3 };
  const sortedAlerts = [...data.alerts].sort((a, b) =>
    (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  );

  const severityCounts = data.alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {wis && (
        <div className={cn(
          'border rounded-lg p-6 md:p-8',
          levelBg[wis.level],
          levelColors[wis.level]
        )}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1">
              <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                Weather Intensity Score
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl md:text-7xl font-extrabold font-mono">{wis.score}</span>
                <span className="text-lg font-mono text-muted-foreground">/ 100</span>
              </div>
              <p className={cn('text-lg font-bold font-mono tracking-wider', levelColors[wis.level])}>
                {wis.label}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold font-mono">{wis.nwsWarnings ?? wis.activeWarnings}</p>
                <p className="text-xs font-mono text-muted-foreground uppercase">NWS warnings</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold font-mono">{wis.nwsWatches ?? wis.activeWatches}</p>
                <p className="text-xs font-mono text-muted-foreground uppercase">NWS watches</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold font-mono">{wis.nwsAdvisories ?? wis.activeAdvisories}</p>
                <p className="text-xs font-mono text-muted-foreground uppercase">Other products</p>
              </div>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground text-center mt-2 max-w-xl mx-auto">
              Counts use NWS product names (watch/warning). Severity tiles still drive the WIS score — see{' '}
              <Link href="/warnings" className="underline text-primary">Warnings command center</Link> for full text and maps.
            </p>
          </div>
        </div>
      )}

      {Object.keys(severityCounts).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {['Extreme', 'Severe', 'Moderate', 'Minor'].map((sev) => {
            const count = severityCounts[sev];
            if (!count) return null;
            return (
              <span
                key={sev}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-sm font-mono font-bold',
                  severityBadge[sev]
                )}
              >
                {count} {sev.toUpperCase()}
              </span>
            );
          })}
          <span className="px-3 py-1.5 rounded-full border border-border text-sm font-mono text-muted-foreground">
            {data.total} TOTAL ALERTS
          </span>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-lg font-mono text-muted-foreground animate-pulse">
            ACQUIRING WEATHER INTELLIGENCE...
          </p>
        </div>
      )}

      {!isLoading && sortedAlerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono tracking-wider uppercase">
              Active Alerts
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {sortedAlerts.length} active
            </span>
          </div>

          <div className="grid gap-3">
            {sortedAlerts.map((alert, i) => (
              <div
                key={alert.id || i}
                className={cn(
                  'border rounded-lg p-4 transition-colors',
                  'bg-card/50 hover:bg-card/80',
                  'border-border'
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground w-8">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-mono font-bold border',
                      severityBadge[alert.severity]
                    )}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-sm truncate">
                      {alert.event}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      {alert.areaDesc}
                    </p>
                  </div>

                  {alert.expires && (
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      {getTimeRemaining(alert.expires)}
                    </span>
                  )}
                </div>

                {alert.headline && (
                  <p className="mt-2 text-xs font-mono text-muted-foreground line-clamp-2">
                    {alert.headline}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && sortedAlerts.length === 0 && (
        <div className="text-center py-12 border border-border rounded-lg bg-card/30">
          <p className="text-lg font-mono text-green-400 font-bold">ALL CLEAR</p>
          <p className="text-sm font-mono text-muted-foreground mt-2">
            No active weather alerts across the United States
          </p>
        </div>
      )}
    </>
  );
}

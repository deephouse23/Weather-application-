'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { HourlyCondition, DarkWindow } from '@/lib/stargazer/types';

interface HourlyTimelineProps {
  conditions: HourlyCondition[];
  darkWindow: DarkWindow;
}

type MetricKey =
  | 'cloudCover'
  | 'cloudCoverLow'
  | 'cloudCoverMid'
  | 'cloudCoverHigh'
  | 'seeing'
  | 'transparency'
  | 'windSpeed'
  | 'humidity'
  | 'temperature'
  | 'dewRisk';

const metricLabels: Record<MetricKey, string> = {
  cloudCover: 'Cloud Cover',
  cloudCoverLow: 'Low Clouds',
  cloudCoverMid: 'Mid Clouds',
  cloudCoverHigh: 'High Clouds',
  seeing: 'Seeing',
  transparency: 'Transparency',
  windSpeed: 'Wind',
  humidity: 'Humidity',
  temperature: 'Temp',
  dewRisk: 'Dew Risk',
};

function getCellColor(metric: MetricKey, value: number | string): string {
  if (metric === 'dewRisk') {
    if (value === 'low') return 'bg-green-600';
    if (value === 'moderate') return 'bg-yellow-600';
    return 'bg-red-600';
  }

  if (metric === 'seeing' || metric === 'transparency') {
    const v = value as number;
    if (v >= 4) return 'bg-green-600';
    if (v >= 3) return 'bg-yellow-600';
    if (v >= 2) return 'bg-orange-600';
    return 'bg-red-600';
  }

  if (metric === 'windSpeed') {
    const v = value as number;
    if (v <= 10) return 'bg-green-600';
    if (v <= 20) return 'bg-yellow-600';
    if (v <= 30) return 'bg-orange-600';
    return 'bg-red-600';
  }

  if (metric === 'humidity') {
    const v = value as number;
    if (v <= 60) return 'bg-green-600';
    if (v <= 75) return 'bg-yellow-600';
    if (v <= 85) return 'bg-orange-600';
    return 'bg-red-600';
  }

  if (metric === 'temperature') {
    return 'bg-blue-600';
  }

  // Cloud cover metrics (lower is better)
  const v = value as number;
  if (v <= 20) return 'bg-green-600';
  if (v <= 50) return 'bg-yellow-600';
  if (v <= 75) return 'bg-orange-600';
  return 'bg-red-600';
}

function formatCellValue(metric: MetricKey, value: number | string): string {
  if (metric === 'dewRisk') return String(value).charAt(0).toUpperCase();
  if (metric === 'temperature') return `${Math.round(value as number)}°`;
  if (metric === 'windSpeed') return `${Math.round(value as number)}`;
  if (metric === 'humidity' || metric.startsWith('cloudCover'))
    return `${Math.round(value as number)}%`;
  return String(Math.round(value as number));
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const metrics: MetricKey[] = [
  'cloudCover',
  'cloudCoverLow',
  'cloudCoverMid',
  'cloudCoverHigh',
  'seeing',
  'transparency',
  'windSpeed',
  'humidity',
  'temperature',
  'dewRisk',
];

export default function HourlyTimeline({
  conditions,
  darkWindow,
}: HourlyTimelineProps) {
  const { theme } = useTheme();
  const styles = getComponentStyles((theme || 'nord') as ThemeType, 'card');

  if (!conditions || conditions.length === 0) {
    return (
      <div
        className={cn(
          'border-4 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 font-mono',
          styles
        )}
      >
        <h2 className="text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
          Hourly Forecast
        </h2>
        <p className="mt-2 text-xs text-[hsl(var(--text))]">
          No hourly data available.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-4 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 font-mono',
        styles
      )}
    >
      <h2 className="mb-1 text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
        Hourly Forecast
      </h2>
      <p className="mb-3 text-xs text-[hsl(var(--text))]">
        Dark window: {formatTime(darkWindow.sunset)} &ndash;{' '}
        {formatTime(darkWindow.sunrise)}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[hsl(var(--bg))] px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                Metric
              </th>
              {conditions.map((c, i) => (
                <th
                  key={i}
                  className="min-w-[3rem] px-1 py-1 text-center text-[hsl(var(--text))]"
                >
                  {formatTime(c.time)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric}>
                <td className="sticky left-0 bg-[hsl(var(--bg))] px-2 py-1 uppercase tracking-wider text-[hsl(var(--muted))]">
                  {metricLabels[metric]}
                </td>
                {conditions.map((c, i) => {
                  const raw = c[metric as keyof HourlyCondition];
                  const value =
                    raw instanceof Date ? raw.toISOString() : raw;
                  return (
                    <td
                      key={i}
                      className={cn(
                        'border border-[hsl(var(--border))] px-1 py-1 text-center text-white',
                        getCellColor(metric, value as number | string)
                      )}
                    >
                      {formatCellValue(metric, value as number | string)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

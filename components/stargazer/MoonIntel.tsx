'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { MoonInfo } from '@/lib/stargazer/types';

interface MoonIntelProps {
  moon: MoonInfo;
}

function formatTime(date: Date | null): string {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function daysUntil(target: Date): number {
  const now = new Date();
  const diff = new Date(target).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function MoonIntel({ moon }: MoonIntelProps) {
  const { theme } = useTheme();
  const styles = getComponentStyles((theme || 'nord') as ThemeType, 'card');

  return (
    <div
      className={cn(
        'border-4 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 font-mono',
        styles
      )}
    >
      <h2 className="mb-3 text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
        Moon Intel
      </h2>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="uppercase tracking-wider text-[hsl(var(--muted))]">Phase</p>
          <p className="text-lg font-bold text-[hsl(var(--primary))]">
            {moon.phaseName}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-[hsl(var(--muted))]">
            Illumination
          </p>
          <p className="text-lg font-bold text-[hsl(var(--text))]">
            {Math.round(moon.illumination)}%
          </p>
        </div>

        <div>
          <p className="uppercase tracking-wider text-[hsl(var(--muted))]">Moonrise</p>
          <p className="text-[hsl(var(--text))]">{formatTime(moon.rise)}</p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-[hsl(var(--muted))]">Moonset</p>
          <p className="text-[hsl(var(--text))]">{formatTime(moon.set)}</p>
        </div>

        <div className="col-span-2 border-t-2 border-[hsl(var(--border))] pt-2">
          <p className="uppercase tracking-wider text-[hsl(var(--muted))]">
            Dark Window
          </p>
          {moon.darkWindowStart && moon.darkWindowEnd ? (
            <p className="text-[hsl(var(--primary))]">
              {formatTime(moon.darkWindowStart)} &ndash;{' '}
              {formatTime(moon.darkWindowEnd)}
            </p>
          ) : (
            <p className="text-[hsl(var(--text))]">No dark window tonight</p>
          )}
          <p className="mt-1 text-[hsl(var(--muted))]">
            Moon up during dark window:{' '}
            {Math.round(moon.moonUpDuringDarkWindowPercent)}%
          </p>
        </div>

        <div>
          <p className="uppercase tracking-wider text-[hsl(var(--muted))]">
            Next New Moon
          </p>
          <p className="text-[hsl(var(--text))]">
            {formatDate(moon.nextNewMoon)}{' '}
            <span className="text-[hsl(var(--muted))]">
              ({daysUntil(moon.nextNewMoon)}d)
            </span>
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-[hsl(var(--muted))]">
            Next Full Moon
          </p>
          <p className="text-[hsl(var(--text))]">
            {formatDate(moon.nextFullMoon)}{' '}
            <span className="text-[hsl(var(--muted))]">
              ({daysUntil(moon.nextFullMoon)}d)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

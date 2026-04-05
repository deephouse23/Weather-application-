'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { DeepSkyHighlight } from '@/lib/stargazer/types';

interface DeepSkyHighlightsProps {
  highlights: DeepSkyHighlight[];
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-600 text-white',
  intermediate: 'bg-yellow-600 text-white',
  advanced: 'bg-red-600 text-white',
};

export default function DeepSkyHighlights({
  highlights,
}: DeepSkyHighlightsProps) {
  const { theme } = useTheme();
  const styles = getComponentStyles((theme || 'nord') as ThemeType, 'card');

  if (!highlights || highlights.length === 0) {
    return (
      <div
        className={cn(
          'border-4 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 font-mono',
          styles
        )}
      >
        <h2 className="text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
          Deep Sky Highlights
        </h2>
        <p className="mt-2 text-xs text-[hsl(var(--text))]">
          No deep sky objects visible tonight.
        </p>
      </div>
    );
  }

  const top8 = highlights.slice(0, 8);

  return (
    <div
      className={cn(
        'border-4 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 font-mono',
        styles
      )}
    >
      <h2 className="mb-3 text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
        Deep Sky Highlights
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {top8.map((obj) => (
          <div
            key={obj.id}
            className="border-2 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-3"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-[hsl(var(--primary))]">
                {obj.name}
              </h3>
              <span
                className={cn(
                  'shrink-0 px-1.5 py-0.5 text-[10px] uppercase tracking-wider',
                  difficultyColors[obj.difficulty] ?? 'bg-gray-600 text-white'
                )}
              >
                {obj.difficulty}
              </span>
            </div>

            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted))]">
              {formatType(obj.type)} &middot; {obj.constellation}
            </p>

            <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
              <div>
                <span className="text-[hsl(var(--muted))]">Mag</span>
                <p className="text-[hsl(var(--text))]">
                  {obj.magnitude.toFixed(1)}
                </p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted))]">Alt</span>
                <p className="text-[hsl(var(--text))]">
                  {Math.round(obj.maxAltitude)}&deg;
                </p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted))]">Transit</span>
                <p className="text-[hsl(var(--text))]">
                  {formatTime(obj.transitTime)}
                </p>
              </div>
            </div>

            <p className="mt-2 text-[10px] leading-relaxed text-[hsl(var(--muted))]">
              {obj.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

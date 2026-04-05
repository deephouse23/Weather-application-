'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';

interface StargazerCardProps {
  score: number;
  label: string;
  color: string;
  moonIllumination: number;
  phaseName: string;
  summary: string;
}

export default function StargazerCard({
  score,
  label,
  color,
  moonIllumination,
  phaseName,
  summary,
}: StargazerCardProps) {
  const { theme } = useTheme();
  const styles = getComponentStyles((theme || 'nord') as ThemeType, 'card');

  return (
    <Link href="/stargazer" className="block">
      <div
        className={cn(
          'border-4 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 font-mono transition-colors hover:border-[hsl(var(--primary))]',
          styles
        )}
      >
        <h2 className="mb-2 text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
          Stargazer Forecast
        </h2>

        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-[hsl(var(--border))]"
            style={{ backgroundColor: color }}
          >
            <span className="text-2xl font-bold text-white">{score}</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
              {label}
            </p>
            <p className="text-[10px] text-[hsl(var(--muted))]">
              {phaseName} &middot; {Math.round(moonIllumination)}% illuminated
            </p>
          </div>
        </div>

        <p className="mt-2 truncate text-xs text-[hsl(var(--text))]">
          {summary}
        </p>
      </div>
    </Link>
  );
}

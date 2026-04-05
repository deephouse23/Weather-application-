'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { StargazerScore as StargazerScoreType } from '@/lib/stargazer/types';

interface StargazerScoreProps {
  score: StargazerScoreType;
}

const subScoreLabels: Record<string, string> = {
  cloud: 'Cloud Cover',
  moon: 'Moon Impact',
  seeing: 'Seeing',
  transparency: 'Transparency',
  ground: 'Ground Conditions',
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const barColor =
    clamped >= 75
      ? 'bg-green-500'
      : clamped >= 50
        ? 'bg-yellow-500'
        : clamped >= 25
          ? 'bg-orange-500'
          : 'bg-red-500';

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="w-32 shrink-0 uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-3 flex-1 border border-subtle bg-[hsl(var(--bg))]">
        <div
          className={cn('h-full transition-all duration-500', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono">{clamped}</span>
    </div>
  );
}

export default function StargazerScore({ score }: StargazerScoreProps) {
  const { theme } = useTheme();
  const styles = getComponentStyles((theme || 'nord') as ThemeType, 'card');

  return (
    <div
      className={cn(
        'container-primary p-4 font-mono',
        styles
      )}
    >
      <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
        Stargazing Score
      </h2>

      <div className="mb-4 flex items-center gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-subtle"
          style={{ backgroundColor: score.color }}
        >
          <span className="text-3xl font-bold text-white">{score.overall}</span>
        </div>
        <div>
          <p className="text-lg font-bold uppercase tracking-wider text-cyan-400">
            {score.label}
          </p>
          <p className="text-xs font-mono">{score.summary}</p>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(score.subScores).map(([key, value]) => (
          <ScoreBar
            key={key}
            label={subScoreLabels[key] ?? key}
            value={value}
          />
        ))}
      </div>
    </div>
  );
}

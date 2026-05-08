/**
 * MiseryBadge - shared visual badge for the unified 0–100 misery score.
 * Used on the airport board, trip score card, and corridor list.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  MISERY_LEVEL_DESCRIPTIONS,
  type MiseryScore,
} from '@/lib/services/misery-score-service';

interface MiseryBadgeProps {
  score: MiseryScore;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

export function MiseryBadge({
  score,
  size = 'md',
  showLabel = true,
  className,
}: MiseryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-bold rounded border-2 uppercase tracking-wider',
        SIZE_CLASSES[size],
        className,
      )}
      style={{
        color: score.color,
        borderColor: score.color,
        backgroundColor: `${score.color}1a`,
      }}
      title={MISERY_LEVEL_DESCRIPTIONS[score.level]}
      aria-label={`Misery score ${score.score} of 100, ${score.label}`}
    >
      <span>{score.score}</span>
      {showLabel && <span>{score.label}</span>}
    </span>
  );
}

interface MiseryDriverListProps {
  score: MiseryScore;
  className?: string;
}

export function MiseryDriverList({ score, className }: MiseryDriverListProps) {
  if (score.drivers.length === 0) {
    return (
      <p className={cn('text-xs font-mono text-muted-foreground', className)}>
        No significant weather impacts
      </p>
    );
  }

  return (
    <ul className={cn('flex flex-wrap gap-1.5 text-xs font-mono', className)}>
      {score.drivers.map((driver) => (
        <li
          key={driver.label}
          className="px-1.5 py-0.5 rounded border border-border bg-card/50 text-muted-foreground"
        >
          {driver.label}
        </li>
      ))}
    </ul>
  );
}

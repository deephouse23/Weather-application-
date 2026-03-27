'use client';

/**
 * Worst Corridors Component
 *
 * Displays ranked list of top 5 worst driving corridors.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { SeverityLevel } from '@/lib/services/travel-corridor-service';

interface CorridorInfo {
  name: string;
  score: number;
  level: SeverityLevel;
  color: string;
  hazard: string;
}

interface WorstCorridorsProps {
  corridors: CorridorInfo[];
  isLoading: boolean;
}

const LEVEL_BADGE: Record<SeverityLevel, string> = {
  green: 'bg-green-500/20 text-green-400 border-green-500/50',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  red: 'bg-red-500/20 text-red-400 border-red-500/50',
};

const LEVEL_LABEL: Record<SeverityLevel, string> = {
  green: 'CLEAR',
  yellow: 'CAUTION',
  orange: 'HAZARDOUS',
  red: 'DANGEROUS',
};

export default function WorstCorridors({ corridors, isLoading }: WorstCorridorsProps) {
  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-6 bg-card/30">
        <p className="text-sm font-mono text-muted-foreground animate-pulse text-center">ANALYZING CORRIDORS...</p>
      </div>
    );
  }

  if (corridors.length === 0) {
    return (
      <div className="border border-border rounded-lg p-6 bg-card/30 text-center">
        <p className="text-lg font-mono text-green-400 font-bold">ALL CLEAR</p>
        <p className="text-sm font-mono text-muted-foreground mt-1">No significant weather impacts on major corridors</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono tracking-wider uppercase">Top 5 Worst Corridors</h2>
        <span className="text-xs font-mono text-muted-foreground">{corridors.length} flagged</span>
      </div>
      <div className="grid gap-2">
        {corridors.map((corridor, i) => (
          <div key={corridor.name} className="border border-border rounded-lg p-4 bg-card/50 hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-muted-foreground w-8">#{i + 1}</span>
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: corridor.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{corridor.name}</span>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-mono font-bold border', LEVEL_BADGE[corridor.level])}>
                    {LEVEL_LABEL[corridor.level]}
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-1">{corridor.hazard}</p>
              </div>
              <span className="text-xs font-mono text-muted-foreground shrink-0">Score {corridor.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

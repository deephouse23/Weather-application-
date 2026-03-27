'use client';

/**
 * Daily Outlook Images
 *
 * Displays WPC (Weather Prediction Center) daily forecast chart GIF images
 * for Days 1-3.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const WPC_BASE = 'https://www.wpc.ncep.noaa.gov/noaa';

const DAYS = [
  { label: 'Day 1', url: `${WPC_BASE}/noaad1.gif` },
  { label: 'Day 2', url: `${WPC_BASE}/noaad2.gif` },
  { label: 'Day 3', url: `${WPC_BASE}/noaad3.gif` },
];

export default function DailyOutlookImages() {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono tracking-wider uppercase">Daily Outlook Images</h2>
        <span className="text-xs font-mono text-muted-foreground">NOAA Weather Prediction Center</span>
      </div>

      <div className="flex gap-2">
        {DAYS.map((day, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedDay(i)}
            className={cn(
              'px-4 py-2 rounded-lg font-mono text-sm font-bold transition-colors',
              selectedDay === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/50 text-muted-foreground hover:bg-card/80 border border-border'
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DAYS[selectedDay].url}
          alt={`WPC ${DAYS[selectedDay].label} Forecast Chart`}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
}

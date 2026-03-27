'use client';

/**
 * SPC Outlook Tabs
 *
 * Manages day and outlook type selection for the SPC outlook map.
 * Day 3 only supports categorical (SPC doesn't publish individual hazard
 * outlooks for Day 3).
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { MapSkeleton } from '@/components/skeletons/map-skeleton';
import { useInView } from 'react-intersection-observer';
import type { SPCOutlookDay, SPCOutlookType } from '@/lib/services/spc-outlook-service';
import { OUTLOOK_TYPE_LABELS } from '@/lib/services/spc-outlook-service';

const SPCOutlookMap = dynamic(() => import('./SPCOutlookMap'), {
  ssr: false,
  loading: () => <MapSkeleton height="h-[500px]" />,
});

const DAY_LABELS: Record<SPCOutlookDay, string> = {
  1: 'Day 1',
  2: 'Day 2',
  3: 'Day 3',
};

const ALL_OUTLOOK_TYPES: SPCOutlookType[] = ['cat', 'torn', 'hail', 'wind'];
const DAY3_OUTLOOK_TYPES: SPCOutlookType[] = ['cat'];
const DAYS: SPCOutlookDay[] = [1, 2, 3];

export default function SPCOutlookTabs() {
  const [day, setDay] = useState<SPCOutlookDay>(1);
  const [type, setType] = useState<SPCOutlookType>('cat');

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
    threshold: 0,
  });

  const handleDayChange = (d: SPCOutlookDay) => {
    setDay(d);
    // Day 3 only supports categorical - reset type immediately
    if (d === 3 && type !== 'cat') {
      setType('cat');
    }
  };

  const availableTypes = day === 3 ? DAY3_OUTLOOK_TYPES : ALL_OUTLOOK_TYPES;

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono tracking-wider uppercase">SPC Convective Outlook</h2>
        <span className="text-xs font-mono text-muted-foreground">Storm Prediction Center</span>
      </div>

      <div className="flex gap-2">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDayChange(d)}
            className={cn(
              'px-4 py-2 rounded-lg font-mono text-sm font-bold transition-colors',
              day === d
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/50 text-muted-foreground hover:bg-card/80 border border-border'
            )}
          >
            {DAY_LABELS[d]}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {availableTypes.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'px-4 py-2 rounded-lg font-mono text-xs font-bold transition-colors',
              type === t
                ? 'bg-primary/20 text-primary border border-primary/50'
                : 'bg-card/50 text-muted-foreground hover:bg-card/80 border border-border'
            )}
          >
            {OUTLOOK_TYPE_LABELS[t]}
          </button>
        ))}
        {day === 3 && (
          <span className="flex items-center text-xs font-mono text-muted-foreground/60 pl-2">
            Day 3 only has categorical outlook
          </span>
        )}
      </div>

      <div style={{ minHeight: '500px', contain: 'layout style paint' }}>
        {inView ? (
          <SPCOutlookMap day={day} type={type} />
        ) : (
          <MapSkeleton height="h-[500px]" />
        )}
      </div>
    </div>
  );
}

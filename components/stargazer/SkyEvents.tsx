'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { SkyEvent } from '@/lib/stargazer/types';

interface SkyEventsProps {
  events: SkyEvent[];
}

const eventBadgeColors: Record<string, string> = {
  meteor_shower: 'bg-yellow-600',
  conjunction: 'bg-blue-600',
  opposition: 'bg-purple-600',
  lunar_eclipse: 'bg-red-600',
  solar_eclipse: 'bg-orange-600',
  equinox: 'bg-green-600',
  solstice: 'bg-teal-600',
};

const eventTypeLabels: Record<string, string> = {
  meteor_shower: 'Meteor Shower',
  conjunction: 'Conjunction',
  opposition: 'Opposition',
  lunar_eclipse: 'Lunar Eclipse',
  solar_eclipse: 'Solar Eclipse',
  equinox: 'Equinox',
  solstice: 'Solstice',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SkyEvents({ events }: SkyEventsProps) {
  const { theme } = useTheme();
  const styles = getComponentStyles((theme || 'nord') as ThemeType, 'card');

  if (!events || events.length === 0) {
    return (
      <div
        className={cn(
          'border-4 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 font-mono',
          styles
        )}
      >
        <h2 className="text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
          Upcoming Sky Events
        </h2>
        <p className="mt-2 text-xs text-[hsl(var(--text))]">
          No upcoming sky events.
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
      <h2 className="mb-3 text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
        Upcoming Sky Events
      </h2>

      <div className="space-y-3">
        {events.map((event, i) => (
          <div
            key={i}
            className="flex gap-3 border-b border-[hsl(var(--border))] pb-3 last:border-b-0 last:pb-0"
          >
            <div className="shrink-0 text-right">
              <p className="text-xs text-[hsl(var(--text))]">
                {formatDate(event.date)}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white',
                    eventBadgeColors[event.type] ?? 'bg-gray-600'
                  )}
                >
                  {eventTypeLabels[event.type] ?? event.type}
                </span>
                <h3 className="text-xs font-bold text-[hsl(var(--primary))]">
                  {event.title}
                </h3>
              </div>

              <p className="text-[10px] text-[hsl(var(--text))]">
                {event.description}
              </p>

              {event.moonInterference && (
                <p className="mt-1 text-[10px] text-[hsl(var(--muted))]">
                  Moon interference: {event.moonInterference}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

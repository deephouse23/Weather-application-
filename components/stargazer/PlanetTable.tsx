'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { PlanetVisibility } from '@/lib/stargazer/types';

interface PlanetTableProps {
  planets: PlanetVisibility[];
}

function formatTime(date: Date | null): string {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function PlanetTable({ planets }: PlanetTableProps) {
  const { theme } = useTheme();
  const styles = getComponentStyles((theme || 'nord') as ThemeType, 'card');

  if (!planets || planets.length === 0) return null;

  return (
    <div
      className={cn(
        'border-4 border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 font-mono',
        styles
      )}
    >
      <h2 className="mb-3 text-sm uppercase tracking-wider text-[hsl(var(--muted))]">
        Planet Visibility
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-[hsl(var(--border))]">
              <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                Planet
              </th>
              <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                Rise
              </th>
              <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                Set
              </th>
              <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                Peak Alt
              </th>
              <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                Peak Time
              </th>
              <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                Mag
              </th>
              <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => (
              <tr
                key={planet.name}
                className="border-b border-[hsl(var(--border))]"
              >
                <td className="px-2 py-1 font-bold text-[hsl(var(--primary))]">
                  {planet.name}
                </td>
                <td className="px-2 py-1 text-[hsl(var(--text))]">
                  {formatTime(planet.rise)}
                </td>
                <td className="px-2 py-1 text-[hsl(var(--text))]">
                  {formatTime(planet.set)}
                </td>
                <td className="px-2 py-1 text-[hsl(var(--text))]">
                  {Math.round(planet.peakAltitude)}&deg;
                </td>
                <td className="px-2 py-1 text-[hsl(var(--text))]">
                  {formatTime(planet.peakTime)}
                </td>
                <td className="px-2 py-1 text-[hsl(var(--text))]">
                  {planet.magnitude.toFixed(1)}
                </td>
                <td className="px-2 py-1 text-[hsl(var(--muted))]">
                  {planet.notes || '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

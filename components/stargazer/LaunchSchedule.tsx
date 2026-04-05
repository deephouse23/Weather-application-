'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { Launch } from '@/lib/stargazer/types';

interface LaunchScheduleProps {
  launches: Launch[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

export default function LaunchSchedule({ launches }: LaunchScheduleProps) {
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
        Upcoming Launches
      </h2>

      {!launches || launches.length === 0 ? (
        <p className="text-xs text-[hsl(var(--text))]">
          No upcoming launches scheduled.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-[hsl(var(--border))]">
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Date
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Mission
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Vehicle
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Provider
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Site
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {launches.map((launch) => (
                <tr
                  key={launch.id}
                  className="border-b border-[hsl(var(--border))]"
                >
                  <td className="px-2 py-1 text-[hsl(var(--text))]">
                    {formatDate(launch.net)}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--primary))]">
                    <span className="flex items-center gap-1">
                      {launch.missionName || launch.name}
                      {launch.isCrewed && (
                        <span className="bg-yellow-600 px-1 py-0.5 text-[9px] uppercase tracking-wider text-white">
                          Crewed
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--text))]">
                    {launch.vehicle}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--muted))]">
                    {launch.provider}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--muted))]">
                    {launch.padLocation}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--text))]">
                    {launch.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

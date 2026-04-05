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
        'container-primary p-4 font-mono',
        styles
      )}
    >
      <h2 className="border-b border-subtle py-3 mb-3 text-xs font-mono uppercase text-muted-foreground">
        Upcoming Launches
      </h2>

      {!launches || launches.length === 0 ? (
        <p className="text-xs font-mono">
          No upcoming launches scheduled.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-subtle">
                <th className="px-2 py-1 text-left uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-muted-foreground">
                  Mission
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-muted-foreground">
                  Vehicle
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-muted-foreground">
                  Provider
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-muted-foreground">
                  Site
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {launches.map((launch) => (
                <tr
                  key={launch.id}
                  className="border-b border-subtle"
                >
                  <td className="px-2 py-1 font-mono">
                    {formatDate(launch.net)}
                  </td>
                  <td className="px-2 py-1 text-cyan-400">
                    <span className="flex items-center gap-1">
                      {launch.missionName || launch.name}
                      {launch.isCrewed && (
                        <span className="bg-yellow-600 px-1 py-0.5 text-[9px] uppercase tracking-wider text-white">
                          Crewed
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-1 font-mono">
                    {launch.vehicle}
                  </td>
                  <td className="px-2 py-1 text-muted-foreground">
                    {launch.provider}
                  </td>
                  <td className="px-2 py-1 text-muted-foreground">
                    {launch.padLocation}
                  </td>
                  <td className="px-2 py-1 font-mono">
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

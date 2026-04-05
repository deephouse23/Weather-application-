'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { ISSPass } from '@/lib/stargazer/types';

interface ISSPassesProps {
  passes: ISSPass[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function ISSPasses({ passes }: ISSPassesProps) {
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
        ISS Passes
      </h2>

      {!passes || passes.length === 0 ? (
        <p className="text-xs text-[hsl(var(--text))]">
          No visible ISS passes in the next few days.
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
                  Rise
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Dir
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Max Elev
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Max Time
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Set Dir
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Set
                </th>
                <th className="px-2 py-1 text-left uppercase tracking-wider text-[hsl(var(--muted))]">
                  Bright
                </th>
              </tr>
            </thead>
            <tbody>
              {passes.map((pass, i) => (
                <tr
                  key={i}
                  className="border-b border-[hsl(var(--border))]"
                >
                  <td className="px-2 py-1 text-[hsl(var(--text))]">
                    {formatDate(pass.date)}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--text))]">
                    {formatTime(pass.riseTime)}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--muted))]">
                    {pass.riseDirection}
                  </td>
                  <td className="px-2 py-1 font-bold text-[hsl(var(--primary))]">
                    {Math.round(pass.maxElevation)}&deg;
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--text))]">
                    {formatTime(pass.maxTime)}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--muted))]">
                    {pass.setDirection}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--text))]">
                    {formatTime(pass.setTime)}
                  </td>
                  <td className="px-2 py-1 text-[hsl(var(--text))]">
                    {pass.brightness.toFixed(1)}
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

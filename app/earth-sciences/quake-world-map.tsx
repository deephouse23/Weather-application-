/**
 * Minimal SVG world map showing quake epicenters on a graticule.
 *
 * Intentionally no continent outlines — the 16-bit terminal aesthetic
 * reads better as a lat/lon grid with pulsing dots than as a realistic
 * Mercator map, and it keeps the bundle small (no path data). Each dot
 * is sized and colored by magnitude; the largest dot pulses.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { ClientEarthquake } from './earth-sciences-client';

const VIEW_W = 800;
const VIEW_H = 400;

function project(lat: number, lon: number): { x: number; y: number } {
  // Equirectangular projection. Simple, undistorted at the equator, and
  // readable at a glance for "where is activity happening."
  const x = ((lon + 180) / 360) * VIEW_W;
  const y = ((90 - lat) / 180) * VIEW_H;
  return { x, y };
}

function dotColor(mag: number): string {
  if (mag >= 6) return '#f87171'; // red-400
  if (mag >= 4.5) return '#fb923c'; // orange-400
  return '#facc15'; // yellow-400
}

function dotRadius(mag: number): number {
  // Clamp so sub-M2.5 still shows and M7+ doesn't cover Asia.
  return Math.max(2.5, Math.min(mag * 1.4, 14));
}

export interface QuakeWorldMapProps {
  quakes: ClientEarthquake[];
  className?: string;
}

export default function QuakeWorldMap({ quakes, className }: QuakeWorldMapProps) {
  // Sort ascending so larger dots render on top of smaller ones.
  const sorted = [...quakes].sort((a, b) => a.magnitude - b.magnitude);
  const topId = sorted.length ? sorted[sorted.length - 1].id : null;

  // Graticule at 30° intervals.
  const lonLines = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  const latLines = [-60, -30, 0, 30, 60];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-border bg-black/30',
        className
      )}
      data-testid="quake-world-map"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`World map showing ${quakes.length} recent earthquake${quakes.length === 1 ? '' : 's'}`}
      >
        {/* Map frame */}
        <rect
          x={0}
          y={0}
          width={VIEW_W}
          height={VIEW_H}
          fill="transparent"
        />

        {/* Graticule */}
        <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={0.5} className="text-foreground">
          {lonLines.map((lon) => {
            const { x } = project(0, lon);
            return <line key={`lon-${lon}`} x1={x} y1={0} x2={x} y2={VIEW_H} />;
          })}
          {latLines.map((lat) => {
            const { y } = project(lat, 0);
            return <line key={`lat-${lat}`} x1={0} y1={y} x2={VIEW_W} y2={y} />;
          })}
        </g>

        {/* Equator + prime meridian emphasised */}
        <g stroke="currentColor" strokeOpacity={0.25} strokeWidth={0.75} className="text-foreground">
          <line x1={0} y1={VIEW_H / 2} x2={VIEW_W} y2={VIEW_H / 2} />
          <line x1={VIEW_W / 2} y1={0} x2={VIEW_W / 2} y2={VIEW_H} />
        </g>

        {/* Quake dots */}
        <g>
          {sorted.map((q) => {
            const { x, y } = project(q.latitude, q.longitude);
            const r = dotRadius(q.magnitude);
            const color = dotColor(q.magnitude);
            const isTop = q.id === topId;
            return (
              <g key={q.id}>
                {/* Outer halo for the largest quake */}
                {isTop && (
                  <circle
                    cx={x}
                    cy={y}
                    r={r * 2.4}
                    fill={color}
                    fillOpacity={0.15}
                  >
                    <animate
                      attributeName="r"
                      values={`${r * 1.6};${r * 3};${r * 1.6}`}
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="fill-opacity"
                      values="0.25;0.05;0.25"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={color}
                  fillOpacity={0.85}
                  stroke={color}
                  strokeWidth={0.75}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex items-center gap-3 rounded bg-black/50 px-2 py-1 font-mono text-[9px] uppercase tracking-widest backdrop-blur-sm">
        <span className="flex items-center gap-1 text-yellow-400">
          <span className="h-2 w-2 rounded-full bg-yellow-400" /> M2.5+
        </span>
        <span className="flex items-center gap-1 text-orange-400">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400" /> M4.5+
        </span>
        <span className="flex items-center gap-1 text-red-400">
          <span className="h-3 w-3 rounded-full bg-red-400" /> M6+
        </span>
      </div>
    </div>
  );
}

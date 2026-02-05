/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

interface SunriseSunsetProps {
  sunrise: string;
  sunset: string;
}

export default function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  return (
    <div className="flex justify-center space-x-8 px-4 py-3 bg-terminal-bg-secondary border-0">
      {/* Sunrise */}
      <div className="flex items-center space-x-2">
        <SunriseIcon />
        <div className="text-center">
          <div className="text-xs text-terminal-accent uppercase tracking-wider">SUNRISE</div>
          <div className="text-sm font-bold text-terminal-accent-warning">{sunrise}</div>
        </div>
      </div>

      {/* Sunset */}
      <div className="flex items-center space-x-2">
        <SunsetIcon />
        <div className="text-center">
          <div className="text-xs text-terminal-accent uppercase tracking-wider">SUNSET</div>
          <div className="text-sm font-bold text-terminal-accent-danger">{sunset}</div>
        </div>
      </div>
    </div>
  );
}

// 16-bit pixel art sunrise icon
function SunriseIcon() {
  return (
    <div className="relative w-8 h-8" style={{ imageRendering: "pixelated" as const }}>
      {/* Ground line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-terminal-accent"></div>

      {/* Sun */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-terminal-accent-warning rounded-full"></div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-400 rounded-full"></div>

      {/* Sun rays */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-terminal-accent-warning"></div>
      <div className="absolute bottom-2 left-2 w-1.5 h-0.5 bg-terminal-accent-warning transform rotate-45 origin-right"></div>
      <div className="absolute bottom-2 right-2 w-1.5 h-0.5 bg-terminal-accent-warning transform -rotate-45 origin-left"></div>

      {/* Upward arrow indicating sunrise */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-terminal-accent"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-0.5">
        <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-terminal-accent"></div>
      </div>
    </div>
  );
}

// 16-bit pixel art sunset icon
function SunsetIcon() {
  return (
    <div className="relative w-8 h-8" style={{ imageRendering: "pixelated" as const }}>
      {/* Ground line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-terminal-accent"></div>

      {/* Sun (positioned as if setting) */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-terminal-accent-danger rounded-t-full"></div>
      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-3 h-1.5 bg-red-600 rounded-t-full"></div>

      {/* Horizontal rays */}
      <div className="absolute bottom-1 left-1 w-1.5 h-0.5 bg-terminal-accent-danger"></div>
      <div className="absolute bottom-1 right-1 w-1.5 h-0.5 bg-terminal-accent-danger"></div>
      <div className="absolute bottom-2 left-0.5 w-1 h-0.5 bg-terminal-accent-danger"></div>
      <div className="absolute bottom-2 right-0.5 w-1 h-0.5 bg-terminal-accent-danger"></div>

      {/* Downward arrow indicating sunset */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-terminal-accent"></div>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 translate-y-0.5">
        <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-terminal-accent"></div>
      </div>
    </div>
  );
} 
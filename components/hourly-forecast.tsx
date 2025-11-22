"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.2
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

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Droplets } from "lucide-react"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"
import ModernWeatherIcon from "./modern-weather-icon"

export interface HourlyForecastData {
  dt: number;
  time: string;
  temp: number;
  feelsLike?: number;
  condition: string;
  description: string;
  precipChance: number;
  windSpeed?: number;
  windDirection?: string;
  humidity?: number;
  uvIndex?: number;
  icon?: string;
}

interface HourlyForecastProps {
  hourly: HourlyForecastData[];
  theme?: ThemeType;
  tempUnit?: string;
}

export default function HourlyForecast({
  hourly,
  theme = 'dark',
  tempUnit = '°F'
}: HourlyForecastProps) {
  const themeClasses = getComponentStyles(theme, 'card');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHourCard = scrollContainerRef.current.querySelector('.current-hour');
      if (currentHourCard) {
        currentHourCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  }, []);

  if (!hourly || hourly.length === 0) {
    return null;
  }

  // Take first 24 hours for a cleaner view (user can scroll)
  const displayHours = hourly.slice(0, 24);
  const now = Date.now();

  return (
    <div className={cn(
      "p-3 sm:p-4 lg:p-6 rounded-xl border-0 shadow-xl backdrop-blur-md",
      themeClasses.background,
      "bg-opacity-40" // Glass effect base
    )}>
      <h2 className={cn(
        "text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 uppercase tracking-wider text-center pixel-glow",
        themeClasses.accentText
      )}>
        HOURLY FORECAST
      </h2>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "overflow-x-auto overflow-y-hidden py-4 px-2",
          "scrollbar-hide", // Custom scrollbar hiding if needed, or just thin
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme === 'dark' ? '#4ecdc4' : theme === 'miami' ? '#ff1493' : '#00FFFF'} transparent`
        }}
      >
        <div className="flex gap-3 sm:gap-4 pb-2 w-max mx-auto sm:mx-0">
          {displayHours.map((hour, index) => {
            const hourTime = new Date(hour.dt * 1000);
            const isCurrentHour = Math.abs(hourTime.getTime() - now) < 1800000; // Within 30 min
            const isMidnight = hourTime.getHours() === 0;

            return (
              <HourlyCard
                key={hour.dt}
                hour={hour}
                isCurrentHour={isCurrentHour}
                isMidnight={isMidnight}
                theme={theme}
                themeClasses={themeClasses}
                tempUnit={tempUnit}
              />
            );
          })}
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div className={cn(
        "text-center mt-2 text-xs opacity-70",
        themeClasses.text
      )}>
        ← Scroll for more hours →
      </div>
    </div>
  );
}

function HourlyCard({
  hour,
  isCurrentHour,
  isMidnight,
  theme,
  themeClasses,
  tempUnit
}: {
  hour: HourlyForecastData;
  isCurrentHour: boolean;
  isMidnight: boolean;
  theme: ThemeType;
  themeClasses: ReturnType<typeof getComponentStyles>;
  tempUnit: string;
}) {
  return (
    <div
      className={cn(
        "flex-shrink-0 flex flex-col items-center justify-between",
        "rounded-xl p-3 sm:p-4 min-w-[100px] sm:min-w-[110px]",
        "transition-all duration-300 hover:scale-105 hover:-translate-y-1",
        "backdrop-blur-md border border-white/10", // Glass card
        themeClasses.cardBg, // Fallback or base color
        isCurrentHour 
          ? "bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
          : "bg-black/20 hover:bg-white/5",
        isMidnight && "border-l-4 border-l-white/20" // Separator for days
      )}
    >
      {/* Time */}
      <div className={cn(
        "text-xs sm:text-sm font-bold mb-2 whitespace-nowrap",
        themeClasses.text,
        isCurrentHour && "text-shadow-glow"
      )}>
        {isCurrentHour ? 'NOW' : hour.time}
      </div>

      {/* Day marker for midnight */}
      {isMidnight && !isCurrentHour && (
        <div className={cn(
          "text-[10px] mb-1 font-bold uppercase tracking-widest opacity-80",
          themeClasses.accentText
        )}>
          {new Date(hour.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
      )}

      {/* Weather Icon */}
      <div className="mb-3 flex items-center justify-center filter drop-shadow-lg">
        <ModernWeatherIcon
          code={hour.icon}
          condition={hour.condition}
          size={54}
          className="hover:scale-110 transition-transform"
        />
      </div>

      {/* Temperature */}
      <div className={cn(
        "text-lg sm:text-xl font-bold mb-2 pixel-glow",
        theme === 'dark' ? 'text-[#ffe66d]' :
        theme === 'miami' ? 'text-[#ff1493]' :
        'text-[#00FFFF]'
      )}>
        {Math.round(hour.temp)}{tempUnit}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 w-full justify-center text-[10px] sm:text-xs opacity-80">
        {/* Precip */}
        <div className={cn(
          "flex items-center gap-0.5",
          hour.precipChance > 0 ? "text-blue-300" : "text-gray-400"
        )}>
          <Droplets className="w-3 h-3" />
          <span>{hour.precipChance}%</span>
        </div>
      </div>
    </div>
  );
}

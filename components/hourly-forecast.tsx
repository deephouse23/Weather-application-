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

  // Take first 48 hours
  const displayHours = hourly.slice(0, 48);
  const now = Date.now();

  return (
    <div className={cn(
      "p-3 sm:p-4 lg:p-6 rounded-none border-2 sm:border-4 pixel-shadow",
      themeClasses.background,
      themeClasses.borderColor
    )}>
      <h2 className={cn(
        "text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 uppercase tracking-wider text-center pixel-glow",
        themeClasses.accentText
      )}>
        ⏰ 48-HOUR FORECAST
      </h2>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "overflow-x-auto overflow-y-hidden",
          "border-2 p-2 sm:p-3",
          themeClasses.cardBg,
          themeClasses.borderColor
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme === 'dark' ? '#4ecdc4' : theme === 'miami' ? '#ff1493' : '#00FFFF'} #1a1a2e`
        }}
      >
        <div className="flex gap-2 sm:gap-3 pb-2">
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
        "border-2 p-2 sm:p-3 min-w-[70px] sm:min-w-[80px]",
        "transition-all duration-200 hover:scale-105",
        themeClasses.cardBg,
        themeClasses.borderColor,
        isCurrentHour && "current-hour ring-2 ring-opacity-80 shadow-lg",
        isCurrentHour && (
          theme === 'dark' ? 'ring-[#00d4ff] bg-[#1f2347]' :
          theme === 'miami' ? 'ring-[#ff1493] bg-[#4a0e4e]' :
          'ring-[#00FFFF] bg-[#001111]'
        ),
        isMidnight && "border-t-4"
      )}
      style={isCurrentHour ? {
        boxShadow: theme === 'dark' ? '0 0 15px #00d4ff' :
                   theme === 'miami' ? '0 0 15px #ff1493' :
                   '0 0 15px #00FFFF'
      } : undefined}
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
          "text-[10px] mb-1 font-bold",
          themeClasses.accentText
        )}>
          {new Date(hour.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
      )}

      {/* Weather Icon */}
      <div className="mb-2 flex items-center justify-center">
        <ModernWeatherIcon
          code={hour.icon}
          condition={hour.condition}
          size={32}
          className="hover:scale-110 transition-transform"
        />
      </div>

      {/* Temperature */}
      <div className={cn(
        "text-base sm:text-lg font-bold mb-1 pixel-glow",
        theme === 'dark' ? 'text-[#ffe66d]' :
        theme === 'miami' ? 'text-[#ff1493]' :
        'text-[#00FFFF]'
      )}>
        {Math.round(hour.temp)}{tempUnit}
      </div>

      {/* Precipitation Chance */}
      {hour.precipChance > 0 && (
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-blue-400">
          <Droplets className="w-3 h-3" />
          <span>{hour.precipChance}%</span>
        </div>
      )}

      {/* Wind (optional, shown on hover for larger screens) */}
      {hour.windSpeed && (
        <div className={cn(
          "hidden sm:block text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          themeClasses.secondary
        )}>
          {Math.round(hour.windSpeed)} mph {hour.windDirection || ''}
        </div>
      )}
    </div>
  );
}

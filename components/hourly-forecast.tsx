"use client"

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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Droplets } from "lucide-react"
import { ThemeType } from "@/lib/theme-config" // Ensure using shared type or just remove if not needed for logic
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
  theme?: ThemeType; // Kept for API compat
  tempUnit?: string;
}

export default function HourlyForecast({
  hourly,
  tempUnit = '°F'
}: HourlyForecastProps) {
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
    <Card className="p-3 sm:p-4 lg:p-6 border-2 shadow-xl backdrop-blur-md bg-card/40 animate-slide-in">
      <CardHeader className="p-0 mb-3 sm:mb-4">
        <CardTitle className="text-center text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wider text-primary glow">
          HOURLY FORECAST
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden py-4 px-2 scrollbar-hide"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--primary)) transparent'
          }}
        >
          <div className="flex gap-3 sm:gap-4 pb-2 w-max mx-auto sm:mx-0">
            {displayHours.map((hour) => {
              const hourTime = new Date(hour.dt * 1000);
              const isCurrentHour = Math.abs(hourTime.getTime() - now) < 1800000; // Within 30 min
              const isMidnight = hourTime.getHours() === 0;

              return (
                <HourlyCard
                  key={hour.dt}
                  hour={hour}
                  isCurrentHour={isCurrentHour}
                  isMidnight={isMidnight}
                  tempUnit={tempUnit}
                />
              );
            })}
          </div>
        </div>

        {/* Scroll hint for mobile */}
        <div className="text-center mt-2 text-xs opacity-70 text-muted-foreground">
          ← Scroll for more hours →
        </div>
      </CardContent>
    </Card>
  );
}

function HourlyCard({
  hour,
  isCurrentHour,
  isMidnight,
  tempUnit
}: {
  hour: HourlyForecastData;
  isCurrentHour: boolean;
  isMidnight: boolean;
  tempUnit: string;
}) {
  return (
    <Card
      className={cn(
        "flex-shrink-0 flex flex-col items-center justify-between",
        "rounded-xl p-3 sm:p-4 min-w-[100px] sm:min-w-[110px]",
        "transition-all duration-300 hover:scale-105 hover:-translate-y-1",
        "backdrop-blur-md",
        isCurrentHour
          ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] current-hour"
          : "bg-card/50 hover:bg-card/80 border-border",
        isMidnight && "border-l-4 border-l-primary/50"
      )}
    >
      {/* Time */}
      <div className={cn(
        "text-xs sm:text-sm font-bold mb-2 whitespace-nowrap text-foreground",
        isCurrentHour && "text-primary glow"
      )}>
        {isCurrentHour ? 'NOW' : hour.time}
      </div>

      {/* Day marker for midnight */}
      {isMidnight && !isCurrentHour && (
        <div className="text-[10px] mb-1 font-bold uppercase tracking-widest opacity-80 text-primary">
          {new Date(hour.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
      )}

      {/* Weather Icon */}
      <div className="mb-3 flex items-center justify-center filter drop-shadow-md">
        <ModernWeatherIcon
          code={hour.icon}
          condition={hour.condition}
          size={54}
          className="hover:scale-110 transition-transform"
        />
      </div>

      {/* Temperature */}
      <div className={cn(
        "text-lg sm:text-xl font-bold mb-2 pixel-glow text-primary",
        isCurrentHour && "scale-110"
      )}>
        {Math.round(hour.temp)}{tempUnit}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 w-full justify-center text-[10px] sm:text-xs opacity-80 text-muted-foreground">
        {/* Precip */}
        <div className={cn(
          "flex items-center gap-0.5",
          hour.precipChance > 0 ? "text-blue-400" : "text-muted-foreground"
        )}>
          <Droplets className="w-3 h-3" />
          <span>{hour.precipChance}%</span>
        </div>
      </div>
    </Card>
  );
}

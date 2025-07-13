"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Cloud } from "lucide-react"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"

interface ForecastDay {
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
  country?: string;
}

interface ForecastDetailsProps {
  forecast: ForecastDay[];
  theme?: ThemeType;
  selectedDay: number | null;
  currentWeatherData?: {
    humidity: number;
    wind: { speed: number; direction?: string };
    pressure: string;
    uvIndex: number;
    sunrise: string;
    sunset: string;
  };
}

export default function ForecastDetails({ 
  forecast, 
  theme = 'dark', 
  selectedDay,
  currentWeatherData 
}: ForecastDetailsProps) {
  const themeClasses = getComponentStyles(theme, 'card');
  
  // Don't render anything if no day is selected
  if (selectedDay === null) {
    return null;
  }

  return (
    <div className={`${themeClasses.background} p-3 sm:p-4 lg:p-6 rounded-none border-2 sm:border-4 ${themeClasses.borderColor} pixel-shadow`}>
      <h2 className={`text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 ${themeClasses.accentText} uppercase tracking-wider text-center pixel-glow`}>
        DETAILED FORECAST
      </h2>
      
      {/* Expanded Details Section */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.borderColor} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-bold ${themeClasses.accentText} pixel-glow`}>
                {forecast[selectedDay].day}
              </h3>
              <p className={`text-sm ${themeClasses.text} capitalize`}>
                {forecast[selectedDay].description}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${themeClasses.accentText} pixel-glow`}>
                {Math.round(forecast[selectedDay].highTemp)}° / {Math.round(forecast[selectedDay].lowTemp)}°
              </div>
            </div>
          </div>

          <DetailedWeatherInfo 
            selectedDay={selectedDay}
            theme={theme} 
            themeClasses={themeClasses}
            currentWeatherData={currentWeatherData}
          />
        </div>
    </div>
  );
}

function DetailedWeatherInfo({ 
  selectedDay, 
  theme, 
  themeClasses, 
  currentWeatherData 
}: { 
  selectedDay: number; 
  theme: ThemeType; 
  themeClasses: any; 
  currentWeatherData?: any; 
}) {
  // Use actual weather data
  const isToday = selectedDay === 0;
  
  const weatherMetrics = [
    {
      icon: <Droplets className="w-4 h-4" />,
      label: "Humidity",
      value: isToday && currentWeatherData?.humidity ? `${currentWeatherData.humidity}%` : "N/A"
    },
    {
      icon: <Wind className="w-4 h-4" />,
      label: "Wind",
      value: isToday && currentWeatherData?.wind ? 
        `${Math.round(currentWeatherData.wind.speed)} mph ${currentWeatherData.wind.direction || ''}` : 
        "N/A"
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: "Pressure",
      value: isToday && currentWeatherData?.pressure ? currentWeatherData.pressure : "N/A"
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: "UV Index",
      value: isToday && currentWeatherData?.uvIndex !== undefined ? currentWeatherData.uvIndex.toString() : "N/A"
    }
  ];

  if (isToday && currentWeatherData) {
    weatherMetrics.push(
      {
        icon: <Sunrise className="w-4 h-4" />,
        label: "Sunrise",
        value: currentWeatherData.sunrise || "N/A"
      },
      {
        icon: <Sunset className="w-4 h-4" />,
        label: "Sunset", 
        value: currentWeatherData.sunset || "N/A"
      }
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {weatherMetrics.map((metric, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className={`${themeClasses.accentText} flex-shrink-0`}>
            {metric.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-xs ${themeClasses.secondary} opacity-70`}>
              {metric.label}
            </div>
            <div className={`text-sm font-medium ${themeClasses.text} truncate`}>
              {metric.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
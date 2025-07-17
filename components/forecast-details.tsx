"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Cloud } from "lucide-react"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"
import { Tooltip } from "./tooltip"

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
            forecastDay={forecast[selectedDay]}
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
  forecastDay,
  theme, 
  themeClasses, 
  currentWeatherData 
}: { 
  selectedDay: number;
  forecastDay: any;
  theme: ThemeType; 
  themeClasses: any; 
  currentWeatherData?: any; 
}) {
  // Use forecast day details first, fallback to current weather for today
  const isToday = selectedDay === 0;
  const dayDetails = forecastDay?.details;
  
  // Helper function to get humidity tooltip
  const getHumidityTooltip = (humidity: number | undefined) => {
    if (!humidity) return "Humidity data not available"
    if (humidity < 30) return "Low humidity - May feel dry, static electricity common"
    if (humidity < 60) return "Comfortable humidity - Ideal for most activities"
    if (humidity < 80) return "High humidity - May feel sticky and uncomfortable"
    return "Very high humidity - Oppressive conditions, possible discomfort"
  }

  // Helper function to get pressure tooltip
  const getPressureTooltip = (pressure: string | undefined) => {
    if (!pressure) return "Pressure data not available"
    const numericPressure = parseFloat(pressure)
    if (pressure.includes('hPa')) {
      if (numericPressure < 1013) return "Low pressure - Stormy weather likely, possible headaches"
      if (numericPressure > 1020) return "High pressure - Fair weather expected, stable conditions"
      return "Normal pressure - Typical atmospheric conditions"
    } else if (pressure.includes('in')) {
      if (numericPressure < 29.92) return "Low pressure - Stormy weather likely, possible headaches"
      if (numericPressure > 30.20) return "High pressure - Fair weather expected, stable conditions"
      return "Normal pressure - Typical atmospheric conditions"
    }
    return "Atmospheric pressure reading"
  }

  const humidityValue = dayDetails?.humidity !== undefined ? dayDetails.humidity : 
                       (isToday && currentWeatherData?.humidity ? currentWeatherData.humidity : undefined)
  const pressureValue = dayDetails?.pressure || 
                       (isToday && currentWeatherData?.pressure ? currentWeatherData.pressure : undefined)
  
  const weatherMetrics = [
    {
      icon: <Droplets className="w-4 h-4" />,
      label: "Humidity",
      value: humidityValue !== undefined ? `${humidityValue}%` : "N/A",
      tooltip: getHumidityTooltip(humidityValue)
    },
    {
      icon: <Wind className="w-4 h-4" />,
      label: "Wind",
      value: dayDetails?.windSpeed !== undefined ? 
        `${dayDetails.windSpeed} mph ${dayDetails.windDirection || ''}` : 
        (isToday && currentWeatherData?.wind ? 
          `${Math.round(currentWeatherData.wind.speed)} mph ${currentWeatherData.wind.direction || ''}` : 
          "N/A"),
      tooltip: "Wind speed and direction"
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: "Pressure",
      value: pressureValue || "N/A",
      tooltip: getPressureTooltip(pressureValue)
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: "UV Index",
      value: dayDetails?.uvIndex !== undefined ? dayDetails.uvIndex.toString() : 
             (isToday && currentWeatherData?.uvIndex !== undefined ? currentWeatherData.uvIndex.toString() : "N/A"),
      tooltip: "UV radiation intensity level"
    }
  ];

  // Show sunrise/sunset for all days (values are similar daily)
  if (currentWeatherData?.sunrise || currentWeatherData?.sunset) {
    weatherMetrics.push(
      {
        icon: <Sunrise className="w-4 h-4" />,
        label: "Sunrise",
        value: currentWeatherData.sunrise || "N/A",
        tooltip: "Time of sunrise for this location"
      },
      {
        icon: <Sunset className="w-4 h-4" />,
        label: "Sunset", 
        value: currentWeatherData.sunset || "N/A",
        tooltip: "Time of sunset for this location"
      }
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {weatherMetrics.map((metric, index) => (
        <Tooltip key={index} content={metric.tooltip} theme={theme} position="top">
          <div className="flex items-center space-x-2 cursor-help">
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
        </Tooltip>
      ))}
    </div>
  );
}
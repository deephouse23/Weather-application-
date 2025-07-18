"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Cloud, Info } from "lucide-react"
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
    return "Relative humidity measures water vapor in the air as a percentage of maximum possible at current temperature. Calculated using dew point and current temperature. <30% feels dry and can cause static electricity. 30-50% is comfortable. >70% feels muggy and can promote mold growth."
  }

  // Helper function to get pressure tooltip
  const getPressureTooltip = (pressure: string | undefined) => {
    if (!pressure) return "Pressure data not available"
    return "Barometric pressure measures atmospheric weight pressing down at your location. Measured in hPa (hectopascals) or inHg (inches of mercury). <1013 hPa indicates low pressure systems bringing clouds/storms. >1020 hPa indicates high pressure bringing clear skies. Rapid changes can affect weather and some people feel pressure changes physically."
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
      tooltip: getHumidityTooltip(humidityValue),
      hasInfoIcon: true
    },
    {
      icon: <Wind className="w-4 h-4" />,
      label: "Wind",
      value: dayDetails?.windSpeed !== undefined ? 
        `${dayDetails.windSpeed} mph ${dayDetails.windDirection || ''}` : 
        (isToday && currentWeatherData?.wind ? 
          `${Math.round(currentWeatherData.wind.speed)} mph ${currentWeatherData.wind.direction || ''}` : 
          "N/A"),
      tooltip: "Wind speed and direction",
      hasInfoIcon: false
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: "Pressure",
      value: pressureValue || "N/A",
      tooltip: getPressureTooltip(pressureValue),
      hasInfoIcon: true
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: "UV Index",
      value: dayDetails?.uvIndex !== undefined ? dayDetails.uvIndex.toString() : 
             (isToday && currentWeatherData?.uvIndex !== undefined ? currentWeatherData.uvIndex.toString() : "N/A"),
      tooltip: "UV radiation intensity level",
      hasInfoIcon: false
    }
  ];

  // Show sunrise/sunset for all days (values are similar daily)
  if (currentWeatherData?.sunrise || currentWeatherData?.sunset) {
    weatherMetrics.push(
      {
        icon: <Sunrise className="w-4 h-4" />,
        label: "Sunrise",
        value: currentWeatherData.sunrise || "N/A",
        tooltip: "Time of sunrise for this location",
        hasInfoIcon: false
      },
      {
        icon: <Sunset className="w-4 h-4" />,
        label: "Sunset", 
        value: currentWeatherData.sunset || "N/A",
        tooltip: "Time of sunset for this location",
        hasInfoIcon: false
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
            <div className={`text-xs ${themeClasses.secondary} opacity-70 flex items-center gap-1`}>
              {metric.label}
              {metric.hasInfoIcon && (
                <Tooltip content={metric.tooltip} theme={theme} position="top">
                  <Info className={`w-3 h-3 cursor-help ${themeClasses.accentText} opacity-70 hover:opacity-100 transition-opacity`} />
                </Tooltip>
              )}
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
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Cloud, Info } from "lucide-react"
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

// Information tooltip component
function InfoTooltip({ text, theme }: { text: string; theme: ThemeType }) {
  const [isVisible, setIsVisible] = useState(false);
  const themeClasses = getComponentStyles(theme, 'card');

  return (
    <div className="relative inline-flex">
      <Info 
        className="w-3 h-3 ml-1 cursor-help opacity-60 hover:opacity-100 transition-opacity" 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div className={`absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-900 text-white border-2 border-gray-600 rounded-md shadow-xl max-w-48 text-center backdrop-blur-sm`}
             style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)' }}>
          <div className="whitespace-normal leading-relaxed font-medium">
            {text}
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
        </div>
      )}
    </div>
  );
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
  
  const weatherMetrics = [
    {
      icon: <Droplets className="w-4 h-4" />,
      label: "Chance of Rain",
      value: dayDetails?.precipitationChance !== undefined ? `${dayDetails.precipitationChance}%` : "0%"
    },
    {
      icon: <Droplets className="w-4 h-4" />,
      label: "Humidity",
      value: dayDetails?.humidity !== undefined ? `${dayDetails.humidity}%` : 
             (isToday && currentWeatherData?.humidity ? `${currentWeatherData.humidity}%` : "N/A"),
      tooltip: "Relative humidity measures the amount of moisture in the air as a percentage of the maximum moisture the air can hold at the current temperature."
    },
    {
      icon: <Wind className="w-4 h-4" />,
      label: "Wind",
      value: dayDetails?.windSpeed !== undefined ? 
        `${dayDetails.windSpeed} mph ${dayDetails.windDirection || ''}` : 
        (isToday && currentWeatherData?.wind ? 
          `${Math.round(currentWeatherData.wind.speed)} mph ${currentWeatherData.wind.direction || ''}` : 
          "N/A")
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: "Pressure",
      value: dayDetails?.pressure || 
             (isToday && currentWeatherData?.pressure ? currentWeatherData.pressure : "N/A"),
      tooltip: "Barometric pressure measures the weight of the atmosphere pressing down on Earth's surface. It's measured in inches of mercury (inHg) or hectopascals (hPa)."
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: "UV Index",
      value: dayDetails?.uvIndex !== undefined ? dayDetails.uvIndex.toString() : 
             (isToday && currentWeatherData?.uvIndex !== undefined ? currentWeatherData.uvIndex.toString() : "N/A")
    }
  ];

  // Show sunrise/sunset for all days (values are similar daily)
  if (currentWeatherData?.sunrise || currentWeatherData?.sunset) {
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
            <div className={`text-xs ${themeClasses.secondary} opacity-70 flex items-center`}>
              {metric.label}
              {(metric as any).tooltip && <InfoTooltip text={(metric as any).tooltip} theme={theme} />}
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
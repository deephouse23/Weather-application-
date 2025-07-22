"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Cloud, Info } from "lucide-react"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"

// Enhanced forecast interface with detailed weather data
interface DetailedForecastDay {
  day: string;
  date: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
  country?: string;
  // Enhanced details for expanded view
  details: {
    humidity?: number;
    windSpeed?: number;
    windDirection?: string;
    pressure?: string;
    uvIndex?: number;
    precipitationChance?: number;
    cloudCover?: number;
    visibility?: number;
    sunrise?: string;
    sunset?: string;
  };
  // Hourly breakdown (if available)
  hourlyForecast?: Array<{
    time: string;
    temp: number;
    condition: string;
    precipChance: number;
  }>;
}

interface ExpandableForecastProps {
  forecast: DetailedForecastDay[];
  theme?: ThemeType;
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

export default function ExpandableForecast({ 
  forecast, 
  theme = 'dark', 
  currentWeatherData 
}: ExpandableForecastProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const themeClasses = getComponentStyles(theme, 'card');

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className={`${themeClasses.background} p-3 sm:p-4 lg:p-6 rounded-none border-2 sm:border-4 ${themeClasses.borderColor}`}>
      <h2 className={`text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 ${themeClasses.accentText} uppercase tracking-wider text-center`}>
        5-DAY DETAILED FORECAST
      </h2>
      
      <div className="space-y-2 sm:space-y-3">
        {forecast.slice(0, 5).map((day, index) => (
          <ExpandableForecastCard
            key={index}
            day={day}
            index={index}
            isExpanded={expandedCard === index}
            onToggle={() => toggleCard(index)}
            theme={theme}
            themeClasses={themeClasses}
            currentWeatherData={currentWeatherData}
          />
        ))}
      </div>
    </div>
  );
}

function ExpandableForecastCard({ 
  day, 
  index, 
  isExpanded, 
  onToggle, 
  theme, 
  themeClasses,
  currentWeatherData 
}: {
  day: DetailedForecastDay;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  theme: ThemeType;
  themeClasses: any;
  currentWeatherData?: any;
}) {
  const isUSALocation = day.country === 'US' || day.country === 'USA';
  const tempUnit = isUSALocation ? '°F' : '°C';

  // Use current weather data for today's forecast details
  const isToday = index === 0;
  const details = isToday && currentWeatherData ? {
    humidity: currentWeatherData.humidity,
    windSpeed: currentWeatherData.wind.speed,
    windDirection: currentWeatherData.wind.direction,
    pressure: currentWeatherData.pressure,
    uvIndex: currentWeatherData.uvIndex,
    sunrise: currentWeatherData.sunrise,
    sunset: currentWeatherData.sunset,
    ...day.details
  } : day.details;

  return (
    <div className={`${themeClasses.cardBg} border ${themeClasses.borderColor} transition-all duration-300 hover:border-opacity-80`}>
      {/* Clickable Header */}
      <button
        onClick={onToggle}
        className={`w-full p-3 sm:p-4 flex items-center justify-between ${themeClasses.hoverBg} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
      >
        {/* Left: Day and Weather Icon */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
          <div className={`text-sm sm:text-base font-bold ${themeClasses.text} min-w-[60px] text-left`}>
            <div className="sm:hidden">{day.day.substring(0, 3)}</div>
            <div className="hidden sm:block">{day.day}</div>
            {day.date && (
              <div className={`text-xs ${themeClasses.secondary} opacity-70`}>
                {day.date}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <WeatherIcon condition={day.condition} size="medium" theme={theme} />
            <div className={`text-sm ${themeClasses.text} capitalize hidden sm:block`}>
              {day.description}
            </div>
          </div>
        </div>

        {/* Center: Temperature Range */}
        <div className="flex items-center space-x-3 flex-1 justify-center">
          <div className={`text-lg sm:text-xl font-bold ${themeClasses.accentText}`}>
            {Math.round(day.highTemp)}{tempUnit}
          </div>
          <div className="w-8 sm:w-12 h-1 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-400 rounded"></div>
          <div className={`text-sm sm:text-base ${themeClasses.secondary} opacity-80`}>
            {Math.round(day.lowTemp)}{tempUnit}
          </div>
        </div>

        {/* Right: Expand Icon */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {details?.precipitationChance !== undefined && (
            <div className="flex items-center space-x-1 text-xs text-blue-400">
              <Droplets className="w-3 h-3" />
              <span>{details.precipitationChance}%</span>
            </div>
          )}
          <div className={`${themeClasses.accentText} transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`p-3 sm:p-4 border-t ${themeClasses.borderColor} border-opacity-30`}>
          <DetailedWeatherInfo 
            details={details} 
            theme={theme} 
            themeClasses={themeClasses}
            tempUnit={tempUnit}
          />
          
          {/* Hourly Forecast if available */}
          {day.hourlyForecast && day.hourlyForecast.length > 0 && (
            <HourlyForecast 
              hourlyData={day.hourlyForecast} 
              theme={theme} 
              themeClasses={themeClasses}
              tempUnit={tempUnit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailedWeatherInfo({ details, theme, themeClasses, tempUnit }: any) {
  const weatherMetrics = [
    {
      icon: <Droplets className="w-4 h-4" />,
      label: "Humidity",
      value: details.humidity ? `${details.humidity}%` : "N/A",
      tooltip: "Relative humidity measures the amount of moisture in the air as a percentage of the maximum moisture the air can hold at the current temperature."
    },
    {
      icon: <Wind className="w-4 h-4" />,
      label: "Wind",
      value: details.windSpeed ? 
        `${Math.round(details.windSpeed)} mph ${details.windDirection || ''}` : 
        "N/A"
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: "Pressure",
      value: details.pressure || "N/A",
      tooltip: "Barometric pressure measures the weight of the atmosphere pressing down on Earth's surface. It's measured in inches of mercury (inHg) or hectopascals (hPa)."
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: "UV Index",
      value: details.uvIndex !== undefined ? details.uvIndex.toString() : "N/A"
    }
  ];

  if (details.sunrise || details.sunset) {
    weatherMetrics.push(
      {
        icon: <Sunrise className="w-4 h-4" />,
        label: "Sunrise",
        value: details.sunrise || "N/A"
      },
      {
        icon: <Sunset className="w-4 h-4" />,
        label: "Sunset", 
        value: details.sunset || "N/A"
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

function HourlyForecast({ hourlyData, theme, themeClasses, tempUnit }: any) {
  return (
    <div className="mt-4 pt-3 border-t border-opacity-30" style={{ borderColor: themeClasses.borderColor }}>
      <h4 className={`text-sm font-bold ${themeClasses.accentText} mb-3 uppercase tracking-wider`}>
        Hourly Forecast
      </h4>
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {hourlyData.slice(0, 8).map((hour: any, index: number) => (
          <div key={index} className={`flex-shrink-0 text-center p-2 rounded ${themeClasses.cardBg} border ${themeClasses.borderColor} min-w-[60px]`}>
            <div className={`text-xs ${themeClasses.secondary} mb-1`}>
              {hour.time}
            </div>
            <WeatherIcon condition={hour.condition} size="small" theme={theme} />
            <div className={`text-sm font-medium ${themeClasses.text} mt-1`}>
              {Math.round(hour.temp)}{tempUnit}
            </div>
            {hour.precipChance > 0 && (
              <div className="flex items-center justify-center space-x-1 mt-1">
                <Droplets className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">{hour.precipChance}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced weather icon with theme support
function WeatherIcon({ condition, size, theme }: { condition: string; size: "small" | "medium" | "large"; theme: ThemeType }) {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  };

  const iconStyle = {
    imageRendering: "pixelated" as const,
    filter: "contrast(1.2) saturate(1.3)",
  };

  // Weather icon implementation (same as existing but with theme colors)
  switch (condition.toLowerCase()) {
    case "sunny":
    case "clear":
      return (
        <div className={cn("relative", sizeClasses[size])} style={iconStyle}>
          <div className="absolute inset-0 bg-[#ffe66d] rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#ffcc02] rounded-full"></div>
        </div>
      );
    case "cloudy":
    case "overcast":
      return (
        <div className={cn("relative", sizeClasses[size])} style={iconStyle}>
          <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-[#e0e0e0] rounded-full"></div>
          <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-[#b0b0b0] rounded-full"></div>
        </div>
      );
    case "rainy":
    case "rain":
      return (
        <div className={cn("relative", sizeClasses[size])} style={iconStyle}>
          <div className="absolute top-0 left-0 w-3/4 h-1/2 bg-[#6c7b7f] rounded-full"></div>
          <div className="absolute bottom-0 left-1/4 w-1 h-1/3 bg-[#00d4ff] animate-slide-in"></div>
          <div className="absolute bottom-0 right-1/4 w-1 h-1/3 bg-[#00d4ff] animate-slide-in"></div>
        </div>
      );
    default:
      return (
        <div className={cn("relative", sizeClasses[size])} style={iconStyle}>
          <div className="absolute inset-0 bg-[#ffe66d] rounded-full"></div>
        </div>
      );
  }
}
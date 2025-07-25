"use client"

import { cn } from "@/lib/utils"
import { getThemeGradients, getTypographyClasses } from '@/lib/theme-utils'

// Theme types
type ThemeType = 'dark' | 'miami' | 'tron';

interface ForecastDay {
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
  country?: string; // Add country code for unit determination
}

interface ForecastProps {
  forecast: ForecastDay[];
  theme?: ThemeType;
  onDayClick?: (index: number) => void;
  selectedDay?: number | null;
}

export default function Forecast({ forecast, theme = 'dark', onDayClick, selectedDay }: ForecastProps) {
  // Enhanced theme-based color classes for three themes
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          cardBg: 'bg-[#16213e]',
          itemBg: 'bg-[#1a1a2e]',
          itemHover: 'hover:bg-[#1f2347]',
          borderColor: 'border-[#00FFFF]',
          itemBorder: 'border-[#00FFFF]',
          headerText: 'text-[#00FFFF]',
          primaryText: 'text-[#00FFFF]',
          temperatureText: 'text-[#00FFFF]',
          lowTempText: 'text-[#00FFFF]',
          glow: '',
          specialBorder: '',
          cardStyle: {},
          itemStyle: {}
        }
      case 'miami':
        return {
          cardBg: 'bg-gradient-to-br from-[#4a0e4e] via-[#2d1b69] to-[#1a0033]',
          itemBg: 'bg-gradient-to-br from-[#2d1b69] to-[#4a0e4e]',
          itemHover: 'hover:bg-gradient-to-br hover:from-[#4a0e4e] hover:to-[#6a1b9a]',
          borderColor: 'border-[#00FFFF]',
          itemBorder: 'border-[#00FFFF]',
          headerText: 'text-[#00FFFF]',
          primaryText: 'text-[#00FFFF]',
          temperatureText: 'text-[#00FFFF]',
          lowTempText: 'text-[#00FFFF]',
          glow: 'drop-shadow-[0_0_8px_#00FFFF]',
          specialBorder: 'shadow-[0_0_15px_#00FFFF]',
          cardStyle: {
            boxShadow: '0 0 30px #00FFFF, 0 0 60px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.2)',
            textShadow: '0 0 15px #00FFFF, 0 0 30px #00FFFF'
          },
          itemStyle: {
            background: 'linear-gradient(135deg, #2d1b69, #4a0e4e)',
            boxShadow: '0 0 20px #00FFFF, inset 0 0 15px rgba(0, 212, 255, 0.1)',
            borderColor: '#00FFFF'
          }
        }
      case 'tron':
        return {
          cardBg: 'bg-[#000000]',
          itemBg: 'bg-[#000000]',
          itemHover: 'hover:bg-[#001111]',
          borderColor: 'border-[#00FFFF]',
          itemBorder: 'border-[#00FFFF]',
          headerText: 'text-[#00FFFF]',
          primaryText: 'text-[#FFFFFF]',
          temperatureText: 'text-[#00FFFF]',
          lowTempText: 'text-[#00FFFF]',
          glow: 'drop-shadow-[0_0_15px_#00FFFF]',
          specialBorder: 'shadow-[0_0_20px_#00FFFF]',
          cardStyle: {
            boxShadow: '0 0 30px #00FFFF, 0 0 60px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)',
            textShadow: '0 0 15px #00FFFF, 0 0 30px #00FFFF'
          },
          itemStyle: {
            background: 'linear-gradient(135deg, #000000, #001111)',
            boxShadow: '0 0 25px #00FFFF, inset 0 0 20px rgba(0, 212, 255, 0.1)',
            borderColor: '#00FFFF'
          }
        }
    }
  }

  const themeClasses = getThemeClasses(theme)

  const gradients = getThemeGradients(theme);
  const typography = getTypographyClasses(theme, 'lg', 'bold');
  
  return (
    <div className={`${gradients.cardClass} p-3 sm:p-4 lg:p-6 rounded-none border-2 sm:border-4 ${themeClasses.borderColor} ${themeClasses.specialBorder} smooth-transition`}>
      <h2 className={`${typography.gradient} uppercase tracking-wider text-center`}>5-DAY FORECAST</h2>
      {/* Mobile responsive grid - stack on very small screens, 3 cols on mobile+, 5 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {forecast.slice(0, 5).map((day, index) => (
          <ForecastCard 
            key={index} 
            day={day} 
            index={index}
            themeClasses={themeClasses} 
            theme={theme}
            onDayClick={onDayClick}
            isSelected={selectedDay === index}
          />
        ))}
      </div>
    </div>
  );
}

function ForecastCard({ day, index, themeClasses, theme, onDayClick, isSelected }: { 
  day: ForecastDay; 
  index: number;
  themeClasses: any; 
  theme: ThemeType;
  onDayClick?: (index: number) => void;
  isSelected?: boolean;
}) {
  const isUSALocation = day.country === 'US' || day.country === 'USA';
  const tempUnit = isUSALocation ? '°F' : '°C';
  
  // Generate date in M.DD.YY format
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + index);
  const month = targetDate.getMonth() + 1;
  const date = targetDate.getDate();
  const year = targetDate.getFullYear().toString().slice(-2);
  const formattedDate = `${month}.${date.toString().padStart(2, '0')}.${year}`;

  const handleClick = () => {
    if (onDayClick) {
      onDayClick(index);
    }
  };

  return (
    <div 
      className={`${themeClasses.itemBg} p-2 sm:p-3 border ${themeClasses.itemBorder} text-center transition-all duration-200 ${themeClasses.specialBorder}
                  min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] flex flex-col justify-between
                  ${onDayClick ? 'cursor-pointer hover:scale-105' : ''} ${themeClasses.itemHover}
                  ${isSelected ? `ring-2 ring-[#00FFFF] ring-opacity-80` : ''}`}
      style={themeClasses.itemStyle}
      onClick={handleClick}
    >
      {/* Day of week - Mobile responsive */}
      <div className={`text-xs sm:text-sm font-bold ${themeClasses.primaryText} mb-1 sm:mb-2 uppercase tracking-wider ${themeClasses.glow} break-words`}>
        <span className="sm:hidden">{day.day.substring(0, 3)}</span>
        <span className="hidden sm:inline">{day.day}</span>
        <div className={`text-xs ${themeClasses.primaryText} opacity-70 mt-1`}>
          {formattedDate}
        </div>
      </div>
      
      {/* Weather icon - Mobile responsive */}
      <div className="flex justify-center mb-2 sm:mb-3 flex-grow items-center">
        <WeatherIcon condition={day.condition} size="small" />
      </div>
      
      {/* Temperature display - Mobile optimized */}
      <div className="space-y-1">
        <div className={`text-sm sm:text-base lg:text-lg font-bold ${themeClasses.temperatureText}`}>
          {Math.round(day.highTemp)}{tempUnit}
        </div>
        <div className={`text-xs sm:text-sm ${themeClasses.lowTempText} opacity-80 font-medium`}>
          {Math.round(day.lowTemp)}{tempUnit}
        </div>
      </div>
      
      {/* Weather description - Mobile responsive with better overflow handling */}
      <div className={`text-xs ${themeClasses.primaryText} capitalize mt-1 sm:mt-2 ${themeClasses.glow} break-words hyphens-auto leading-tight`} 
           title={day.description}
           style={{ 
             fontSize: "clamp(10px, 2vw, 12px)",
             lineHeight: "1.2"
           }}>
        {/* Show abbreviated description on small screens */}
        <span className="sm:hidden">
          {day.description.length > 12 ? `${day.description.substring(0, 10)}...` : day.description}
        </span>
        <span className="hidden sm:inline">
          {day.description.length > 20 ? `${day.description.substring(0, 18)}...` : day.description}
        </span>
      </div>
    </div>
  );
}

// Weather icon component for forecast
function WeatherIcon({ condition, size }: { condition: string; size: "small" | "large" }) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-8 h-8"

  const iconStyle = {
    imageRendering: "pixelated" as const,
    filter: "contrast(1.2) saturate(1.3)",
  }

  switch (condition.toLowerCase()) {
    case "sunny":
      return (
        <div className={cn("relative", sizeClass)} style={iconStyle}>
          <div className="absolute inset-0 bg-[#ffe66d] rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#ffcc02] rounded-full"></div>
          {/* Sun rays */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-[#ffe66d]"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-[#ffe66d]"></div>
          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-3 h-1 bg-[#ffe66d]"></div>
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-1 bg-[#ffe66d]"></div>
        </div>
      )
    case "cloudy":
      return (
        <div className={cn("relative", sizeClass)} style={iconStyle}>
          <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-[#e0e0e0] rounded-full"></div>
          <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-[#b0b0b0] rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[#d0d0d0] rounded-full"></div>
        </div>
      )
    case "rainy":
      return (
        <div className={cn("relative", sizeClass)} style={iconStyle}>
          {/* Cloud */}
          <div className="absolute top-0 left-0 w-3/4 h-1/2 bg-[#6c7b7f] rounded-full"></div>
          <div className="absolute top-1/4 right-0 w-3/4 h-1/2 bg-[#5a6c70] rounded-full"></div>
          {/* Rain drops */}
          <div className="absolute bottom-0 left-1/4 w-1 h-1/3 bg-[#00FFFF]"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1/4 bg-[#00FFFF]"></div>
          <div className="absolute bottom-0 right-1/4 w-1 h-1/3 bg-[#00FFFF]"></div>
        </div>
      )
    case "snowy":
      return (
        <div className={cn("relative", sizeClass)} style={iconStyle}>
          {/* Cloud */}
          <div className="absolute top-0 left-0 w-3/4 h-1/2 bg-[#d0d0d0] rounded-full"></div>
          <div className="absolute top-1/4 right-0 w-3/4 h-1/2 bg-[#b8b8b8] rounded-full"></div>
          {/* Snow flakes */}
          <div className="absolute bottom-1 left-1/4 w-2 h-2 bg-white transform rotate-45"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white transform rotate-45"></div>
          <div className="absolute bottom-1 right-1/4 w-2 h-2 bg-white transform rotate-45"></div>
        </div>
      )
    default:
      return (
        <div className={cn("relative", sizeClass)} style={iconStyle}>
          <div className="absolute inset-0 bg-[#ffe66d] rounded-full"></div>
        </div>
      )
  }
} 
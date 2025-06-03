"use client"

import { cn } from "@/lib/utils"

// Theme types
type ThemeType = 'dark' | 'miami' | 'tron';

interface ForecastDay {
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
}

interface ForecastProps {
  forecast: ForecastDay[];
  theme?: ThemeType;
}

export default function Forecast({ forecast, theme = 'dark' }: ForecastProps) {
  // Enhanced theme-based color classes for three themes
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          cardBg: 'bg-[#16213e]',
          itemBg: 'bg-[#1a1a2e]',
          itemHover: 'hover:bg-[#1f2347]',
          borderColor: 'border-[#00d4ff]',
          itemBorder: 'border-[#4ecdc4]',
          headerText: 'text-[#00d4ff]',
          primaryText: 'text-[#4ecdc4]',
          temperatureText: 'text-[#ffe66d]',
          lowTempText: 'text-[#4ecdc4]',
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
          borderColor: 'border-[#ff1493]',
          itemBorder: 'border-[#ff1493]',
          headerText: 'text-[#ff007f]',
          primaryText: 'text-[#00ffff]',
          temperatureText: 'text-[#ff1493]',
          lowTempText: 'text-[#00ffff]',
          glow: 'drop-shadow-[0_0_8px_#ff007f]',
          specialBorder: 'shadow-[0_0_15px_#ff1493]',
          cardStyle: {
            boxShadow: '0 0 30px #ff1493, 0 0 60px rgba(255, 20, 147, 0.3), inset 0 0 20px rgba(138, 43, 226, 0.2)',
            textShadow: '0 0 15px #ff007f, 0 0 30px #ff007f'
          },
          itemStyle: {
            background: 'linear-gradient(135deg, #2d1b69, #4a0e4e)',
            boxShadow: '0 0 20px #ff1493, inset 0 0 15px rgba(255, 20, 147, 0.1)',
            borderColor: '#ff1493'
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
          lowTempText: 'text-[#88CCFF]',
          glow: 'drop-shadow-[0_0_15px_#00FFFF]',
          specialBorder: 'shadow-[0_0_20px_#00FFFF]',
          cardStyle: {
            boxShadow: '0 0 30px #00FFFF, 0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
            textShadow: '0 0 15px #00FFFF, 0 0 30px #00FFFF'
          },
          itemStyle: {
            background: 'linear-gradient(135deg, #000000, #001111)',
            boxShadow: '0 0 25px #00FFFF, inset 0 0 20px rgba(0, 255, 255, 0.1)',
            borderColor: '#00FFFF'
          }
        }
    }
  }

  const themeClasses = getThemeClasses(theme)

  return (
    <div className={`${themeClasses.cardBg} p-4 rounded-none border-2 ${themeClasses.borderColor} pixel-shadow ${themeClasses.specialBorder}`}
         style={themeClasses.cardStyle}>
      <h2 className={`text-lg font-bold mb-4 ${themeClasses.headerText} uppercase tracking-wider ${themeClasses.glow}`}
          style={{ textShadow: themeClasses.cardStyle.textShadow }}>3-DAY FORECAST</h2>
      <div className="grid grid-cols-3 gap-3">
        {forecast.map((day, index) => (
          <ForecastCard key={index} day={day} themeClasses={themeClasses} theme={theme} />
        ))}
      </div>
    </div>
  );
}

function ForecastCard({ day, themeClasses, theme }: { day: ForecastDay; themeClasses: any; theme: ThemeType }) {
  return (
    <div className={`${themeClasses.itemBg} p-3 border ${themeClasses.itemBorder} text-center ${themeClasses.itemHover} transition-colors duration-200 ${themeClasses.specialBorder}`}
         style={themeClasses.itemStyle}>
      <div className={`text-xs font-bold ${themeClasses.primaryText} mb-2 uppercase tracking-wider ${themeClasses.glow}`}>
        {day.day}
      </div>
      
      <div className="flex justify-center mb-3">
        <WeatherIcon condition={day.condition} size="small" />
      </div>
      
      {/* High/Low Temperature Display */}
      <div className="mb-2">
        <div className={`text-lg font-bold ${themeClasses.temperatureText} mb-1 pixel-glow ${themeClasses.glow}`}
             style={theme !== 'dark' ? {
               textShadow: theme === 'tron' ? '0 0 10px #00FFFF, 0 0 20px #00FFFF' : '0 0 10px #ff1493, 0 0 20px #ff1493'
             } : {}}>
          {day.highTemp}°
        </div>
        <div className={`text-sm ${themeClasses.lowTempText} opacity-80 font-medium ${themeClasses.glow}`}>
          {day.lowTemp}°
        </div>
      </div>
      
      <div className={`text-xs ${themeClasses.primaryText} capitalize truncate px-1 ${themeClasses.glow}`} title={day.description}>
        {day.description}
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
          <div className="absolute bottom-0 left-1/4 w-1 h-1/3 bg-[#00d4ff]"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1/4 bg-[#00d4ff]"></div>
          <div className="absolute bottom-0 right-1/4 w-1 h-1/3 bg-[#00d4ff]"></div>
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
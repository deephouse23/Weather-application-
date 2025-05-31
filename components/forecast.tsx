"use client"

import { cn } from "@/lib/utils"

interface ForecastDay {
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
}

interface ForecastProps {
  forecast: ForecastDay[];
  isDarkMode?: boolean;
}

export default function Forecast({ forecast, isDarkMode = true }: ForecastProps) {
  // Theme-based color classes
  const themeClasses = {
    cardBg: isDarkMode ? 'bg-[#16213e]' : 'bg-gradient-to-br from-[#4a0e4e] via-[#2d1b69] to-[#1a0033]',
    itemBg: isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#2d1b69] to-[#4a0e4e]',
    itemHover: isDarkMode ? 'hover:bg-[#1f2347]' : 'hover:bg-gradient-to-br hover:from-[#4a0e4e] hover:to-[#6a1b9a]',
    borderColor: isDarkMode ? 'border-[#00d4ff]' : 'border-[#ff1493]', // Hot pink borders
    itemBorder: isDarkMode ? 'border-[#4ecdc4]' : 'border-[#00ffff]', // Electric cyan
    headerText: isDarkMode ? 'text-[#00d4ff]' : 'text-[#ff007f]', // Hot pink headers
    primaryText: isDarkMode ? 'text-[#4ecdc4]' : 'text-[#00ffff]', // Electric cyan
    temperatureText: isDarkMode ? 'text-[#ffe66d]' : 'text-[#ff1493]', // Hot pink temperature
    lowTempText: isDarkMode ? 'text-[#4ecdc4]' : 'text-[#00ffff]', // Electric cyan
    miamiViceGlow: isDarkMode ? '' : 'drop-shadow-[0_0_8px_#ff007f]',
    miamiViceBorder: isDarkMode ? '' : 'shadow-[0_0_15px_#00ffff]',
  }

  return (
    <div className={`${themeClasses.cardBg} p-4 rounded-none border-2 ${themeClasses.borderColor} pixel-shadow ${!isDarkMode ? themeClasses.miamiViceBorder : ''}`}
         style={!isDarkMode ? {
           boxShadow: '0 0 30px #ff1493, 0 0 60px rgba(255, 20, 147, 0.3), inset 0 0 20px rgba(138, 43, 226, 0.2)'
         } : {}}>
      <h2 className={`text-lg font-bold mb-4 ${themeClasses.headerText} uppercase tracking-wider ${themeClasses.miamiViceGlow}`}
          style={!isDarkMode ? {
            textShadow: '0 0 15px #ff007f, 0 0 30px #ff007f'
          } : {}}>3-DAY FORECAST</h2>
      <div className="grid grid-cols-3 gap-3">
        {forecast.map((day, index) => (
          <ForecastCard key={index} day={day} themeClasses={themeClasses} isDarkMode={isDarkMode} />
        ))}
      </div>
    </div>
  );
}

function ForecastCard({ day, themeClasses, isDarkMode }: { day: ForecastDay; themeClasses: any; isDarkMode: boolean }) {
  return (
    <div className={`${themeClasses.itemBg} p-3 border ${themeClasses.itemBorder} text-center ${themeClasses.itemHover} transition-colors duration-200 ${!isDarkMode ? themeClasses.miamiViceBorder : ''}`}
         style={!isDarkMode ? {
           background: 'linear-gradient(135deg, #2d1b69, #4a0e4e)',
           boxShadow: '0 0 20px #00ffff, inset 0 0 15px rgba(0, 255, 255, 0.1)',
           borderColor: '#00ffff'
         } : {}}>
      <div className={`text-xs font-bold ${themeClasses.primaryText} mb-2 uppercase tracking-wider ${themeClasses.miamiViceGlow}`}>
        {day.day}
      </div>
      
      <div className="flex justify-center mb-3">
        <WeatherIcon condition={day.condition} size="small" />
      </div>
      
      {/* High/Low Temperature Display */}
      <div className="mb-2">
        <div className={`text-lg font-bold ${themeClasses.temperatureText} mb-1 pixel-glow ${themeClasses.miamiViceGlow}`}
             style={!isDarkMode ? {
               textShadow: '0 0 10px #ff1493, 0 0 20px #ff1493'
             } : {}}>
          {day.highTemp}°
        </div>
        <div className={`text-sm ${themeClasses.lowTempText} opacity-80 font-medium ${themeClasses.miamiViceGlow}`}>
          {day.lowTemp}°
        </div>
      </div>
      
      <div className={`text-xs ${themeClasses.primaryText} capitalize truncate px-1 ${themeClasses.miamiViceGlow}`} title={day.description}>
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
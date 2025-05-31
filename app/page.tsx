"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function WeatherApp() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch with mock data
    setTimeout(() => {
      setWeather({
        current: {
          temp: 72,
          condition: "sunny",
          humidity: 45,
          wind: 8,
          location: "San Francisco",
        },
        forecast: [
          { day: "TUE", temp: 68, condition: "cloudy" },
          { day: "WED", temp: 65, condition: "rainy" },
          { day: "THU", temp: 60, condition: "snowy" },
        ],
      })
      setLoading(false)
    }, 1500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a2e] text-[#00d4ff] pixel-font">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin" />
          <p className="mt-4 text-xl">LOADING...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e0e0e0] p-4 pixel-font">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold tracking-wider text-[#00d4ff] pixel-glow mb-2">WEATHER.EXE</h1>
          <div className="text-sm text-[#ff6b6b]">{weather.current.location}</div>
        </header>

        {/* Current Weather */}
        <div className="bg-[#16213e] p-6 rounded-none mb-6 border-2 border-[#00d4ff] pixel-shadow">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-4">
              <WeatherIcon condition={weather.current.condition} size="large" />
            </div>
            <div className="text-6xl font-bold text-[#00d4ff] pixel-glow mb-2">{weather.current.temp}°</div>
            <div className="text-lg uppercase tracking-wider text-[#ff6b6b]">{weather.current.condition}</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-[#1a1a2e] p-3 border border-[#4ecdc4]">
              <div className="text-xs text-[#4ecdc4] mb-1">HUMIDITY</div>
              <div className="text-lg font-bold text-[#ffe66d]">{weather.current.humidity}%</div>
            </div>
            <div className="bg-[#1a1a2e] p-3 border border-[#4ecdc4]">
              <div className="text-xs text-[#4ecdc4] mb-1">WIND</div>
              <div className="text-lg font-bold text-[#ffe66d]">{weather.current.wind} MPH</div>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="bg-[#16213e] p-4 rounded-none border-2 border-[#00d4ff] pixel-shadow">
          <h2 className="text-lg font-bold mb-4 text-[#00d4ff] uppercase tracking-wider">3-DAY FORECAST</h2>
          <div className="grid grid-cols-3 gap-3">
            {weather.forecast.map((day: any, index: number) => (
              <div key={index} className="bg-[#1a1a2e] p-3 border border-[#4ecdc4] text-center">
                <div className="text-xs font-bold text-[#4ecdc4] mb-2">{day.day}</div>
                <div className="flex justify-center mb-2">
                  <WeatherIcon condition={day.condition} size="small" />
                </div>
                <div className="text-lg font-bold text-[#ffe66d]">{day.temp}°</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-[#4ecdc4]">
          <div className="mb-2">▼ ▲ ◄ ► SELECT START</div>
          <div>© 2025 RETRO WEATHER CORP.</div>
        </footer>
      </div>
    </div>
  )
}

// Custom 8-bit style weather icons
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

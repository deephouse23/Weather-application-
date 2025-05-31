"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchWeatherData, fetchWeatherByLocation } from "@/lib/weather-api"
import WeatherSearch from "@/components/weather-search"

// Get the API key from environment variables with fallback
const NEXT_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY
const PRIVATE_API_KEY = process.env.OPENWEATHERMAP_API_KEY
const API_KEY = NEXT_PUBLIC_API_KEY || PRIVATE_API_KEY

// Debug logging for API key status
console.log('🔍 [DEBUG] App startup - checking API key sources');
console.log('🔍 [DEBUG] NEXT_PUBLIC_OPENWEATHERMAP_API_KEY:', NEXT_PUBLIC_API_KEY ? `${NEXT_PUBLIC_API_KEY.substring(0, 8)}...${NEXT_PUBLIC_API_KEY.substring(-4)}` : 'NOT SET');
console.log('🔍 [DEBUG] OPENWEATHERMAP_API_KEY:', PRIVATE_API_KEY ? `${PRIVATE_API_KEY.substring(0, 8)}...${PRIVATE_API_KEY.substring(-4)}` : 'NOT SET');
console.log('🔍 [DEBUG] Final API_KEY used:', API_KEY ? `${API_KEY.substring(0, 8)}...${API_KEY.substring(-4)}` : 'NOT SET');
console.log('🔍 [DEBUG] API_KEY length:', API_KEY ? API_KEY.length : 0);
console.log('🔍 [DEBUG] API_KEY type:', typeof API_KEY);
console.log('🔍 [DEBUG] Source used:', NEXT_PUBLIC_API_KEY ? 'NEXT_PUBLIC_OPENWEATHERMAP_API_KEY' : (PRIVATE_API_KEY ? 'OPENWEATHERMAP_API_KEY' : 'NONE'));

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
    windDirection?: number; // Wind direction in degrees
    windDisplay: string; // Formatted wind display (e.g., "SW 6 mph" or "Calm")
    location: string;
    description: string;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    description: string;
  }>;
  moonPhase: {
    phase: string; // Phase name (e.g., "Waxing Crescent")
    illumination: number; // Percentage of illumination (0-100)
    emoji: string; // Unicode moon symbol
    phaseAngle: number; // Phase angle in degrees (0-360)
  };
}

export default function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [hasSearched, setHasSearched] = useState(false)
  const [lastSearchTerm, setLastSearchTerm] = useState<string>("")

  // Load default location on first mount
  useEffect(() => {
    if (!hasSearched) {
      handleSearch("New York, NY") // Default location with better format
    }
  }, [hasSearched])

  const handleSearch = async (locationInput: string) => {
    if (!API_KEY) {
      setError("API key not configured. Please check your environment variables.")
      return
    }

    setLoading(true)
    setError("")
    setHasSearched(true)
    setLastSearchTerm(locationInput)

    try {
      const weatherData = await fetchWeatherData(locationInput, API_KEY)
      setWeather(weatherData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async () => {
    if (!API_KEY) {
      setError("API key not configured. Please check your environment variables.")
      return
    }

    setLoading(true)
    setError("")
    setHasSearched(true)
    setLastSearchTerm("your location")

    try {
      const weatherData = await fetchWeatherByLocation(API_KEY)
      setWeather(weatherData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get location weather")
    } finally {
      setLoading(false)
    }
  }

  const showingWeather = weather && !loading && !error

  // Format wind display with smaller gust text
  const formatWindDisplayHTML = (windDisplay: string): string => {
    // Check if the wind display contains gust information
    if (windDisplay.includes('(gusts ')) {
      // Split the wind display to separate main wind and gust info
      const parts = windDisplay.split(' (gusts ');
      const mainWind = parts[0]; // e.g., "SW 12 mph"
      const gustPart = parts[1].replace(')', ''); // e.g., "18 mph"
      
      return `
        <div class="text-lg font-bold text-[#ffe66d]">${mainWind}</div>
        <div class="text-xs text-[#4ecdc4] mt-1 opacity-80">Gusts ${gustPart}</div>
      `;
    }
    
    // For wind without gusts, return normal formatting
    return `<div class="text-lg font-bold text-[#ffe66d]">${windDisplay}</div>`;
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e0e0e0] p-4 pixel-font relative">
      {/* Moon Phase Watermark */}
      {showingWeather && (
        <MoonPhaseWatermark 
          phase={weather.moonPhase.phase}
          phaseAngle={weather.moonPhase.phaseAngle}
          illumination={weather.moonPhase.illumination}
        />
      )}

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-8 pt-4 relative z-10">
          <h1 className="text-3xl font-bold tracking-wider text-[#00d4ff] pixel-glow mb-2">16-BIT WEATHER</h1>
          {showingWeather && (
            <div className="text-sm text-[#ff6b6b]">{weather.current.location}</div>
          )}
          {lastSearchTerm && !showingWeather && !loading && (
            <div className="text-xs text-[#4ecdc4]">Last search: {lastSearchTerm}</div>
          )}
        </header>

        {/* Search Component */}
        <div className="relative z-10">
          <WeatherSearch
            onSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
            isLoading={loading}
            error={error}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 relative z-10">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#00d4ff]" />
            <p className="mt-4 text-xl text-[#00d4ff] uppercase tracking-wider">LOADING...</p>
            <p className="mt-2 text-sm text-[#4ecdc4]">
              {lastSearchTerm === "your location" ? "Getting your location..." : `Searching for: ${lastSearchTerm}`}
            </p>
          </div>
        )}

        {/* Weather Display */}
        {showingWeather && (
          <div className="relative z-10">
            {/* Current Weather */}
            <div className="bg-[#16213e] p-6 rounded-none mb-6 border-2 border-[#00d4ff] pixel-shadow relative">
              <div className="text-center mb-4">
                <div className="flex justify-center mb-4">
                  <WeatherIcon condition={weather.current.condition} size="large" />
                </div>
                <div className="text-6xl font-bold text-[#00d4ff] pixel-glow mb-2">{weather.current.temp}°</div>
                <div className="text-lg uppercase tracking-wider text-[#ff6b6b] mb-1">{weather.current.condition}</div>
                <div className="text-xs text-[#4ecdc4] capitalize">{weather.current.description}</div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-[#1a1a2e] p-3 border border-[#4ecdc4] text-center">
                  <div className="text-xs text-[#4ecdc4] mb-1">HUMIDITY</div>
                  <div className="text-lg font-bold text-[#ffe66d]">{weather.current.humidity}%</div>
                </div>
                <div className="bg-[#1a1a2e] p-3 border border-[#4ecdc4] text-center">
                  <div className="text-xs text-[#4ecdc4] mb-1">WIND</div>
                  <div dangerouslySetInnerHTML={{ __html: formatWindDisplayHTML(weather.current.windDisplay) }}></div>
                </div>
              </div>
            </div>

            {/* Forecast */}
            <div className="bg-[#16213e] p-4 rounded-none border-2 border-[#00d4ff] pixel-shadow">
              <h2 className="text-lg font-bold mb-4 text-[#00d4ff] uppercase tracking-wider">3-DAY FORECAST</h2>
              <div className="grid grid-cols-3 gap-3">
                {weather.forecast.map((day, index) => (
                  <div key={index} className="bg-[#1a1a2e] p-3 border border-[#4ecdc4] text-center">
                    <div className="text-xs font-bold text-[#4ecdc4] mb-2">{day.day}</div>
                    <div className="flex justify-center mb-2">
                      <WeatherIcon condition={day.condition} size="small" />
                    </div>
                    <div className="text-lg font-bold text-[#ffe66d]">{day.temp}°</div>
                    <div className="text-xs text-[#4ecdc4] mt-1 capitalize truncate" title={day.description}>
                      {day.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moon Phase Info */}
            <div className="mt-4 text-center">
              <div className="inline-block bg-[#1a1a2e] border border-[#4ecdc4] px-3 py-2">
                <div className="text-xs text-[#4ecdc4] uppercase tracking-wider">
                  🌙 LUNAR: {weather.moonPhase.phase} • {weather.moonPhase.illumination}% LIT
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome message for first-time users */}
        {!hasSearched && !loading && (
          <div className="text-center py-8 relative z-10">
            <div className="text-[#4ecdc4] mb-4">
              <div className="text-2xl mb-2">🌤️</div>
              <div className="text-lg uppercase tracking-wider">WELCOME TO 16-BIT WEATHER</div>
            </div>
            <div className="text-sm text-[#ff6b6b] uppercase tracking-wider mb-4">
              MULTIPLE FORMAT SUPPORT
            </div>
            <div className="text-xs text-[#4ecdc4] space-y-1">
              <div>► ZIP CODES: 90210, 10001</div>
              <div>► US CITIES: Los Angeles, CA</div>
              <div>► INTERNATIONAL: London, UK</div>
              <div>► OR USE YOUR LOCATION</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-[#4ecdc4] relative z-10">
          {!API_KEY && (
            <div className="text-[#ff6b6b] text-center">
              ⚠ API KEY NOT CONFIGURED
            </div>
          )}
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

// Moon Phase Watermark Component
function MoonPhaseWatermark({ phase, phaseAngle, illumination }: { 
  phase: string; 
  phaseAngle: number; 
  illumination: number; 
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className="opacity-[0.06] transform scale-125 translate-x-8 translate-y-4">
        <MoonSVG phase={phase} phaseAngle={phaseAngle} illumination={illumination} />
      </div>
    </div>
  );
}

// Custom SVG Moon Phase Component
function MoonSVG({ phase, phaseAngle, illumination }: { 
  phase: string; 
  phaseAngle: number; 
  illumination: number; 
}) {
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  // Simplified moon phase visualization using emoji-style approach
  const getMoonShape = () => {
    if (phase === 'New Moon') {
      return (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.3"
        />
      );
    }
    
    if (phase === 'Full Moon') {
      return (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="currentColor"
          opacity="0.3"
        />
      );
    }
    
    // For crescent and gibbous phases, use a simple approach
    const isWaxing = phaseAngle <= 180;
    const phaseProgress = phaseAngle <= 180 ? phaseAngle / 180 : (360 - phaseAngle) / 180;
    
    // Calculate illuminated width
    const illuminatedWidth = radius * 2 * (illumination / 100);
    
    return (
      <g>
        {/* Moon outline */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.2"
        />
        
        {/* Illuminated portion */}
        <ellipse
          cx={isWaxing ? centerX - radius + illuminatedWidth/2 : centerX + radius - illuminatedWidth/2}
          cy={centerY}
          rx={illuminatedWidth/2}
          ry={radius}
          fill="currentColor"
          opacity="0.25"
        />
      </g>
    );
  };

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="text-[#4ecdc4]">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      
      {/* Glow effect */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 20}
        fill="url(#moonGlow)"
      />
      
      {/* Moon shape */}
      {getMoonShape()}
      
      {/* Phase name and illumination - positioned below */}
      <text
        x={centerX}
        y={centerY + radius + 25}
        textAnchor="middle"
        className="fill-current text-[10px] font-mono uppercase tracking-wider opacity-40"
      >
        {phase.replace(' ', '\u00A0')}
      </text>
      <text
        x={centerX}
        y={centerY + radius + 38}
        textAnchor="middle"
        className="fill-current text-[9px] font-mono opacity-30"
      >
        {illumination}% ILLUMINATED
      </text>
    </svg>
  );
}

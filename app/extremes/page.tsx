"use client"

import { useState, useEffect, useRef } from "react"
import PageWrapper from "@/components/page-wrapper"
import { Loader2, TrendingUp, TrendingDown, MapPin, RefreshCw, Thermometer } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { ExtremesData } from "@/lib/extremes/extremes-data"

export default function ExtremesPage() {
  const [data, setData] = useState<ExtremesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { theme } = useTheme()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Theme-based classes
  const themeClasses = {
    dark: {
      bg: 'bg-gray-900',
      cardBg: 'bg-gray-800',
      text: 'text-green-400',
      subtext: 'text-green-300',
      border: 'border-green-500',
      hot: 'text-red-500',
      cold: 'text-cyan-400',
      glow: 'drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]'
    },
    miami: {
      bg: 'bg-gradient-to-b from-purple-900 to-pink-900',
      cardBg: 'bg-black/50',
      text: 'text-pink-400',
      subtext: 'text-cyan-300',
      border: 'border-cyan-400',
      hot: 'text-yellow-400',
      cold: 'text-blue-400',
      glow: 'drop-shadow-[0_0_15px_rgba(236,72,153,0.7)]'
    },
    tron: {
      bg: 'bg-black',
      cardBg: 'bg-gray-900/90',
      text: 'text-cyan-400',
      subtext: 'text-cyan-300',
      border: 'border-cyan-500',
      hot: 'text-orange-500',
      cold: 'text-blue-500',
      glow: 'drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]'
    }
  }

  const currentTheme = themeClasses[theme] || themeClasses.dark

  // Fetch extremes data
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let url = '/api/extremes'
      if (userCoords) {
        url += `?lat=${userCoords.lat}&lon=${userCoords.lon}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch extreme temperatures')
      }
      
      const data = await response.json()
      setData(data)
    } catch (err) {
      console.error('Error fetching extremes:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Get user location
  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }

  // Initial fetch
  useEffect(() => {
    getUserLocation()
    fetchData()
  }, [])

  // Re-fetch when user coords change
  useEffect(() => {
    if (userCoords) {
      fetchData()
    }
  }, [userCoords])

  // Auto-refresh every 30 minutes
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData()
      }, 30 * 60 * 1000) // 30 minutes
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, userCoords])

  // Thermometer visualization component
  const Thermometer = ({ temp, max = 140, min = -100 }: { temp: number; max?: number; min?: number }) => {
    const percentage = ((temp - min) / (max - min)) * 100
    const isHot = temp > 32
    
    return (
      <div className="relative h-48 w-12 mx-auto">
        {/* Thermometer tube */}
        <div className="absolute inset-0 bg-gray-700 rounded-full border-2 border-gray-600">
          {/* Mercury fill */}
          <div 
            className={`absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-1000 ${
              isHot ? 'bg-gradient-to-t from-red-600 to-orange-400' : 'bg-gradient-to-t from-blue-600 to-cyan-400'
            }`}
            style={{ height: `${Math.max(5, Math.min(95, percentage))}%` }}
          />
        </div>
        {/* Bulb */}
        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full ${
          isHot ? 'bg-red-500' : 'bg-blue-500'
        } border-2 border-gray-600`}>
          <div className="flex items-center justify-center h-full text-white font-bold text-xs">
            {temp}°
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading && !data) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`text-center ${currentTheme.text}`}>
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
            <div className="text-xl font-mono uppercase tracking-wider">
              Scanning Global Temperatures...
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Error state
  if (error) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`text-center ${currentTheme.text}`}>
            <div className="text-xl font-mono uppercase tracking-wider mb-4">
              ERROR: {error}
            </div>
            <button
              onClick={fetchData}
              className={`px-6 py-3 border-2 ${currentTheme.border} ${currentTheme.text} 
                       hover:bg-opacity-20 hover:bg-white transition-all duration-200 
                       font-mono uppercase tracking-wider`}
            >
              RETRY
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!data) return null

  return (
    <PageWrapper>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-mono font-bold mb-2 ${currentTheme.text} ${currentTheme.glow}`}>
            🌍 PLANET EXTREMES 🌡️
          </h1>
          <div className={`text-sm sm:text-base ${currentTheme.subtext} font-mono uppercase tracking-wider`}>
            GLOBAL TEMPERATURE CHAMPIONS • LIVE DATA
          </div>
          <div className={`text-xs mt-2 ${currentTheme.subtext} opacity-75`}>
            Last Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </div>
        </div>

        {/* Main Extremes Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Hottest Place */}
          <div className={`${currentTheme.cardBg} p-6 rounded-lg border-2 ${currentTheme.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-mono font-bold ${currentTheme.hot}`}>
                🔥 HOTTEST ON EARTH
              </h2>
              <TrendingUp className={currentTheme.hot} />
            </div>
            
            {data.hottest && (
              <>
                <div className="mb-4">
                  <Thermometer temp={data.hottest.temp} />
                </div>
                
                <div className={`text-3xl font-mono font-bold mb-2 ${currentTheme.hot} text-center`}>
                  {data.hottest.temp}°F / {data.hottest.tempC}°C
                </div>
                
                <div className={`text-lg font-mono mb-2 ${currentTheme.text} text-center`}>
                  {data.hottest.emoji} {data.hottest.name}, {data.hottest.country}
                </div>
                
                <div className={`text-sm ${currentTheme.subtext} mb-2`}>
                  Condition: {data.hottest.condition}
                </div>
                
                <div className={`text-sm ${currentTheme.subtext} mb-2`}>
                  Humidity: {data.hottest.humidity}% | Wind: {data.hottest.windSpeed} mph
                </div>
                
                {data.hottest.fact && (
                  <div className={`text-xs ${currentTheme.subtext} italic mt-3 p-2 border ${currentTheme.border} rounded`}>
                    💡 {data.hottest.fact}
                  </div>
                )}
                
                {data.hottest.historicalAvg && (
                  <div className={`text-xs ${currentTheme.subtext} mt-2`}>
                    Typical: Summer {data.hottest.historicalAvg.summer}°F | Winter {data.hottest.historicalAvg.winter}°F
                  </div>
                )}
              </>
            )}
          </div>

          {/* Coldest Place */}
          <div className={`${currentTheme.cardBg} p-6 rounded-lg border-2 ${currentTheme.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-mono font-bold ${currentTheme.cold}`}>
                🧊 COLDEST ON EARTH
              </h2>
              <TrendingDown className={currentTheme.cold} />
            </div>
            
            {data.coldest && (
              <>
                <div className="mb-4">
                  <Thermometer temp={data.coldest.temp} />
                </div>
                
                <div className={`text-3xl font-mono font-bold mb-2 ${currentTheme.cold} text-center`}>
                  {data.coldest.temp}°F / {data.coldest.tempC}°C
                </div>
                
                <div className={`text-lg font-mono mb-2 ${currentTheme.text} text-center`}>
                  {data.coldest.emoji} {data.coldest.name}, {data.coldest.country}
                </div>
                
                <div className={`text-sm ${currentTheme.subtext} mb-2`}>
                  Condition: {data.coldest.condition}
                </div>
                
                <div className={`text-sm ${currentTheme.subtext} mb-2`}>
                  Humidity: {data.coldest.humidity}% | Wind: {data.coldest.windSpeed} mph
                </div>
                
                {data.coldest.fact && (
                  <div className={`text-xs ${currentTheme.subtext} italic mt-3 p-2 border ${currentTheme.border} rounded`}>
                    💡 {data.coldest.fact}
                  </div>
                )}
                
                {data.coldest.historicalAvg && (
                  <div className={`text-xs ${currentTheme.subtext} mt-2`}>
                    Typical: Summer {data.coldest.historicalAvg.summer}°F | Winter {data.coldest.historicalAvg.winter}°F
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Temperature Leaderboards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top 5 Hottest */}
          <div className={`${currentTheme.cardBg} p-6 rounded-lg border-2 ${currentTheme.border}`}>
            <h3 className={`text-lg font-mono font-bold mb-4 ${currentTheme.hot}`}>
              🏆 TOP 5 HOTTEST
            </h3>
            <div className="space-y-2">
              {data.topHot.map((loc, index) => (
                <div key={index} className={`flex items-center justify-between p-2 border ${currentTheme.border} rounded`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${currentTheme.hot}`}>
                      #{index + 1}
                    </span>
                    <span className={currentTheme.text}>
                      {loc.emoji} {loc.name}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${currentTheme.hot}`}>
                    {loc.temp}°F
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Coldest */}
          <div className={`${currentTheme.cardBg} p-6 rounded-lg border-2 ${currentTheme.border}`}>
            <h3 className={`text-lg font-mono font-bold mb-4 ${currentTheme.cold}`}>
              🏆 TOP 5 COLDEST
            </h3>
            <div className="space-y-2">
              {data.topCold.map((loc, index) => (
                <div key={index} className={`flex items-center justify-between p-2 border ${currentTheme.border} rounded`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${currentTheme.cold}`}>
                      #{index + 1}
                    </span>
                    <span className={currentTheme.text}>
                      {loc.emoji} {loc.name}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${currentTheme.cold}`}>
                    {loc.temp}°F
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Location Ranking */}
        {data.userLocation && (
          <div className={`${currentTheme.cardBg} p-6 rounded-lg border-2 ${currentTheme.border} mb-8`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-mono font-bold ${currentTheme.text}`}>
                <MapPin className="inline mr-2" />
                YOUR LOCATION RANKING
              </h3>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-mono font-bold mb-2 ${currentTheme.text}`}>
                {data.userLocation.temp}°F / {data.userLocation.tempC}°C
              </div>
              <div className={`text-lg ${currentTheme.subtext}`}>
                Global Rank: #{data.userLocation.globalRank} of {data.userLocation.totalLocations}
              </div>
              <div className={`text-sm ${currentTheme.subtext} mt-2`}>
                {data.userLocation.globalRank && data.userLocation.globalRank <= 5 && "🔥 You're in one of the hottest places!"}
                {data.userLocation.globalRank && data.userLocation.globalRank > data.userLocation.totalLocations - 5 && "🧊 You're in one of the coldest places!"}
                {data.userLocation.globalRank && 
                 data.userLocation.globalRank > 5 && 
                 data.userLocation.globalRank <= data.userLocation.totalLocations - 5 && 
                 "😎 You're in the comfortable middle!"}
              </div>
            </div>
          </div>
        )}

        {/* Temperature Difference */}
        {data.hottest && data.coldest && (
          <div className={`${currentTheme.cardBg} p-6 rounded-lg border-2 ${currentTheme.border} text-center`}>
            <h3 className={`text-lg font-mono font-bold mb-4 ${currentTheme.text}`}>
              🌡️ GLOBAL TEMPERATURE SPREAD
            </h3>
            <div className={`text-3xl font-mono font-bold ${currentTheme.text}`}>
              {Math.abs(data.hottest.temp - data.coldest.temp)}°F
            </div>
            <div className={`text-sm ${currentTheme.subtext} mt-2`}>
              Difference between hottest and coldest places on Earth right now
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={fetchData}
            disabled={loading}
            className={`px-6 py-3 border-2 ${currentTheme.border} ${currentTheme.text} 
                     hover:bg-opacity-20 hover:bg-white transition-all duration-200 
                     font-mono uppercase tracking-wider disabled:opacity-50 
                     disabled:cursor-not-allowed flex items-center gap-2`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-6 py-3 border-2 ${currentTheme.border} ${currentTheme.text} 
                     hover:bg-opacity-20 hover:bg-white transition-all duration-200 
                     font-mono uppercase tracking-wider`}
          >
            AUTO-REFRESH: {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* ASCII Art Footer */}
        <div className={`text-center mt-12 ${currentTheme.subtext} opacity-50`}>
          <pre className="text-xs inline-block">
{`     .-.     .-.     .-.     .-.     .-.     .-.
   .'   '._..'   '._..'   '._..'   '._..'   '._..'
   :     HOT     COLD     HOT     COLD     HOT   :
   '.   .'   '.   .'   '.   .'   '.   .'   '.   .'
     '-'     '-'     '-'     '-'     '-'     '-'`}
          </pre>
        </div>
      </div>
    </PageWrapper>
  )
}

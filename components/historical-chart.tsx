"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"

// Theme types
type ThemeType = 'dark' | 'miami' | 'tron';

interface HistoricalChartProps {
  currentTheme: ThemeType
  latitude?: number
  longitude?: number
  locationName?: string
}

interface HistoricalData {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

export default function HistoricalChart({ currentTheme, latitude, longitude, locationName }: HistoricalChartProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(false)

  // Get theme colors
  const getThemeColors = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          cardBg: '#16213e',
          border: '#00d4ff',
          text: '#e0e0e0',
          accent: '#00d4ff',
          shadow: '#00d4ff',
          high: '#ff6b6b',
          low: '#4ecdc4'
        }
      case 'miami':
        return {
          cardBg: '#4a0e4e',
          border: '#ff1493',
          text: '#00ffff',
          accent: '#ff007f',
          shadow: '#ff1493',
          high: '#ff69b4',
          low: '#00bcd4'
        }
      case 'tron':
        return {
          cardBg: '#000000',
          border: '#00FFFF',
          text: '#FFFFFF',
          accent: '#00FFFF',
          shadow: '#00FFFF',
          high: '#FF6B6B',
          low: '#4ECDC4'
        }
    }
  }

  const themeColors = getThemeColors(currentTheme)

  // Fetch historical data for the last 30 years
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!latitude || !longitude) return

      setLoading(true)
      setError("")

      try {
        const today = new Date()
        const currentYear = today.getFullYear()
        const startYear = currentYear - 30
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')

        // Fetch historical data for today's date over the last 30 years
        const response = await fetch(
          `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startYear}-${month}-${day}&end_date=${currentYear}-${month}-${day}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch historical data')
        }

        const data = await response.json()
        setHistoricalData(data)
      } catch (err) {
        setError('Historical data unavailable')
        console.warn('Historical data fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [latitude, longitude])

  // Calculate statistics
  const getStatistics = () => {
    if (!historicalData?.daily) return null

    const highs = historicalData.daily.temperature_2m_max.filter(temp => temp !== null)
    const lows = historicalData.daily.temperature_2m_min.filter(temp => temp !== null)

    if (highs.length === 0 || lows.length === 0) return null

    const maxHigh = Math.max(...highs)
    const minHigh = Math.min(...highs)
    const avgHigh = highs.reduce((sum, temp) => sum + temp, 0) / highs.length

    const maxLow = Math.max(...lows)
    const minLow = Math.min(...lows)
    const avgLow = lows.reduce((sum, temp) => sum + temp, 0) / lows.length

    return {
      recordHigh: Math.round(maxHigh * 9/5 + 32), // Convert to Fahrenheit
      recordLow: Math.round(minLow * 9/5 + 32),
      avgHigh: Math.round(avgHigh * 9/5 + 32),
      avgLow: Math.round(avgLow * 9/5 + 32),
      years: highs.length
    }
  }

  const stats = getStatistics()
  const today = new Date()
  const todayString = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  })

  if (!latitude || !longitude) {
    return null // Don't show if no coordinates
  }

  return (
    <div 
      className="border-4 transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: themeColors.cardBg,
        borderColor: themeColors.border,
        boxShadow: `0 0 15px ${themeColors.shadow}33`
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="p-4 border-b-2" style={{ borderColor: themeColors.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" style={{ color: themeColors.accent }} />
            <h3 className="font-mono font-bold text-lg uppercase tracking-wider"
                style={{ color: themeColors.accent }}>
              THIS DAY IN HISTORY
            </h3>
          </div>
          <div className="text-xs font-mono" style={{ color: themeColors.text }}>
            {todayString}
          </div>
        </div>
        {locationName && (
          <p className="text-sm font-mono mt-1" style={{ color: themeColors.text }}>
            {locationName}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2"
                 style={{ borderColor: themeColors.accent }}></div>
            <p className="text-sm font-mono" style={{ color: themeColors.text }}>
              Loading historical data...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm font-mono" style={{ color: themeColors.text }}>
              {error}
            </p>
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <TrendingUp className="w-4 h-4" style={{ color: themeColors.high }} />
                  <span className="text-xs font-mono" style={{ color: themeColors.text }}>
                    RECORD HIGH
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono" style={{ color: themeColors.high }}>
                  {stats.recordHigh}°F
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <TrendingDown className="w-4 h-4" style={{ color: themeColors.low }} />
                  <span className="text-xs font-mono" style={{ color: themeColors.text }}>
                    RECORD LOW
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono" style={{ color: themeColors.low }}>
                  {stats.recordLow}°F
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-3 pt-4 border-t-2" style={{ borderColor: themeColors.border }}>
                {/* Average Temperatures */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <span className="text-xs font-mono block" style={{ color: themeColors.text }}>
                      AVG HIGH
                    </span>
                    <div className="text-lg font-bold font-mono" style={{ color: themeColors.accent }}>
                      {stats.avgHigh}°F
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-mono block" style={{ color: themeColors.text }}>
                      AVG LOW
                    </span>
                    <div className="text-lg font-bold font-mono" style={{ color: themeColors.accent }}>
                      {stats.avgLow}°F
                    </div>
                  </div>
                </div>

                {/* Data Info */}
                <div className="text-center pt-2">
                  <p className="text-xs font-mono" style={{ color: themeColors.text }}>
                    Based on {stats.years} years of data
                  </p>
                </div>

                {/* Simple Temperature Range Visualization */}
                <div className="pt-2">
                  <div className="h-4 relative border-2 rounded" style={{ borderColor: themeColors.border }}>
                    <div 
                      className="h-full rounded"
                      style={{
                        background: `linear-gradient(to right, ${themeColors.low}66 0%, ${themeColors.accent}33 50%, ${themeColors.high}66 100%)`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                      <span className="text-xs font-mono font-bold" style={{ color: themeColors.low }}>
                        {stats.recordLow}°
                      </span>
                      <span className="text-xs font-mono font-bold" style={{ color: themeColors.high }}>
                        {stats.recordHigh}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Click to expand hint */}
            <div className="text-center pt-2">
              <p className="text-xs font-mono" style={{ color: themeColors.text }}>
                {isExpanded ? 'Click to collapse' : 'Click to expand details'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm font-mono" style={{ color: themeColors.text }}>
              No historical data available
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
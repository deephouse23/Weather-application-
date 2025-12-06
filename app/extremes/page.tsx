"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import { useState, useEffect, useRef } from "react"
import PageWrapper from "@/components/page-wrapper"
import { Loader2, TrendingUp, TrendingDown, MapPin, RefreshCw } from "lucide-react"
import { ExtremesData, LocationTemperature } from "@/lib/extremes/extremes-data"

// Client-side cache management
const CACHE_KEY = '16bit-weather-extremes-cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCachedExtremesClient(): ExtremesData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const age = Date.now() - data.lastUpdated;

    if (age > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCachedExtremesClient(data: ExtremesData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

export default function ExtremesPage() {
  const [data, setData] = useState<ExtremesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<LocationTemperature | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleLocationClick = (location: LocationTemperature) => {
    setSelectedLocation(location)
  }

  // Fetch extremes data
  const fetchData = async (skipCache = false) => {
    try {
      // Check client-side cache first
      if (!skipCache) {
        const cached = getCachedExtremesClient();
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true)
      setError(null)

      let url = '/api/extremes'
      if (userCoords) {
        url += `?lat=${userCoords.lat}&lon=${userCoords.lon}`
      }

      const response = await fetch(url)
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to fetch extreme temperatures')
      }

      setData(responseData)
      setCachedExtremesClient(responseData) // Cache on client side
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
      fetchData(true) // Skip cache when user location changes
    }
  }, [userCoords])

  // Auto-refresh every 30 minutes
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true) // Skip cache for refresh
      }, 30 * 60 * 1000) // 30 minutes
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, userCoords])

  // Thermometer visualization component with theme colors
  const ThermometerViz = ({ temp, max = 140, min = -100 }: { temp: number; max?: number; min?: number }) => {
    const percentage = ((temp - min) / (max - min)) * 100
    const isHot = temp > 32

    return (
      <div className="relative h-48 w-12 mx-auto">
        {/* Thermometer tube */}
        <div className="absolute inset-0 bg-weather-bg-elev rounded-full border-2 border-weather-border">
          {/* Mercury fill - using theme colors */}
          <div
            className={`absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-1000 ${isHot
                ? 'bg-gradient-to-t from-weather-danger via-weather-warn to-weather-warn'
                : 'bg-gradient-to-t from-weather-primary via-weather-primary to-cyan-300'
              }`}
            style={{ height: `${Math.max(5, Math.min(95, percentage))}%` }}
          />
        </div>
        {/* Bulb */}
        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full ${isHot ? 'bg-weather-danger' : 'bg-weather-primary'
          } border-2 border-weather-border`}>
          <div className="flex items-center justify-center h-full text-weather-bg font-bold text-xs">
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
          <div className="text-center text-weather-primary">
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
          <div className="text-center text-weather-danger">
            <div className="text-xl font-mono uppercase tracking-wider mb-4">
              ERROR: {error}
            </div>
            <button
              onClick={() => fetchData(true)}
              className="px-6 py-3 border-2 border-weather-danger text-weather-danger 
                       hover:bg-weather-danger hover:text-weather-bg transition-all duration-200 
                       font-mono uppercase tracking-wider"
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold mb-2 text-weather-primary glow">
            🌍 PLANET EXTREMES 🌡️
          </h1>
          <div className="text-sm sm:text-base text-weather-text font-mono uppercase tracking-wider">
            GLOBAL TEMPERATURE CHAMPIONS • LIVE DATA
          </div>
          <div className="text-xs mt-2 text-weather-muted opacity-75">
            Last Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </div>
        </div>

        {/* Main Extremes Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Hottest Place */}
          <div
            onClick={() => data.hottest && handleLocationClick(data.hottest)}
            className="bg-weather-bg-elev p-6 rounded-lg border-2 border-weather-border pixel-border cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-mono font-bold text-weather-warn">
                🔥 HOTTEST ON EARTH
              </h2>
              <TrendingUp className="text-weather-warn" />
            </div>

            {data.hottest && (
              <>
                <div className="mb-4">
                  <ThermometerViz temp={data.hottest.temp} />
                </div>

                <div className="text-3xl font-mono font-bold mb-2 text-weather-warn text-center">
                  {data.hottest.temp}°F / {data.hottest.tempC}°C
                </div>

                <div className="text-lg font-mono mb-2 text-weather-text text-center">
                  {data.hottest.emoji} {data.hottest.name}, {data.hottest.country}
                </div>

                <div className="text-sm text-weather-muted mb-2">
                  Condition: {data.hottest.condition}
                </div>

                <div className="text-sm text-weather-muted mb-2">
                  Humidity: {data.hottest.humidity}% | Wind: {data.hottest.windSpeed} mph
                </div>

                {data.hottest.fact && (
                  <div className="text-xs text-weather-muted italic mt-3 p-2 border border-weather-border rounded bg-weather-bg/50">
                    💡 {data.hottest.fact}
                  </div>
                )}

                {data.hottest.historicalAvg && (
                  <div className="text-xs text-weather-muted mt-2">
                    Typical: Summer {data.hottest.historicalAvg.summer}°F | Winter {data.hottest.historicalAvg.winter}°F
                  </div>
                )}
              </>
            )}
          </div>

          {/* Coldest Place */}
          <div
            onClick={() => data.coldest && handleLocationClick(data.coldest)}
            className="bg-weather-bg-elev p-6 rounded-lg border-2 border-weather-border pixel-border cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-mono font-bold text-weather-primary">
                🧊 COLDEST ON EARTH
              </h2>
              <TrendingDown className="text-weather-primary" />
            </div>

            {data.coldest && (
              <>
                <div className="mb-4">
                  <ThermometerViz temp={data.coldest.temp} />
                </div>

                <div className="text-3xl font-mono font-bold mb-2 text-weather-primary text-center">
                  {data.coldest.temp}°F / {data.coldest.tempC}°C
                </div>

                <div className="text-lg font-mono mb-2 text-weather-text text-center">
                  {data.coldest.emoji} {data.coldest.name}, {data.coldest.country}
                </div>

                <div className="text-sm text-weather-muted mb-2">
                  Condition: {data.coldest.condition}
                </div>

                <div className="text-sm text-weather-muted mb-2">
                  Humidity: {data.coldest.humidity}% | Wind: {data.coldest.windSpeed} mph
                </div>

                {data.coldest.fact && (
                  <div className="text-xs text-weather-muted italic mt-3 p-2 border border-weather-border rounded bg-weather-bg/50">
                    💡 {data.coldest.fact}
                  </div>
                )}

                {data.coldest.historicalAvg && (
                  <div className="text-xs text-weather-muted mt-2">
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
          <div className="bg-weather-bg-elev p-6 rounded-lg border-2 border-weather-border pixel-border">
            <h3 className="text-lg font-mono font-bold mb-4 text-weather-warn">
              🏆 TOP 5 HOTTEST
            </h3>
            <div className="space-y-2">
              {data.topHot.map((loc, index) => (
                <div
                  key={index}
                  onClick={() => handleLocationClick(loc)}
                  className="flex items-center justify-between p-2 border border-weather-border rounded bg-weather-bg/50 cursor-pointer hover:bg-weather-warn/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-weather-warn">
                      #{index + 1}
                    </span>
                    <span className="text-weather-text">
                      {loc.emoji} {loc.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-weather-warn">
                    {loc.temp}°F
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Coldest */}
          <div className="bg-weather-bg-elev p-6 rounded-lg border-2 border-weather-border pixel-border">
            <h3 className="text-lg font-mono font-bold mb-4 text-weather-primary">
              🏆 TOP 5 COLDEST
            </h3>
            <div className="space-y-2">
              {data.topCold.map((loc, index) => (
                <div
                  key={index}
                  onClick={() => handleLocationClick(loc)}
                  className="flex items-center justify-between p-2 border border-weather-border rounded bg-weather-bg/50 cursor-pointer hover:bg-weather-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-weather-primary">
                      #{index + 1}
                    </span>
                    <span className="text-weather-text">
                      {loc.emoji} {loc.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-weather-primary">
                    {loc.temp}°F
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Location Ranking */}
        {data.userLocation && (
          <div className="bg-weather-bg-elev p-6 rounded-lg border-2 border-weather-border pixel-border mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-mono font-bold text-weather-text">
                <MapPin className="inline mr-2 text-weather-primary" />
                YOUR LOCATION RANKING
              </h3>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold mb-2 text-weather-primary">
                {data.userLocation.temp}°F / {data.userLocation.tempC}°C
              </div>
              <div className="text-lg text-weather-text">
                Global Rank: #{data.userLocation.globalRank} of {data.userLocation.totalLocations}
              </div>
              <div className="text-sm text-weather-muted mt-2">
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
          <div className="bg-weather-bg-elev p-6 rounded-lg border-2 border-weather-border pixel-border text-center">
            <h3 className="text-lg font-mono font-bold mb-4 text-weather-text">
              🌡️ GLOBAL TEMPERATURE SPREAD
            </h3>
            <div className="text-3xl font-mono font-bold text-weather-primary glow">
              {Math.abs(data.hottest.temp - data.coldest.temp)}°F
            </div>
            <div className="text-sm text-weather-muted mt-2">
              Difference between hottest and coldest places on Earth right now
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            className="px-6 py-3 border-2 border-weather-primary text-weather-primary 
                       hover:bg-weather-primary hover:text-weather-bg transition-all duration-200 
                       font-mono uppercase tracking-wider disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center gap-2 pixel-border"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="px-6 py-3 border-2 border-weather-primary text-weather-primary 
                       hover:bg-weather-primary hover:text-weather-bg transition-all duration-200 
                       font-mono uppercase tracking-wider pixel-border"
          >
            AUTO-REFRESH: {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* ASCII Art Footer */}
        <div className="text-center mt-12 text-weather-muted opacity-50">
          <pre className="text-xs inline-block font-mono">
            {`     .-.     .-.     .-.     .-.     .-.     .-.
   .'   '._..'   '._..'   '._..'   '._..'   '._..'
   :     HOT     COLD     HOT     COLD     HOT   :
   '.   .'   '.   .'   '.   .'   '.   .'   '.   .'
     '-'     '-'     '-'     '-'     '-'     '-'`}
          </pre>
        </div>

        {/* Location Details Modal */}
        {selectedLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="bg-weather-bg-elev w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border-4 border-weather-primary pixel-border shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6 border-b-2 border-weather-border pb-4">
                  <div>
                    <h2 className="text-2xl font-mono font-bold text-weather-primary flex items-center gap-3">
                      <span className="text-4xl">{selectedLocation.emoji}</span>
                      {selectedLocation.name}
                    </h2>
                    <div className="text-weather-muted font-mono uppercase tracking-wider mt-1">
                      {selectedLocation.country} • {Math.round(selectedLocation.lat * 10) / 10}°N, {Math.round(selectedLocation.lon * 10) / 10}°E
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-weather-muted hover:text-weather-text p-2 hover:bg-weather-bg rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-weather-text uppercase mb-2 border-b border-weather-border/50 pb-1">
                        Current Conditions
                      </h3>
                      <div className="text-4xl font-mono font-bold text-weather-primary mb-2">
                        {selectedLocation.temp}°F <span className="text-xl text-weather-muted">/ {selectedLocation.tempC}°C</span>
                      </div>
                      <div className="space-y-1 text-sm font-mono text-weather-text">
                        <div>Condition: {selectedLocation.condition}</div>
                        <div>Humidity: {selectedLocation.humidity}%</div>
                        <div>Wind: {selectedLocation.windSpeed} mph</div>
                      </div>
                    </div>

                    {selectedLocation.description && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-weather-text uppercase mb-2 border-b border-weather-border/50 pb-1">
                          About
                        </h3>
                        <p className="text-sm text-weather-text leading-relaxed">
                          {selectedLocation.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {selectedLocation.climateType && (
                      <div>
                        <h3 className="text-sm font-bold text-weather-text uppercase mb-2 border-b border-weather-border/50 pb-1">
                          Climate Profile
                        </h3>
                        <div className="inline-block px-3 py-1 rounded-full bg-weather-primary/20 text-weather-primary text-xs font-bold font-mono border border-weather-primary/50">
                          {selectedLocation.climateType}
                        </div>
                      </div>
                    )}

                    {(selectedLocation.bestTime || selectedLocation.travelTip) && (
                      <div>
                        <h3 className="text-sm font-bold text-weather-text uppercase mb-2 border-b border-weather-border/50 pb-1">
                          Travel Intel
                        </h3>
                        {selectedLocation.bestTime && (
                          <div className="mb-2 text-sm">
                            <span className="font-bold text-weather-primary">Best Time:</span> {selectedLocation.bestTime}
                          </div>
                        )}
                        {selectedLocation.travelTip && (
                          <div className="text-sm italic text-weather-muted p-2 bg-weather-bg rounded border border-weather-border">
                            💡 Tip: {selectedLocation.travelTip}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedLocation.historicalAvg && (
                      <div>
                        <h3 className="text-sm font-bold text-weather-text uppercase mb-2 border-b border-weather-border/50 pb-1">
                          Historical Averages
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-center text-sm">
                          <div className="p-2 bg-weather-warn/10 rounded border border-weather-warn/30">
                            <div className="text-xs text-weather-muted uppercase">Summer</div>
                            <div className="font-bold text-weather-warn">{selectedLocation.historicalAvg.summer}°F</div>
                          </div>
                          <div className="p-2 bg-weather-primary/10 rounded border border-weather-primary/30">
                            <div className="text-xs text-weather-muted uppercase">Winter</div>
                            <div className="font-bold text-weather-primary">{selectedLocation.historicalAvg.winter}°F</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-weather-border text-center">
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="px-8 py-3 bg-weather-primary text-weather-bg font-bold font-mono uppercase tracking-wider rounded hover:opacity-90 transition-opacity"
                  >
                    Close Intel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

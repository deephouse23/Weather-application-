"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { themeUtils, APP_CONSTANTS } from "@/lib/utils"
import RadarDisplay from "@/components/radar-display"

// Theme types
type ThemeType = 'dark' | 'miami' | 'tron';

export default function RadarPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(APP_CONSTANTS.THEMES.DARK)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Get API key from environment variables
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY

  // Client-side mount effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load theme on mount and sync with navigation
  useEffect(() => {
    if (!isClient) return
    
    const storedTheme = themeUtils.getStoredTheme()
    setCurrentTheme(storedTheme)
    
    // Listen for theme changes from navigation
    const handleStorageChange = () => {
      const newTheme = themeUtils.getStoredTheme()
      setCurrentTheme(newTheme)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for theme changes (in case of same-tab changes)
    const interval = setInterval(() => {
      const newTheme = themeUtils.getStoredTheme()
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme)
      }
    }, 100)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [isClient, currentTheme])

  // Get theme classes
  const themeClasses = themeUtils.getThemeClasses(currentTheme)

  // Get location from URL parameters
  const [location, setLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)

  useEffect(() => {
    if (!isClient) return

    // Get location from URL parameters
    const params = new URLSearchParams(window.location.search)
    const lat = parseFloat(params.get('lat') || '')
    const lon = parseFloat(params.get('lon') || '')
    const name = params.get('name') || ''

    if (!isNaN(lat) && !isNaN(lon)) {
      setLocation({ lat, lon, name })
    } else {
      // Redirect to home if no location provided
      router.push('/')
    }
  }, [isClient, router])

  if (!isClient || !location) {
    return null // Don't render anything during SSR or while loading
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} text-white p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-6">
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 border-2 sm:border-4 text-sm sm:text-lg font-mono font-bold uppercase tracking-wider transition-all duration-300 ${themeClasses.borderColor} ${themeClasses.cardBg} ${themeClasses.headerText} touch-manipulation min-h-[44px] hover:${themeClasses.buttonHover}`}
          >
            ← BACK TO WEATHER
          </button>
        </Link>

        {/* Radar Display */}
        <div className={`${themeClasses.cardBg} p-4 sm:p-6 lg:p-8 border-2 sm:border-4 pixel-border ${themeClasses.borderColor} ${themeClasses.specialBorder} text-center`}>
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
            DOPPLER RADAR
          </h1>
          
          <div className="mb-4 sm:mb-6">
            <p className={`${themeClasses.secondaryText} font-mono text-sm sm:text-base`}>
              {location.name}
            </p>
          </div>

          {/* Radar Display Component */}
          <div className="w-full aspect-square max-w-3xl mx-auto">
            <RadarDisplay
              lat={location.lat}
              lon={location.lon}
              apiKey={API_KEY || ''}
              theme={currentTheme}
              locationName={location.name}
            />
          </div>

          {/* Radar Features */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
              <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Base Reflectivity</h3>
              <p className={`${themeClasses.text} text-sm`}>
                Shows precipitation intensity using a color scale from light to heavy.
              </p>
            </div>
            <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
              <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Velocity</h3>
              <p className={`${themeClasses.text} text-sm`}>
                Displays wind speed and direction using Doppler effect measurements.
              </p>
            </div>
            <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder}`}>
              <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Precipitation</h3>
              <p className={`${themeClasses.text} text-sm`}>
                Shows different types of precipitation (rain, snow, mixed) with intensity levels.
              </p>
            </div>
          </div>

          {/* Upcoming Features */}
          <div className={`${themeClasses.background} p-4 border-2 ${themeClasses.secondaryText} ${themeClasses.specialBorder} mt-8`}>
            <h3 className={`${themeClasses.headerText} font-mono text-lg mb-2`}>Coming Soon</h3>
            <ul className={`${themeClasses.text} text-sm space-y-2`}>
              <li>• Storm cell tracking and warnings</li>
              <li>• Lightning strike overlay</li>
              <li>• Temperature and wind overlays</li>
              <li>• Enhanced city markers and landmarks</li>
              <li>• Customizable radar layers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
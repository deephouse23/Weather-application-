"use client"

import { useState, useEffect } from "react"
import PageWrapper from "@/components/page-wrapper"
import { ArrowLeft } from "lucide-react"
import { ThemeType, themeUtils, APP_CONSTANTS } from "@/lib/utils"
import Link from "next/link"

export default function RadarPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(APP_CONSTANTS.THEMES.DARK)
  const themeClasses = themeUtils.getThemeClasses(currentTheme)

  // Load and sync theme using centralized utilities
  useEffect(() => {
    const storedTheme = themeUtils.getStoredTheme()
    setCurrentTheme(storedTheme)
    
    // Listen for theme changes
    const handleStorageChange = () => {
      const newTheme = themeUtils.getStoredTheme()
      setCurrentTheme(newTheme)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for theme changes
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
  }, [currentTheme])

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/"
          className={`inline-flex items-center space-x-2 px-4 py-2 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 mb-6 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO WEATHER</span>
        </Link>

        {/* Radar Container */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-4 border-gray-800">
          {/* Modern Radar Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Modern Doppler Radar</h2>
              <p className="text-gray-400">Coming soon: Professional-grade weather radar visualization</p>
            </div>
          </div>

          {/* Radar Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Base Reflectivity</button>
              <button className="px-3 py-1 bg-gray-700 text-white rounded text-sm">Velocity</button>
              <button className="px-3 py-1 bg-gray-700 text-white rounded text-sm">Precipitation</button>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-700 text-white rounded text-sm">Play</button>
              <button className="px-3 py-1 bg-gray-700 text-white rounded text-sm">Loop</button>
            </div>
          </div>
        </div>

        {/* Radar Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 border-2 ${themeClasses.borderColor} ${themeClasses.background}`}>
            <h3 className={`text-xl font-bold mb-4 ${themeClasses.headerText}`}>Radar Features</h3>
            <ul className={`space-y-2 ${themeClasses.text}`}>
              <li>• Real-time precipitation tracking</li>
              <li>• Storm cell identification</li>
              <li>• Wind speed and direction</li>
              <li>• Severe weather alerts</li>
            </ul>
          </div>
          <div className={`p-6 border-2 ${themeClasses.borderColor} ${themeClasses.background}`}>
            <h3 className={`text-xl font-bold mb-4 ${themeClasses.headerText}`}>Coming Soon</h3>
            <ul className={`space-y-2 ${themeClasses.text}`}>
              <li>• Enhanced radar visualization</li>
              <li>• Historical radar data</li>
              <li>• Custom radar layers</li>
              <li>• Mobile-optimized controls</li>
            </ul>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
} 
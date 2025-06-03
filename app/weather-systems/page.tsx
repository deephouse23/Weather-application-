"use client"

import { useState, useEffect } from "react"
import PageWrapper from "@/components/page-wrapper"

// Theme types to match main app
type ThemeType = 'dark' | 'miami' | 'tron';

export default function WeatherSystemsPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark')

  // Theme management - sync with PageWrapper
  const getStoredTheme = (): ThemeType => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('weather-edu-theme')
        if (stored && ['dark', 'miami', 'tron'].includes(stored)) {
          return stored as ThemeType
        }
      }
    } catch (error) {
      console.warn('Failed to get stored theme:', error)
    }
    return 'dark'
  }

  // Load and sync theme
  useEffect(() => {
    const storedTheme = getStoredTheme()
    setCurrentTheme(storedTheme)
    
    // Listen for theme changes
    const handleStorageChange = () => {
      const newTheme = getStoredTheme()
      setCurrentTheme(newTheme)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for theme changes
    const interval = setInterval(() => {
      const newTheme = getStoredTheme()
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme)
      }
    }, 100)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [currentTheme])

  // Theme classes to match main app
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-[#0a0a1a]',
          cardBg: 'bg-[#16213e]',
          borderColor: 'border-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          headerText: 'text-[#00d4ff]',
          secondaryText: 'text-[#a0a0a0]',
          shadowColor: '#00d4ff',
          glow: 'drop-shadow-[0_0_10px_#00d4ff]'
        }
      case 'miami':
        return {
          background: 'bg-gradient-to-br from-[#2d1b69] via-[#11001c] to-[#0f0026]',
          cardBg: 'bg-gradient-to-br from-[#4a0e4e] via-[#2d1b69] to-[#1a0033]',
          borderColor: 'border-[#ff1493]',
          text: 'text-[#00ffff]',
          headerText: 'text-[#ff007f]',
          secondaryText: 'text-[#b0d4f1]',
          shadowColor: '#ff1493',
          glow: 'drop-shadow-[0_0_10px_#ff007f]'
        }
      case 'tron':
        return {
          background: 'bg-[#000000]',
          cardBg: 'bg-[#000000]',
          borderColor: 'border-[#00FFFF]',
          text: 'text-[#FFFFFF]',
          headerText: 'text-[#00FFFF]',
          secondaryText: 'text-[#88CCFF]',
          shadowColor: '#00FFFF',
          glow: 'drop-shadow-[0_0_15px_#00FFFF]'
        }
    }
  }

  const themeClasses = getThemeClasses(currentTheme)

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow}`}>
            WEATHER SYSTEMS
          </h1>
          <p className={`text-lg ${themeClasses.secondaryText} font-mono mb-6`}>
            16-bit atmospheric phenomena and storm patterns
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className={`${themeClasses.cardBg} p-8 border-4 ${themeClasses.borderColor} text-center`}
               style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}` }}>
            <div className="text-6xl mb-4">🌀</div>
            <h2 className={`text-2xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
              COMING SOON
            </h2>
            <p className={`${themeClasses.text} font-mono text-sm`}>
              Interactive weather system simulations with pixel art hurricanes, 
              tornado formation animations, and pressure system visualizations.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
} 
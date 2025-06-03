"use client"

import { useState, useEffect } from "react"
import PageWrapper from "@/components/page-wrapper"

// Theme types to match main app
type ThemeType = 'dark' | 'miami' | 'tron';

export default function AboutPage() {
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
          accentText: 'text-[#ffe66d]',
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
          accentText: 'text-[#ff1493]',
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
          accentText: 'text-[#00FFFF]',
          shadowColor: '#00FFFF',
          glow: 'drop-shadow-[0_0_15px_#00FFFF]'
        }
    }
  }

  const themeClasses = getThemeClasses(currentTheme)

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow}`}>
            ABOUT 16-BIT WEATHER
          </h1>
          <p className={`text-lg ${themeClasses.secondaryText} font-mono mb-6`}>
            Experience weather education like it's 1985!
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Story Section */}
          <div className={`${themeClasses.cardBg} p-8 border-4 ${themeClasses.borderColor}`}
               style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}` }}>
            <h2 className={`text-2xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
              🎮 THE STORY
            </h2>
            <div className={`${themeClasses.text} font-mono text-sm space-y-4`}>
              <p>
                In 1985, personal computers were just becoming mainstream. Weather data was displayed on 
                green-screen terminals with blocky text graphics. We wondered: what if modern weather 
                technology existed back then?
              </p>
              <p>
                16-Bit Weather combines today's real-time meteorological data with authentic retro styling. 
                Every pixel, color palette, and animation is designed to feel like genuine 1980s software.
              </p>
              <p>
                This isn't just nostalgia - it's weather education through the lens of computing history.
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className={`${themeClasses.cardBg} p-8 border-4 ${themeClasses.borderColor}`}
               style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}` }}>
            <h2 className={`text-2xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
              ⚡ PLATFORM FEATURES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-mono">
              <div>
                <h3 className={`${themeClasses.accentText} mb-2`}>► WEATHER DATA:</h3>
                <ul className={`${themeClasses.text} space-y-1`}>
                  <li>• Real-time conditions worldwide</li>
                  <li>• 5-day forecasts</li>
                  <li>• UV index & atmospheric pressure</li>
                  <li>• Sunrise/sunset times</li>
                  <li>• Moon phases</li>
                </ul>
              </div>
              <div>
                <h3 className={`${themeClasses.accentText} mb-2`}>► 16-BIT RADAR:</h3>
                <ul className={`${themeClasses.text} space-y-1`}>
                  <li>• World's first 16-bit doppler radar</li>
                  <li>• Authentic pixel precipitation</li>
                  <li>• Multiple zoom levels</li>
                  <li>• Storm tracking animations</li>
                  <li>• City location markers</li>
                </ul>
              </div>
              <div>
                <h3 className={`${themeClasses.accentText} mb-2`}>► EDUCATION:</h3>
                <ul className={`${themeClasses.text} space-y-1`}>
                  <li>• Cloud type atlas</li>
                  <li>• Weather system explanations</li>
                  <li>• Interactive learning modules</li>
                  <li>• Fun facts & trivia</li>
                  <li>• Educational games (coming soon)</li>
                </ul>
              </div>
              <div>
                <h3 className={`${themeClasses.accentText} mb-2`}>► RETRO EXPERIENCE:</h3>
                <ul className={`${themeClasses.text} space-y-1`}>
                  <li>• Authentic 8-bit graphics</li>
                  <li>• Miami Vice, Dark & Tron themes</li>
                  <li>• Pixel-perfect animations</li>
                  <li>• Retro sound effects (planned)</li>
                  <li>• Terminal-style interface</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Section */}
          <div className={`${themeClasses.cardBg} p-8 border-4 ${themeClasses.borderColor}`}
               style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}` }}>
            <h2 className={`text-2xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
              🔧 TECHNICAL SPECS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-mono">
              <div>
                <h3 className={`${themeClasses.accentText} mb-2`}>► FRONTEND:</h3>
                <ul className={`${themeClasses.text} space-y-1`}>
                  <li>• Next.js 15 with React 18</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Lucide React for icons</li>
                  <li>• Custom pixel art graphics</li>
                </ul>
              </div>
              <div>
                <h3 className={`${themeClasses.accentText} mb-2`}>► APIS & DATA:</h3>
                <ul className={`${themeClasses.text} space-y-1`}>
                  <li>• OpenWeatherMap API</li>
                  <li>• Weather Maps 1.0 for radar</li>
                  <li>• Geocoding for location search</li>
                  <li>• Real-time precipitation data</li>
                  <li>• Astronomical calculations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Credits Section */}
          <div className={`${themeClasses.cardBg} p-8 border-4 ${themeClasses.borderColor}`}
               style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}` }}>
            <h2 className={`text-2xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText}`}>
              👾 CREDITS & INSPIRATION
            </h2>
            <div className={`${themeClasses.text} font-mono text-sm space-y-4`}>
              <p>
                <span className={themeClasses.accentText}>Weather Data:</span> Powered by OpenWeatherMap API
              </p>
              <p>
                <span className={themeClasses.accentText}>Design Inspiration:</span> 1980s personal computers, 
                Miami Vice aesthetics, early weather terminals, and classic arcade games
              </p>
              <p>
                <span className={themeClasses.accentText}>Font:</span> Share Tech Mono - authentic monospace 
                typography reminiscent of early computer displays
              </p>
              <p>
                <span className={themeClasses.accentText}>Educational Mission:</span> Making meteorology accessible 
                through nostalgic design and interactive learning
              </p>
            </div>
          </div>

          {/* Version Info */}
          <div className={`${themeClasses.cardBg} p-6 border-4 ${themeClasses.borderColor} text-center`}
               style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}` }}>
            <div className={`${themeClasses.accentText} font-mono text-lg font-bold mb-2`}>
              VERSION 0.1.0 - EDUCATION PLATFORM
            </div>
            <div className={`${themeClasses.secondaryText} font-mono text-xs`}>
              16-BIT WEATHER EDUCATION PLATFORM • BUILT WITH ❤️ FOR RETRO COMPUTING ENTHUSIASTS
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
} 
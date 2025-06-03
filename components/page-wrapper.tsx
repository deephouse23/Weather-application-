"use client"

import { useState, useEffect } from "react"
import Navigation from "./navigation"

// Theme types to match main app
type ThemeType = 'dark' | 'miami' | 'tron';

interface PageWrapperProps {
  children: React.ReactNode
}

/**
 * Page Wrapper for 16-Bit Weather Education Platform
 * 
 * Handles theme management and provides consistent navigation
 * across all pages in the education platform
 */
export default function PageWrapper({ children }: PageWrapperProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark')

  // Theme management
  const THEME_KEY = 'weather-edu-theme'

  const getStoredTheme = (): ThemeType => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(THEME_KEY)
        if (stored && ['dark', 'miami', 'tron'].includes(stored)) {
          return stored as ThemeType
        }
      }
    } catch (error) {
      console.warn('Failed to get stored theme:', error)
    }
    return 'dark' // Default to dark theme
  }

  const saveTheme = (theme: ThemeType) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(THEME_KEY, theme)
      }
    } catch (error) {
      console.warn('Failed to save theme:', error)
    }
  }

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme)
    saveTheme(theme)
  }

  // Load theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme()
    setCurrentTheme(storedTheme)
  }, [])

  // Enhanced theme classes for three themes with authentic Tron colors
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-gradient-to-br from-[#0a0a1a] via-[#16213e] to-[#1a2a4a]',
          textColor: 'text-[#e0e0e0]'
        }
      case 'miami':
        return {
          background: 'bg-gradient-to-br from-[#2d1b69] via-[#11001c] to-[#0f0026]',
          textColor: 'text-[#00ffff]'
        }
      case 'tron':
        return {
          background: 'bg-gradient-to-br from-[#000000] via-[#000000] to-[#000000]',
          textColor: 'text-[#FFFFFF]'
        }
    }
  }

  const themeClasses = getThemeClasses(currentTheme)

  // Tron Animated Grid Background Component
  const TronGridBackground = () => {
    if (currentTheme !== 'tron') return null;
    
    return (
      <>
        <style jsx>{`
          @keyframes tronWave {
            0% {
              transform: translateY(100vh);
              opacity: 0.8;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh);
              opacity: 0.8;
            }
          }

          .tron-grid-base {
            background-image: 
              linear-gradient(rgba(0, 255, 255, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px);
            background-size: 50px 50px;
          }

          .tron-grid-detail {
            background-image: 
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 10px 10px;
          }

          .tron-wave {
            background: linear-gradient(
              to top,
              transparent 0%,
              rgba(0, 255, 255, 0.6) 45%,
              rgba(0, 255, 255, 0.8) 50%,
              rgba(0, 255, 255, 0.6) 55%,
              transparent 100%
            );
            height: 200px;
            width: 100%;
            animation: tronWave 3.5s infinite linear;
            filter: blur(2px);
          }

          .tron-wave-glow {
            background: linear-gradient(
              to top,
              transparent 0%,
              rgba(0, 255, 255, 0.3) 40%,
              rgba(0, 255, 255, 0.5) 50%,
              rgba(0, 255, 255, 0.3) 60%,
              transparent 100%
            );
            height: 300px;
            width: 100%;
            animation: tronWave 3.5s infinite linear;
            animation-delay: 0.2s;
            filter: blur(4px);
          }

          .tron-pulse-grid {
            background-image: 
              linear-gradient(rgba(0, 255, 255, 0.3) 2px, transparent 2px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 2px, transparent 2px);
            background-size: 50px 50px;
            animation: tronGridPulse 3.5s infinite linear;
          }

          @keyframes tronGridPulse {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.3;
            }
          }
        `}</style>
        
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Base static grid */}
          <div className="absolute inset-0 tron-grid-base opacity-15" />
          
          {/* Detail grid */}
          <div className="absolute inset-0 tron-grid-detail opacity-8" />
          
          {/* Pulsing grid overlay */}
          <div className="absolute inset-0 tron-pulse-grid" />
          
          {/* Animated wave effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="tron-wave absolute left-0 right-0" />
          </div>
          
          {/* Secondary wave with glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="tron-wave-glow absolute left-0 right-0" />
          </div>
          
          {/* Subtle corner accent lines */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#00FFFF] opacity-30"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#00FFFF] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#00FFFF] opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#00FFFF] opacity-30"></div>
        </div>
      </>
    );
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.textColor} relative`}>
      <TronGridBackground />
      <Navigation currentTheme={currentTheme} onThemeChange={setTheme} />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
} 
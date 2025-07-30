"use client"

import { useState, useEffect } from "react"
import Navigation from "./navigation"
import { useTheme } from "@/components/theme-provider"

interface PageWrapperProps {
  children: React.ReactNode
  weatherLocation?: string
  weatherTemperature?: number
  weatherUnit?: string
}

/**
 * Page Wrapper for 16-Bit Weather Education Platform
 * 
 * Handles theme management and provides consistent navigation
 * across all pages in the education platform
 */
export default function PageWrapper({ children, weatherLocation, weatherTemperature, weatherUnit }: PageWrapperProps) {
  const { theme } = useTheme()

  // Dynamic theme classes based on current theme
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-[#0a0a1a]',
          textColor: 'text-[#e0e0e0]',
          borderColor: 'border-[#00d4ff]',
          accentColor: 'text-[#00d4ff]',
          cardBg: 'bg-[#0f0f0f]',
          hoverBg: 'hover:bg-[#00d4ff] hover:text-[#0a0a1a]',
          glow: 'glow-dark'
        }
      case 'miami':
        return {
          background: 'bg-[#2d1b69]',
          textColor: 'text-[#00ffff]',
          borderColor: 'border-[#ff1493]',
          accentColor: 'text-[#ff1493]',
          cardBg: 'bg-[#4a0e4e]',
          hoverBg: 'hover:bg-[#ff1493] hover:text-[#2d1b69]',
          glow: 'glow-miami'
        }
      case 'tron':
        return {
          background: 'bg-black',
          textColor: 'text-white',
          borderColor: 'border-[#00FFFF]',
          accentColor: 'text-[#00FFFF]',
          cardBg: 'bg-black',
          hoverBg: 'hover:bg-[#00FFFF] hover:text-black',
          glow: 'glow-tron'
        }
      default:
        return {
          background: 'bg-[#0a0a1a]',
          textColor: 'text-[#e0e0e0]',
          borderColor: 'border-[#00d4ff]',
          accentColor: 'text-[#00d4ff]',
          cardBg: 'bg-[#0f0f0f]',
          hoverBg: 'hover:bg-[#00d4ff] hover:text-[#0a0a1a]',
          glow: 'glow-dark'
        }
    }
  }

  const themeClasses = getThemeClasses(theme)

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.textColor} relative`}>
      <Navigation 
        weatherLocation={weatherLocation}
        weatherTemperature={weatherTemperature}
        weatherUnit={weatherUnit}
      />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
} 
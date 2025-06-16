"use client"

import { useState, useEffect } from "react"
import Navigation from "./navigation"
import { ThemeType, themeUtils, APP_CONSTANTS } from "@/lib/utils"

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
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(APP_CONSTANTS.THEMES.DARK)

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme)
    themeUtils.setStoredTheme(theme)
  }

  // Load theme on mount
  useEffect(() => {
    const storedTheme = themeUtils.getStoredTheme()
    setCurrentTheme(storedTheme)
  }, [])

  // Use standardized theme classes
  const themeClasses = {
    background: 'bg-[#0a0a1a]',
    textColor: 'text-[#e0e0e0]',
    borderColor: 'border-[#00d4ff]',
    accentColor: 'text-[#00d4ff]',
    cardBg: 'bg-[#0f0f0f]',
    hoverBg: 'hover:bg-[#00d4ff] hover:text-[#0a0a1a]',
    glow: 'glow-dark'
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.textColor} relative`}>
      <Navigation currentTheme={currentTheme} onThemeChange={setTheme} />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
} 
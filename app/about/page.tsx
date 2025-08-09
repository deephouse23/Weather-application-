"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"
import PageWrapper from "@/components/page-wrapper"
import { ThemeType, themeUtils, APP_CONSTANTS } from "@/lib/utils"

function AboutPageContent() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(APP_CONSTANTS.THEMES.DARK)

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

  const themeClasses = themeUtils.getThemeClasses(currentTheme)

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className={`${themeClasses.cardBg} p-6 border-4 ${themeClasses.borderColor}`}>
          <h1 className={`text-3xl font-bold mb-4 ${themeClasses.headerText}`}>About 16-Bit Weather</h1>
          <p className={`${themeClasses.text} mb-4`}>
            Welcome to 16-Bit Weather, a retro-styled weather application that combines modern weather data with a nostalgic 16-bit aesthetic.
          </p>
          <p className={`${themeClasses.text} mb-4`}>
            This application provides real-time weather information, forecasts, and educational content about weather systems and phenomena.
          </p>
          <p className={`${themeClasses.text}`}>
            Built with Next.js, TypeScript, and Tailwind CSS, featuring three unique themes: Dark Mode, Miami Vice, and Tron.
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}

// Create a dynamic import to avoid SSR issues
const DynamicAboutPage = dynamic(
  () => Promise.resolve(AboutPageContent),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
)

export default function AboutPage() {
  return <DynamicAboutPage />
}
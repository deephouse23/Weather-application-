"use client"

import { useState, useEffect } from "react"
import PageWrapper from "@/components/page-wrapper"
import { ThemeType, themeUtils, APP_CONSTANTS } from "@/lib/utils"

export default function AboutPage() {
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
    <div className="min-h-screen bg-black text-cyan-400 p-8 crt-scanlines">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 crt-flicker">
          <pre className="text-cyan-400 text-xs leading-none font-mono">
{`█████╗ ██████╗  ██████╗ ██╗   ██╗████████╗
██╔══██╗██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
███████║██████╔╝██║   ██║██║   ██║   ██║   
██╔══██║██╔══██╗██║   ██║██║   ██║   ██║   
██║  ██║██████╔╝╚██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝    ╚═╝`}
          </pre>
        </div>
        
        <div className="border-2 border-cyan-500 p-8">
          <h1 className="text-2xl font-mono mb-6 text-cyan-400">About 16-Bit Weather</h1>
          
          <div className="space-y-4 text-cyan-600">
            <p className="font-mono">
              Welcome to the retro weather experience! 16-Bit Weather combines modern meteorological 
              data with classic 1980s computer terminal aesthetics.
            </p>
            
            <p className="font-mono">
              Features include real-time weather data, customizable themes, location favorites, 
              and a fully authenticated user experience.
            </p>
            
            <p className="font-mono">
              Built with Next.js, Clerk authentication, and a lot of nostalgia for the golden age of computing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
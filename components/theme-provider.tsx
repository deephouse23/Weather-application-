"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { safeStorage } from '@/lib/safe-storage'

type Theme = 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  themes?: Theme[]
  attribute?: string
  enableSystem?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'weather-edu-theme',
  themes = ['dark'],
  attribute = 'class',
  enableSystem = false
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = safeStorage.getItem(storageKey) as Theme
      if (storedTheme && themes.includes(storedTheme)) {
        setTheme(storedTheme)
      }
    }
  }, [storageKey, themes])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      root.classList.remove(...themes)
      root.classList.add(theme)
      root.setAttribute('data-theme', theme)
      
      // Save theme to storage
      safeStorage.setItem(storageKey, theme)
    }
  }, [theme, themes, storageKey])

  const toggleTheme = () => {
    // Theme is locked to dark - no-op
    // Keeping function for compatibility but does nothing
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 
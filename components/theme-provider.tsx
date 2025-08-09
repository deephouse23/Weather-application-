"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

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
    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme && themes.includes(storedTheme)) {
      setTheme(storedTheme)
    }
  }, [storageKey, themes])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(...themes)
    root.classList.add(theme)
    if (attribute === 'class') {
      root.setAttribute('data-theme', theme)
    }
  }, [theme, themes, attribute])

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
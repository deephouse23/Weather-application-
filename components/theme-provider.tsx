"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'miami' | 'tron'

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
  themes = ['dark', 'miami', 'tron'],
  attribute = 'class',
  enableSystem = false
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme && themes.includes(storedTheme)) {
      setTheme(storedTheme)
    }
  }, [storageKey, themes])

  useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    root.classList.remove(...themes)
    root.classList.add(theme)
    if (attribute === 'class') {
      root.setAttribute('data-theme', theme)
    }
  }, [theme, themes, attribute, mounted])

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]
    setTheme(nextTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, nextTheme)
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 
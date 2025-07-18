"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'miami' | 'tron'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

// Create context with a guaranteed default value
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {
    console.warn('ThemeProvider not mounted yet')
  }
})

export function useTheme() {
  const context = useContext(ThemeContext)
  
  // Double-check that context is never undefined
  if (!context) {
    console.warn('useTheme called outside of ThemeProvider, using default theme')
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => {
        console.warn('ThemeProvider not available')
      }
    }
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
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem(storageKey) as Theme
        if (storedTheme && themes.includes(storedTheme)) {
          setTheme(storedTheme)
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error)
      }
    }
  }, [storageKey, themes])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    
    try {
      const root = window.document.documentElement
      root.classList.remove(...themes)
      root.classList.add(theme)
      if (attribute === 'class') {
        root.setAttribute('data-theme', theme)
      }
    } catch (error) {
      console.warn('Failed to apply theme to document:', error)
    }
  }, [theme, themes, attribute, mounted])

  const toggleTheme = () => {
    try {
      const currentIndex = themes.indexOf(theme)
      const nextIndex = (currentIndex + 1) % themes.length
      const nextTheme = themes[nextIndex]
      setTheme(nextTheme)
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, nextTheme)
      }
    } catch (error) {
      console.warn('Failed to toggle theme:', error)
    }
  }

  // Always provide a valid context value
  const contextValue: ThemeContextType = {
    theme: mounted ? theme : defaultTheme,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
} 
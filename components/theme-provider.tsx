"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'miami' | 'tron'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

// Provide a default value to prevent the context error
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {}
})

export function useTheme() {
  const context = useContext(ThemeContext)
  // No error throw needed since context always has a default value
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
      const storedTheme = localStorage.getItem(storageKey) as Theme
      if (storedTheme && themes.includes(storedTheme)) {
        setTheme(storedTheme)
      }
    }
  }, [storageKey, themes])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
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

  // Always render the provider to prevent context errors
  // Use defaultTheme before mounting to ensure consistent SSR
  const currentTheme = mounted ? theme : defaultTheme

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 
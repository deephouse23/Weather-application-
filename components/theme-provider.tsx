"use client"

/**
 * 16-Bit Weather Platform - BETA v0.5.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { safeStorage } from '@/lib/safe-storage'
import { ThemeType } from '@/lib/theme-config'

export type Theme = ThemeType

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  availableThemes: Theme[]
  isAuthenticated: boolean
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
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const availableThemes: Theme[] = ['dark', 'miami', 'tron', 'atari2600', 'monochromeGreen', '8bitClassic', '16bitSnes']
  const isAuthenticated = !!user

  // Set theme and persist to localStorage
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      safeStorage.setItem('weather-edu-theme', newTheme)
    }
  }

  // Toggle function (cycles through available themes)
  const toggleTheme = () => {
    const currentIndex = availableThemes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % availableThemes.length
    setTheme(availableThemes[nextIndex])
  }

  // Load theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = safeStorage.getItem('weather-edu-theme') as Theme || 'dark'
      setThemeState(savedTheme)
    }
    setLoading(false)
    setAuthLoading(false)
  }, [])

  // Apply theme to DOM with aggressive enforcement
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      const root = window.document.documentElement
      const body = window.document.body
      
      // Remove all possible theme classes
      availableThemes.forEach(t => {
        root.classList.remove(t)
        body.classList.remove(`theme-${t}`)
      })
      
      // Apply new theme classes
      root.classList.add(theme)
      root.setAttribute('data-theme', theme)
      body.classList.add(`theme-${theme}`)
      
      // Force style recalculation
      root.style.display = 'none'
      root.offsetHeight // Trigger reflow
      root.style.display = ''
      
      // Also update body background color directly for immediate effect
      const computedStyle = window.getComputedStyle(root)
      const bgColor = computedStyle.getPropertyValue('--bg')
      if (bgColor) {
        body.style.backgroundColor = bgColor.trim()
      }
    }
  }, [theme, loading, availableThemes])

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      availableThemes, 
      isAuthenticated 
    }}>
      {loading || authLoading ? <div>{children}</div> : children}
    </ThemeContext.Provider>
  )
} 

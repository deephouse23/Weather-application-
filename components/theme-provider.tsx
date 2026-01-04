"use client"

/**
 * 16-Bit Weather Platform - v1.0.0
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
import { ThemeType, THEME_LIST, FREE_THEMES, getThemeDefinition } from '@/lib/theme-config'
import { supabase } from '@/lib/supabase/client'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasLocalTheme, setHasLocalTheme] = useState(false) // Track if user set theme locally

  const availableThemes: Theme[] = isAuthenticated ? THEME_LIST : FREE_THEMES

  // Initialize auth listener
  useEffect(() => {
    setMounted(true)

    // Check active session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setIsAuthenticated(true)
        // Fetch user preferences
        fetchUserPreferences(session.user.id)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser(session.user)
        setIsAuthenticated(true)
        fetchUserPreferences(session.user.id)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        // Revert to free theme if current is premium
        if (!FREE_THEMES.includes(theme as any)) {
          setTheme('dark')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch preferences from API - only apply if no local theme set
  const fetchUserPreferences = async (userId: string, forceApply = false) => {
    try {
      // Skip if user has set a local theme (unless forced on initial load)
      if (hasLocalTheme && !forceApply) {
        return
      }

      // Explicit cast to avoid 'never' inference on build
      const { data } = await supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_id', userId)
        .single() as { data: { theme: string } | null, error: any }

      if (data && data.theme && THEME_LIST.includes(data.theme as Theme)) {
        // Only apply DB theme if no local preference exists
        const localTheme = safeStorage.getItem('weather-edu-theme')
        if (!localTheme || forceApply) {
          setThemeState(data.theme as Theme)
        }
      }
    } catch (e) {
      console.error("Failed to fetch theme preferences", e)
    }
  }

  // Save theme
  const saveThemePreference = async (newTheme: Theme) => {
    if (!isAuthenticated || !user) return

    try {
      // Optimistic update handled by state, sync to DB
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      })
    } catch (e) {
      console.error("Failed to save theme preference", e)
    }
  }

  // Set theme handler
  const setTheme = async (newTheme: Theme) => {
    // Prevent setting premium theme if not authenticated
    if (!isAuthenticated && !FREE_THEMES.includes(newTheme as any)) {
      return
    }

    setThemeState(newTheme)
    setHasLocalTheme(true) // Mark that user has made a local choice

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      safeStorage.setItem('weather-edu-theme', newTheme)
    }

    // Persist to DB if logged in
    if (isAuthenticated) {
      saveThemePreference(newTheme)
    }
  }

  // Toggle function
  const toggleTheme = () => {
    const list = availableThemes
    const currentIndex = list.indexOf(theme)
    const nextIndex = (currentIndex + 1) % list.length
    setTheme(list[nextIndex])
  }

  // Load local preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = safeStorage.getItem('weather-edu-theme') as Theme
      if (savedTheme && THEME_LIST.includes(savedTheme)) {
        // If saved theme is premium but user not logged in yet, we might render it briefly
        // matching logic will correct it once auth loads
        setThemeState(savedTheme)
      }
    }
  }, [])

  // Apply theme to DOM and inject dynamic CSS variables
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const body = window.document.body

    // Remove all old classes
    THEME_LIST.forEach(t => {
      root.classList.remove(t)
      body.classList.remove(`theme-${t}`)
    })

    // Add new classes
    root.classList.add(theme)
    root.setAttribute('data-theme', theme)
    body.classList.add(`theme-${theme}`)

    // DYNAMIC CSS INJECTION
    // Get definition from config
    const def = getThemeDefinition(theme)

    // Helper to convert Hex to HSL string (H S% L%) for Tailwind/Shadcn compatibility
    const hexToHsl = (hex: string): string => {
      // Remove hash if present
      hex = hex.replace(/^#/, '');

      // Parse RGB
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);

      // Convert to fractions
      r /= 255;
      g /= 255;
      b /= 255;

      // Find greatest/smallest channel values
      const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;

      let h = 0, s = 0, l = 0;

      // Calculate hue
      if (delta === 0) h = 0;
      else if (cmax === r) h = ((g - b) / delta) % 6;
      else if (cmax === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;

      h = Math.round(h * 60);
      if (h < 0) h += 360;

      // Calculate lightness
      l = (cmax + cmin) / 2;

      // Calculate saturation
      s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);

      return `${h} ${s}% ${l}%`;
    }

    // Set standard variables (Legacy)
    root.style.setProperty('--bg', def.colors.background)
    root.style.setProperty('--bg-elev', def.colors.backgroundSecondary)
    root.style.setProperty('--border', def.colors.border)
    root.style.setProperty('--text', def.colors.text)
    root.style.setProperty('--text-muted', def.colors.textSecondary)
    root.style.setProperty('--weather-primary', def.colors.primary)
    root.style.setProperty('--weather-accent', def.colors.accent)
    root.style.setProperty('--ok', def.colors.highlight || def.colors.primary)
    root.style.setProperty('--warn', def.colors.accent)
    root.style.setProperty('--danger', 'red')

    // Set Shadcn HSL Variables
    root.style.setProperty('--background', hexToHsl(def.colors.background))
    root.style.setProperty('--foreground', hexToHsl(def.colors.text))
    root.style.setProperty('--card', hexToHsl(def.colors.backgroundSecondary))
    root.style.setProperty('--card-foreground', hexToHsl(def.colors.text))
    root.style.setProperty('--popover', hexToHsl(def.colors.backgroundSecondary))
    root.style.setProperty('--popover-foreground', hexToHsl(def.colors.text))
    root.style.setProperty('--primary', hexToHsl(def.colors.primary))
    root.style.setProperty('--primary-foreground', hexToHsl(def.colors.background))
    root.style.setProperty('--secondary', hexToHsl(def.colors.accent))
    root.style.setProperty('--secondary-foreground', hexToHsl(def.colors.background))
    root.style.setProperty('--muted', hexToHsl(def.colors.backgroundTertiary))
    root.style.setProperty('--muted-foreground', hexToHsl(def.colors.textSecondary))
    root.style.setProperty('--accent', hexToHsl(def.colors.accent))
    root.style.setProperty('--accent-foreground', hexToHsl(def.colors.background))
    // Use legacy destructive logic or fallback
    root.style.setProperty('--destructive', '0 84% 60%')
    root.style.setProperty('--destructive-foreground', '210 40% 98%')
    root.style.setProperty('--border', hexToHsl(def.colors.border))
    root.style.setProperty('--input', hexToHsl(def.colors.backgroundSecondary))
    root.style.setProperty('--ring', hexToHsl(def.colors.primary))

    // Font injection if present
    if (def.font) {
      body.style.fontFamily = def.font
    } else {
      body.style.removeProperty('font-family')
    }

    // Background Gradient Effect
    if (def.effects?.backgroundGradient) {
      body.style.backgroundImage = def.effects.backgroundGradient
      body.style.backgroundAttachment = 'fixed'
    } else {
      body.style.backgroundImage = ''
    }

    // Force background color match
    body.style.backgroundColor = def.colors.background

  }, [theme, mounted])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      availableThemes,
      isAuthenticated
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

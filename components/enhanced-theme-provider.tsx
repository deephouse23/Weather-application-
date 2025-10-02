"use client"

/**
 * Enhanced Theme Provider with Premium Theme Support
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { ThemeType, THEME_LIST, FREE_THEMES, PREMIUM_THEMES, getThemeDefinition } from '@/lib/theme-config'
import { ThemeService } from '@/lib/services/theme-service'
import { supabase } from '@/lib/supabase/client'
import { getThemeObserver } from '@/lib/utils/theme-observer'

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
  availableThemes: ThemeType[]
  freeThemes: ThemeType[]
  premiumThemes: ThemeType[]
  isAuthenticated: boolean
  canAccessTheme: (theme: ThemeType) => boolean
  isLoading: boolean
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
  const { user, isInitialized } = useAuth()
  const [theme, setThemeState] = useState<ThemeType>('dark')
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user
  const availableThemes = isAuthenticated ? THEME_LIST : FREE_THEMES

  const canAccessTheme = useCallback((themeId: ThemeType): boolean => {
    return ThemeService.canAccessTheme(themeId, isAuthenticated)
  }, [isAuthenticated])

  // Set theme with validation and persistence
  const setTheme = useCallback(async (newTheme: ThemeType) => {
    // Validate theme access
    const validTheme = ThemeService.getValidTheme(newTheme, isAuthenticated)
    
    // Update state
    setThemeState(validTheme)
    
    // Apply to document
    ThemeService.applyThemeToDocument(validTheme)
    
    // Initialize/Update ThemeObserver for dynamic content
    const observer = getThemeObserver(validTheme)
    observer.initialize(validTheme)
    
    // Save to localStorage
    ThemeService.saveThemeToLocalStorage(validTheme)
    
    // Save to database if user is authenticated
    if (user && isAuthenticated) {
      try {
        await ThemeService.saveThemeToDatabase(supabase, user.id, validTheme)
      } catch (error) {
        console.error('Failed to save theme to database:', error)
        // Continue anyway - localStorage backup exists
      }
    }
  }, [isAuthenticated, user])

  // Toggle between available themes
  const toggleTheme = useCallback(() => {
    const currentIndex = availableThemes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % availableThemes.length
    setTheme(availableThemes[nextIndex])
  }, [theme, availableThemes, setTheme])

  // Load theme on initialization
  useEffect(() => {
    const loadTheme = async () => {
      if (!isInitialized) return
      
      setIsLoading(true)
      
      try {
        let themeToLoad: ThemeType = 'dark'
        
        if (user && isAuthenticated) {
          // Try to load from database first
          const { theme: dbTheme, error } = await ThemeService.loadThemeFromDatabase(supabase, user.id)
          
          if (!error && dbTheme) {
            themeToLoad = dbTheme
          } else {
            // Fallback to localStorage
            const localTheme = ThemeService.loadThemeFromLocalStorage()
            if (localTheme) {
              themeToLoad = localTheme
            }
          }
        } else {
          // Load from localStorage for non-authenticated users
          const localTheme = ThemeService.loadThemeFromLocalStorage()
          if (localTheme) {
            themeToLoad = localTheme
          }
        }
        
        // Validate and apply theme
        const validTheme = ThemeService.getValidTheme(themeToLoad, isAuthenticated)
        setThemeState(validTheme)
        ThemeService.applyThemeToDocument(validTheme)
        
        // Initialize ThemeObserver for dynamic content
        const observer = getThemeObserver(validTheme)
        observer.initialize(validTheme)
        
      } catch (error) {
        console.error('Error loading theme:', error)
        // Use default theme on error
        setThemeState('dark')
        ThemeService.applyThemeToDocument('dark')
        
        // Initialize observer with default theme
        const observer = getThemeObserver('dark')
        observer.initialize('dark')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTheme()
  }, [user, isAuthenticated, isInitialized])

  // Handle authentication state changes
  useEffect(() => {
    if (!isInitialized) return
    
    // If user logs out, ensure they're not using a premium theme
    if (!isAuthenticated && !canAccessTheme(theme)) {
      setTheme('dark')
    }
  }, [isAuthenticated, isInitialized, theme, canAccessTheme, setTheme])

  // Apply theme classes to document
  useEffect(() => {
    if (typeof document !== 'undefined' && !isLoading) {
      const root = document.documentElement
      
      // Remove all theme classes
      THEME_LIST.forEach(t => root.classList.remove(t))
      
      // Add current theme class
      root.classList.add(theme)
      root.setAttribute('data-theme', theme)
      
      // Apply theme colors as CSS variables
      const definition = getThemeDefinition(theme)
      Object.entries(definition.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value)
      })
      
      // Apply theme font if defined
      if (definition.font) {
        root.style.setProperty('--theme-font', definition.font)
      }
    }
  }, [theme, isLoading])

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    availableThemes,
    freeThemes: FREE_THEMES,
    premiumThemes: PREMIUM_THEMES,
    isAuthenticated,
    canAccessTheme,
    isLoading: isLoading || !isInitialized
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
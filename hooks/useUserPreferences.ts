'use client'
import { useState, useEffect } from 'react'
import { WeatherPreferences, defaultPreferences } from '@/types/user'

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<WeatherPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Load from localStorage for all users
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('16bit-weather-preferences')
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs)
          setPreferences({ ...defaultPreferences, ...parsed })
        } catch (error) {
          console.error('Failed to parse preferences:', error)
        }
      }
    }
    setIsLoading(false)
  }, [isClient])

  const updatePreferences = async (newPrefs: Partial<WeatherPreferences>) => {
    const updated = { ...preferences, ...newPrefs }
    setPreferences(updated)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('16bit-weather-preferences', JSON.stringify(updated))
    }
  }

  const resetPreferences = async () => {
    setPreferences(defaultPreferences)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('16bit-weather-preferences')
    }
  }

  return { 
    preferences, 
    updatePreferences, 
    resetPreferences, 
    isLoading: !isClient || isLoading,
    isAuthenticated: false // Simplified for now
  }
} 
'use client'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { WeatherPreferences, defaultPreferences } from '@/types/user'

export function useUserPreferences() {
  const { user, isLoaded } = useUser()
  const [preferences, setPreferences] = useState<WeatherPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    if (isLoaded && user) {
      const savedPrefs = user.unsafeMetadata?.weatherPreferences as WeatherPreferences
      if (savedPrefs) {
        setPreferences({ ...defaultPreferences, ...savedPrefs })
      }
      setIsLoading(false)
    } else if (isLoaded && !user) {
      // Try to load from localStorage for guest users
      if (typeof window !== 'undefined') {
        const guestPrefs = localStorage.getItem('16bit-weather-preferences')
        if (guestPrefs) {
          try {
            const parsed = JSON.parse(guestPrefs)
            setPreferences({ ...defaultPreferences, ...parsed })
          } catch (error) {
            console.error('Failed to parse guest preferences:', error)
          }
        }
      }
      setIsLoading(false)
    }
  }, [isClient, isLoaded, user])

  const updatePreferences = async (newPrefs: Partial<WeatherPreferences>) => {
    const updated = { ...preferences, ...newPrefs }
    setPreferences(updated)

    if (user) {
      // Save to Clerk for authenticated users
      try {
        await user.update({
          unsafeMetadata: { 
            ...user.unsafeMetadata,
            weatherPreferences: updated 
          }
        })
      } catch (error) {
        console.error('Failed to save preferences:', error)
      }
    } else if (typeof window !== 'undefined') {
      // Save to localStorage for guest users
      localStorage.setItem('16bit-weather-preferences', JSON.stringify(updated))
    }
  }

  const resetPreferences = async () => {
    setPreferences(defaultPreferences)
    
    if (user) {
      try {
        await user.update({
          unsafeMetadata: { 
            ...user.unsafeMetadata,
            weatherPreferences: defaultPreferences 
          }
        })
      } catch (error) {
        console.error('Failed to reset preferences:', error)
      }
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('16bit-weather-preferences')
    }
  }

  return { 
    preferences, 
    updatePreferences, 
    resetPreferences, 
    isLoading: !isClient || isLoading,
    isAuthenticated: !!user 
  }
} 
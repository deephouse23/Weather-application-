/**
 * 16-Bit Weather Platform - BETA v0.3.2
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

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Application Constants
export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    THEME: 'weather-edu-theme',
    WEATHER_CACHE: 'bitweather_weather_data',
    WEATHER_CITY: 'bitweather_city',
    CACHE_TIMESTAMP: 'bitweather_cache_timestamp',
    RATE_LIMIT: 'weather-app-rate-limit',
    SNAKE_SCORES: 'snakeHighScores',
    TETRIS_SCORES: 'tetrisHighScores',
    PACMAN_SCORES: 'pacmanHighScores',
  },
  RATE_LIMITS: {
    MAX_REQUESTS_PER_HOUR: 10,
    COOLDOWN_SECONDS: 2,
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    MAX_REQUESTS: 5
  },
  CACHE: {
    EXPIRY_MINUTES: 10,
  }
} as const

// Safe localStorage access with error handling
export const safeLocalStorage = {
  get: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key)
      }
    } catch (error) {
      console.warn(`Failed to get localStorage key "${key}":`, error)
    }
    return null
  },

  set: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value)
        return true
      }
    } catch (error) {
      console.warn(`Failed to set localStorage key "${key}":`, error)
    }
    return false
  },

  remove: (key: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key)
        return true
      }
    } catch (error) {
      console.warn(`Failed to remove localStorage key "${key}":`, error)
    }
    return false
  }
}

// Validation utilities
export const validation = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

// Date and time utilities
export const dateUtils = {
  formatTimestamp: (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  },

  isExpired: (timestamp: number, expiryMinutes: number = APP_CONSTANTS.CACHE.EXPIRY_MINUTES): boolean => {
    const now = Date.now()
    const expiry = timestamp + (expiryMinutes * 60 * 1000)
    return now > expiry
  },

  getCurrentTimestamp: (): number => Date.now()
}

// Error handling utilities
export const errorUtils = {
  logError: (context: string, error: unknown): void => {
    console.error(`[${context}]`, error)
  },

  createErrorMessage: (context: string, fallback: string = 'An error occurred'): string => {
    return `${context}: ${fallback}`
  }
}

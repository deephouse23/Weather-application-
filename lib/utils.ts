import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Application Constants
export const APP_CONSTANTS = {
  THEMES: {
    DARK: 'dark' as const,
    MIAMI: 'miami' as const,
    TRON: 'tron' as const,
  },
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

export type ThemeType = typeof APP_CONSTANTS.THEMES[keyof typeof APP_CONSTANTS.THEMES]

// Theme color definitions
export const THEME_COLORS = {
  [APP_CONSTANTS.THEMES.DARK]: {
    background: '#0a0a1a',
    cardBg: '#16213e',
    border: '#00d4ff',
    text: '#e0e0e0',
    accent: '#00d4ff',
    hoverBg: '#1a2a4a',
    headerText: '#00d4ff',
    secondaryText: '#a0a0a0',
  },
  [APP_CONSTANTS.THEMES.MIAMI]: {
    background: '#0a0025',
    cardBg: '#4a0e4e',
    border: '#ff1493',
    text: '#00ffff',
    accent: '#ff1493',
    hoverBg: '#6a1e6e',
    headerText: '#ff007f',
    secondaryText: '#b0d4f1',
  },
  [APP_CONSTANTS.THEMES.TRON]: {
    background: '#000000',
    cardBg: '#000000',
    border: '#00FFFF',
    text: '#FFFFFF',
    accent: '#00FFFF',
    hoverBg: '#001111',
    headerText: '#00FFFF',
    secondaryText: '#88CCFF',
    warning: '#FF1744',
    special: '#00FFFF',
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

// Theme management utilities
export const themeUtils = {
  getStoredTheme: (): ThemeType => {
    const stored = safeLocalStorage.get(APP_CONSTANTS.STORAGE_KEYS.THEME)
    if (stored && Object.values(APP_CONSTANTS.THEMES).includes(stored as ThemeType)) {
      return stored as ThemeType
    }
    return APP_CONSTANTS.THEMES.DARK
  },

  setStoredTheme: (theme: ThemeType): boolean => {
    return safeLocalStorage.set(APP_CONSTANTS.STORAGE_KEYS.THEME, theme)
  },

  getThemeColors: (theme: ThemeType) => THEME_COLORS[theme],

  getThemeClasses: (theme: ThemeType) => {
    const colors = THEME_COLORS[theme]
    return {
      background: `bg-[${colors.background}]`,
      cardBg: `bg-[${colors.cardBg}]`,
      borderColor: `border-[${colors.border}]`,
      text: `text-[${colors.text}]`,
      headerText: `text-[${colors.headerText}]`,
      secondaryText: `text-[${colors.secondaryText}]`,
      shadowColor: colors.accent,
      glow: `drop-shadow-[0_0_10px_${colors.accent}]`,
      hoverBg: `hover:bg-[${colors.hoverBg}]`,
      accentBg: `bg-[${colors.accent}]`
    }
  },

  getThemeDisplay: (theme: ThemeType) => {
    switch (theme) {
      case APP_CONSTANTS.THEMES.DARK: return { label: 'DARK', emoji: '🌙' }
      case APP_CONSTANTS.THEMES.MIAMI: return { label: 'MIAMI', emoji: '🌴' }
      case APP_CONSTANTS.THEMES.TRON: return { label: 'TRON', emoji: '⚡' }
    }
  }
}

// Validation utilities
export const validation = {
  isValidTheme: (theme: string): theme is ThemeType => {
    return Object.values(APP_CONSTANTS.THEMES).includes(theme as ThemeType)
  },

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

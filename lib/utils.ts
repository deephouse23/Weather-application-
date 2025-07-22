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
    background: "#0a0a1a",
    cardBg: "#16213e",
    border: "#00d4ff",
    text: "#e0e0e0",
    header: "#00d4ff",
    secondary: "#a0a0a0",
    shadow: "#00d4ff",
    hover: "#1a1a2e",
    accent: "#00d4ff",
    hoverBg: "#1a2a4a",
    headerText: "#00d4ff",
    secondaryText: "#00d4ff",
    success: "#00d4ff",
    warning: "#ff6b6b",
    error: "#ff4444"
  },
  [APP_CONSTANTS.THEMES.MIAMI]: {
    background: "#2d1b69",
    cardBg: "#4a0e4e",
    border: "#00d4ff",
    text: "#00d4ff",
    header: "#00d4ff",
    secondary: "#00d4ff",
    shadow: "#00d4ff",
    hover: "#1a0033",
    accent: "#00d4ff",
    hoverBg: "#6a1e6e",
    headerText: "#00d4ff",
    secondaryText: "#00d4ff",
    success: "#00d4ff",
    warning: "#ff69b4",
    error: "#ff1493"
  },
  [APP_CONSTANTS.THEMES.TRON]: {
    background: "#000000",
    cardBg: "#000000",
    border: "#00d4ff",
    text: "#FFFFFF",
    header: "#00d4ff",
    secondary: "#00d4ff",
    shadow: "#00d4ff",
    hover: "#001111",
    accent: "#00d4ff",
    hoverBg: "#001111",
    headerText: "#00d4ff",
    secondaryText: "#00d4ff",
    success: "#00d4ff",
    warning: "#FF6B6B",
    error: "#FF4444"
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
  getThemeColors: () => ({
    text: '#e0e0e0',
    background: '#0a0a1a',
    accent: '#00d4ff',
    cardBg: '#0f0f0f',
    border: '#00d4ff'
  }),

  getThemeClasses: (theme: ThemeType = 'dark') => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-[#0a0a1a]',
          text: 'text-[#e0e0e0]',
          borderColor: 'border-[#00d4ff]',
          accentBg: 'bg-[#00d4ff]',
          accentText: 'text-[#00d4ff]',
          cardBg: 'bg-[#0f0f0f]',
          hoverBg: 'hover:bg-[#00d4ff] hover:text-[#0a0a1a]',
          glow: 'glow-dark',
          headerText: 'text-[#00d4ff]',
          secondaryText: 'text-[#00d4ff]',
          successText: 'text-[#00d4ff]',
          warningText: 'text-[#00d4ff]',
          shadowColor: '#00d4ff',
          errorText: 'text-[#00d4ff]'
        }
      case 'miami':
        return {
          background: 'bg-[#2d1b69]',
          text: 'text-[#00d4ff]',
          borderColor: 'border-[#00d4ff]',
          accentBg: 'bg-[#00d4ff]',
          accentText: 'text-[#00d4ff]',
          cardBg: 'bg-[#4a0e4e]',
          hoverBg: 'hover:bg-[#00d4ff] hover:text-[#2d1b69]',
          glow: 'glow-miami',
          headerText: 'text-[#00d4ff]',
          secondaryText: 'text-[#00d4ff]',
          successText: 'text-[#00d4ff]',
          warningText: 'text-[#00d4ff]',
          shadowColor: '#00d4ff',
          errorText: 'text-[#00d4ff]'
        }
      case 'tron':
        return {
          background: 'bg-[#000000]',
          text: 'text-[#FFFFFF]',
          borderColor: 'border-[#00d4ff]',
          accentBg: 'bg-[#00d4ff]',
          accentText: 'text-[#00d4ff]',
          cardBg: 'bg-[#000000]',
          hoverBg: 'hover:bg-[#00d4ff] hover:text-[#000000]',
          glow: 'glow-tron',
          headerText: 'text-[#00d4ff]',
          secondaryText: 'text-[#00d4ff]',
          successText: 'text-[#00d4ff]',
          warningText: 'text-[#00d4ff]',
          shadowColor: '#00d4ff',
          errorText: 'text-[#00d4ff]'
        }
      default:
        return {
          background: 'bg-[#0a0a1a]',
          text: 'text-[#e0e0e0]',
          borderColor: 'border-[#00d4ff]',
          accentBg: 'bg-[#00d4ff]',
          accentText: 'text-[#00d4ff]',
          cardBg: 'bg-[#0f0f0f]',
          hoverBg: 'hover:bg-[#00d4ff] hover:text-[#0a0a1a]',
          glow: 'glow-dark',
          headerText: 'text-[#00d4ff]',
          secondaryText: 'text-[#00d4ff]',
          successText: 'text-[#00d4ff]',
          warningText: 'text-[#00d4ff]',
          shadowColor: '#00d4ff',
          errorText: 'text-[#00d4ff]'
        }
    }
  },

  setStoredTheme: (theme: ThemeType) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('weather-edu-theme', theme)
    }
  },

  getStoredTheme: (): ThemeType => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('weather-edu-theme')
      if (stored && ['dark', 'miami', 'tron'].includes(stored)) {
        return stored as ThemeType
      }
    }
    return 'dark'
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

/**
 * 16-Bit Weather Platform - Theme Tiers System
 * Implements freemium strategy for theme access
 */

export interface ThemeConfig {
  id: string
  name: string
  displayName: string
  description: string
  tier: 'free' | 'premium'
  category: 'basic' | 'retro' | 'seasonal' | 'special'
  previewImage?: string
  colors: {
    primary: string
    background: string
    accent: string
  }
}

export const THEME_CONFIGS: ThemeConfig[] = [
  // FREE TIER - Available to everyone
  {
    id: 'default',
    name: 'default',
    displayName: 'Default',
    description: 'Clean, professional light theme',
    tier: 'free',
    category: 'basic',
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      accent: '#60a5fa'
    }
  },
  {
    id: 'dark',
    name: 'dark',
    displayName: 'Dark Mode',
    description: 'Easy on the eyes dark theme',
    tier: 'free',
    category: 'basic',
    colors: {
      primary: '#00d4ff',
      background: '#16213e',
      accent: '#4ecdc4'
    }
  },

  // PREMIUM TIER - Requires registration
  {
    id: 'miami',
    name: 'miami',
    displayName: 'Miami Vice',
    description: 'Neon-soaked 80s cyberpunk vibes',
    tier: 'premium',
    category: 'retro',
    colors: {
      primary: '#ff007f',
      background: '#4a0e4e',
      accent: '#ff1493'
    }
  },
  {
    id: 'tron',
    name: 'tron',
    displayName: 'Tron Legacy',
    description: 'Sleek sci-fi terminal aesthetic',
    tier: 'premium',
    category: 'retro',
    colors: {
      primary: '#00FFFF',
      background: '#000000',
      accent: '#88CCFF'
    }
  },
  {
    id: 'autumn',
    name: 'autumn',
    displayName: 'Autumn Leaves',
    description: 'Warm fall colors and cozy vibes',
    tier: 'premium',
    category: 'seasonal',
    colors: {
      primary: '#d97706',
      background: '#292524',
      accent: '#f59e0b'
    }
  },
  {
    id: 'winter',
    name: 'winter',
    displayName: 'Winter Frost',
    description: 'Cool blues and icy whites',
    tier: 'premium',
    category: 'seasonal',
    colors: {
      primary: '#3b82f6',
      background: '#1e293b',
      accent: '#60a5fa'
    }
  }
]

// Helper functions
export const isPremiumTheme = (themeId: string): boolean => {
  const theme = THEME_CONFIGS.find(t => t.id === themeId)
  return theme?.tier === 'premium' || false
}

export const getFreeThemes = (): ThemeConfig[] => {
  return THEME_CONFIGS.filter(theme => theme.tier === 'free')
}

export const getPremiumThemes = (): ThemeConfig[] => {
  return THEME_CONFIGS.filter(theme => theme.tier === 'premium')
}

export const getThemeConfig = (themeId: string): ThemeConfig | undefined => {
  return THEME_CONFIGS.find(theme => theme.id === themeId)
}

export const getThemesByCategory = (category: string): ThemeConfig[] => {
  return THEME_CONFIGS.filter(theme => theme.category === category)
}

// Preview settings
export const THEME_PREVIEW_DURATION = 30000 // 30 seconds
export const THEME_PREVIEW_WARNING_TIME = 25000 // Warning at 25 seconds
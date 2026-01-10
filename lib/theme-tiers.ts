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
  {
    id: 'miami',
    name: 'miami',
    displayName: 'Miami Vice',
    description: 'Neon-soaked 80s cyberpunk vibes',
    tier: 'free',
    category: 'retro',
    colors: {
      primary: '#ff007f',
      background: '#4a0e4e',
      accent: '#ff1493'
    }
  },

  // PREMIUM TIER - Requires registration
  {
    id: 'synthwave84',
    name: 'synthwave84',
    displayName: 'Synthwave \'84 🌆',
    description: 'Neon-soaked 1980s Miami aesthetic - perfect for sunset/sunrise times',
    tier: 'premium',
    category: 'retro',
    colors: {
      primary: '#ff7edb',
      background: '#241b30',
      accent: '#00ffff'
    }
  },
  {
    id: 'dracula',
    name: 'dracula',
    displayName: 'Dracula 🦇',
    description: 'Gothic vampire castle meets modern development - extremely popular in dev community',
    tier: 'premium',
    category: 'special',
    colors: {
      primary: '#ff79c6',
      background: '#282a36',
      accent: '#50fa7b'
    }
  },
  {
    id: 'cyberpunk',
    name: 'cyberpunk',
    displayName: 'Cyberpunk 2077 🤖',
    description: 'Futuristic dystopian cityscape with glitch effects - edgy and trendy',
    tier: 'premium',
    category: 'special',
    colors: {
      primary: '#fcee0a',
      background: '#0d0d0d',
      accent: '#ff003c'
    }
  },
  {
    id: 'matrix',
    name: 'matrix',
    displayName: 'Terminal Green (Matrix) 💻',
    description: 'Classic phosphor terminal with Matrix rain effects - for hackers and minimalists',
    tier: 'premium',
    category: 'retro',
    colors: {
      primary: '#00ff41',
      background: '#000000',
      accent: '#008f11'
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
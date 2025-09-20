/**
 * 16-Bit Weather Platform - Theme Configuration
 * 
 * Defines all available themes including premium themes for registered users
 */

export type ThemeType = 'dark' | 'miami' | 'tron' | 'atari2600' | 'monochromeGreen' | '8bitClassic' | '16bitSnes';

export interface ThemeDefinition {
  name: string;
  displayName: string;
  isPremium: boolean;
  colors: {
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    primary: string;
    text: string;
    textSecondary: string;
    accent: string;
    border: string;
    highlight?: string;
    comments?: string;
  };
  font?: string;
  description?: string;
}

export const THEME_DEFINITIONS: Record<ThemeType, ThemeDefinition> = {
  // Free themes
  dark: {
    name: 'dark',
    displayName: 'Dark Mode',
    isPremium: false,
    colors: {
      background: '#0a0a1a',
      backgroundSecondary: '#0f0f0f',
      backgroundTertiary: '#16213e',
      primary: '#00d4ff',
      text: '#e0e0e0',
      textSecondary: '#4ecdc4',
      accent: '#ffe66d',
      border: '#00d4ff'
    },
    description: 'Classic dark theme with cyan accents'
  },
  miami: {
    name: 'miami',
    displayName: 'Miami Vice',
    isPremium: false,
    colors: {
      background: '#0a0025',
      backgroundSecondary: '#2d1b69',
      backgroundTertiary: '#4a0e4e',
      primary: '#ff1493',
      text: '#00ffff',
      textSecondary: '#22d3ee',
      accent: '#ff1493',
      border: '#ff1493'
    },
    description: 'Retro 80s synthwave vibes'
  },
  tron: {
    name: 'tron',
    displayName: 'TRON Legacy',
    isPremium: false,
    colors: {
      background: '#000000',
      backgroundSecondary: '#000000',
      backgroundTertiary: '#0a0a0a',
      primary: '#00FFFF',
      text: '#FFFFFF',
      textSecondary: '#88CCFF',
      accent: '#00FFFF',
      border: '#00FFFF'
    },
    description: 'Enter the Grid with this digital theme'
  },

  // Premium themes - only for registered users
  atari2600: {
    name: 'atari2600',
    displayName: 'Atari 2600',
    isPremium: true,
    colors: {
      background: '#000000',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2d2d2d',
      primary: '#E0EC9C',
      text: '#FFFFFF',
      textSecondary: '#888888',
      accent: '#841800',
      border: '#702800',
      highlight: '#E0EC9C',
      comments: '#888888'
    },
    font: '"VT323", "Press Start 2P", monospace',
    description: 'Classic Atari 2600 console aesthetic'
  },
  monochromeGreen: {
    name: 'monochromeGreen',
    displayName: 'Terminal Green',
    isPremium: true,
    colors: {
      background: '#0D0D0D',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#262626',
      primary: '#33FF33',
      text: '#33FF33',
      textSecondary: '#66FF66',
      accent: '#99FF99',
      border: '#009900',
      highlight: '#009900',
      comments: '#00FF00'
    },
    font: '"Fira Code", "Courier New", monospace',
    description: 'Old-school terminal monochrome display'
  },
  '8bitClassic': {
    name: '8bitClassic',
    displayName: '8-Bit Classic',
    isPremium: true,
    colors: {
      background: '#D3D3D3',
      backgroundSecondary: '#C0C0C0',
      backgroundTertiary: '#A9A9A9',
      primary: '#CC0000',
      text: '#000000',
      textSecondary: '#666666',
      accent: '#0066CC',
      border: '#000000',
      highlight: '#00AA00',
      comments: '#666666'
    },
    font: '"Press Start 2P", "Courier New", monospace',
    description: 'NES-inspired 8-bit gaming theme'
  },
  '16bitSnes': {
    name: '16bitSnes',
    displayName: '16-Bit SNES',
    isPremium: true,
    colors: {
      background: '#B8B8D0',
      backgroundSecondary: '#9E9EB8',
      backgroundTertiary: '#8484A0',
      primary: '#FFD700',
      text: '#2C2C3E',
      textSecondary: '#5B5B8B',
      accent: '#8B8BB8',
      border: '#5B5B8B',
      highlight: '#FFD700',
      comments: '#6B6B8C'
    },
    font: '"Courier New", "VT323", monospace',
    description: 'Super Nintendo 16-bit era theme'
  }
};

// Get list of all theme names
export const THEME_LIST = Object.keys(THEME_DEFINITIONS) as ThemeType[];

// Get list of free themes
export const FREE_THEMES = THEME_LIST.filter(
  theme => !THEME_DEFINITIONS[theme].isPremium
);

// Get list of premium themes
export const PREMIUM_THEMES = THEME_LIST.filter(
  theme => THEME_DEFINITIONS[theme].isPremium
);

// Check if a theme is premium
export const isThemePremium = (theme: ThemeType): boolean => {
  return THEME_DEFINITIONS[theme]?.isPremium ?? false;
};

// Get theme definition
export const getThemeDefinition = (theme: ThemeType): ThemeDefinition => {
  return THEME_DEFINITIONS[theme] || THEME_DEFINITIONS.dark;
};
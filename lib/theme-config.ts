/**
 * 16-Bit Weather Platform - Theme Configuration
 * 
 * Defines all available themes including premium themes for registered users
 */

export type ThemeType = 'dark' | 'miami' | 'tron' | 'atari2600' | 'monochromeGreen' | '8bitClassic' | '16bitSnes' | 'synthwave84' | 'tokyonight' | 'dracula' | 'cyberpunk' | 'terminal';

export interface ThemeDefinition {
  name: string;
  displayName: string;
  isPremium: boolean;
  colors: {
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    primary: string;
    secondary?: string;
    text: string;
    textSecondary: string;
    textMuted?: string;
    accent: string;
    border: string;
    highlight?: string;
    comments?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    tempHot?: string;
    tempWarm?: string;
    tempCool?: string;
    tempCold?: string;
    surface?: string;
    surfaceHover?: string;
  };
  effects?: {
    glow?: string;
    gradient?: string;
    gridColor?: string;
    scanlines?: boolean;
    glitchEffect?: boolean;
    matrixRain?: boolean;
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
  },

  // New Retro Themes
  synthwave84: {
    name: 'synthwave84',
    displayName: "Synthwave '84",
    isPremium: true,
    colors: {
      background: '#1a0033',
      backgroundSecondary: '#2D1B69',
      backgroundTertiary: '#3d2b79',
      primary: '#ff7edb',
      secondary: '#00ffff',
      text: '#ffffff',
      textSecondary: '#ff7edb',
      textMuted: '#b794f6',
      accent: '#ffaa00',
      border: '#ff7edb',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff0080',
      info: '#00ffff',
      tempHot: '#ff0080',
      tempWarm: '#ff7edb',
      tempCool: '#00ffff',
      tempCold: '#0080ff',
      surface: '#2D1B69',
      surfaceHover: '#3d2b79'
    },
    effects: {
      glow: '0 0 20px #ff7edb',
      gradient: 'linear-gradient(180deg, #ff7edb 0%, #2D1B69 50%, #1a0033 100%)',
      gridColor: 'rgba(255, 126, 219, 0.1)'
    },
    description: 'Neon 80s aesthetic with hot pink and cyan'
  },

  tokyonight: {
    name: 'tokyonight',
    displayName: 'Tokyo Night',
    isPremium: true,
    colors: {
      background: '#1a1b26',
      backgroundSecondary: '#24283b',
      backgroundTertiary: '#343a52',
      primary: '#9d7cd8',
      secondary: '#7dcfff',
      text: '#c0caf5',
      textSecondary: '#9d7cd8',
      textMuted: '#565f89',
      accent: '#ff9e64',
      border: '#565f89',
      success: '#9ece6a',
      warning: '#e0af68',
      error: '#f7768e',
      info: '#7dcfff',
      tempHot: '#f7768e',
      tempWarm: '#ff9e64',
      tempCool: '#7dcfff',
      tempCold: '#9d7cd8',
      surface: '#24283b',
      surfaceHover: '#343a52'
    },
    effects: {
      gradient: 'linear-gradient(135deg, #1a1b26 0%, #24283b 100%)'
    },
    description: 'Modern Japanese city nights'
  },

  dracula: {
    name: 'dracula',
    displayName: 'Dracula',
    isPremium: true,
    colors: {
      background: '#282a36',
      backgroundSecondary: '#44475a',
      backgroundTertiary: '#6272a4',
      primary: '#bd93f9',
      secondary: '#ff79c6',
      text: '#f8f8f2',
      textSecondary: '#ff79c6',
      textMuted: '#6272a4',
      accent: '#ffb86c',
      border: '#6272a4',
      success: '#50fa7b',
      warning: '#f1fa8c',
      error: '#ff5555',
      info: '#8be9fd',
      tempHot: '#ff5555',
      tempWarm: '#ffb86c',
      tempCool: '#8be9fd',
      tempCold: '#bd93f9',
      surface: '#44475a',
      surfaceHover: '#6272a4'
    },
    effects: {
      gradient: 'linear-gradient(180deg, #282a36 0%, #44475a 100%)'
    },
    description: 'Gothic vampire vibes'
  },

  cyberpunk: {
    name: 'cyberpunk',
    displayName: 'Cyberpunk 2077',
    isPremium: true,
    colors: {
      background: '#0d0d0d',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      primary: '#fcee0a',
      secondary: '#00ffff',
      text: '#ffffff',
      textSecondary: '#fcee0a',
      textMuted: '#808080',
      accent: '#ff003c',
      border: '#fcee0a',
      success: '#00ff00',
      warning: '#fcee0a',
      error: '#ff003c',
      info: '#00ffff',
      tempHot: '#ff003c',
      tempWarm: '#fcee0a',
      tempCool: '#00ffff',
      tempCold: '#0080ff',
      surface: '#1a1a1a',
      surfaceHover: '#2a2a2a'
    },
    effects: {
      glow: '0 0 15px #fcee0a',
      gradient: 'linear-gradient(45deg, #0d0d0d 0%, #1a1a1a 50%, #fcee0a 100%)',
      gridColor: 'rgba(252, 238, 10, 0.05)',
      glitchEffect: true
    },
    description: 'Futuristic dystopian'
  },

  terminal: {
    name: 'terminal',
    displayName: 'Terminal Green',
    isPremium: true,
    colors: {
      background: '#000000',
      backgroundSecondary: '#0d0d0d',
      backgroundTertiary: '#1a1a1a',
      primary: '#00ff41',
      secondary: '#008f11',
      text: '#00ff41',
      textSecondary: '#00cc33',
      textMuted: '#008f11',
      accent: '#ffb000',
      border: '#008f11',
      success: '#00ff41',
      warning: '#ffb000',
      error: '#ff0000',
      info: '#00ff41',
      tempHot: '#ffb000',
      tempWarm: '#00ff41',
      tempCool: '#00cc33',
      tempCold: '#008f11',
      surface: '#0d0d0d',
      surfaceHover: '#1a1a1a'
    },
    effects: {
      glow: '0 0 10px #00ff41',
      scanlines: true,
      matrixRain: true
    },
    description: 'Classic Matrix style'
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
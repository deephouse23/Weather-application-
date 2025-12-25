/**
 * 16-Bit Weather Platform - Theme Configuration
 * 
 * Defines all available themes including premium themes for registered users
 */

export type ThemeType = 'dark' | 'miami' | 'tron' | 'atari2600' | 'monochromeGreen' | '8bitClassic' | '16bitSnes' | 'synthwave84' | 'tokyoNight' | 'dracula' | 'cyberpunk' | 'matrix';

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
  // Enhanced theme properties
  effects?: {
    backgroundGradient?: string; // CSS gradient
    cardGlow?: string; // CSS box-shadow glow
    textGlow?: string; // CSS text-shadow
    borderGlow?: string; // CSS box-shadow for borders
    scanlines?: boolean; // Enable scanline overlay
    gridPattern?: boolean; // Enable grid background
    matrixRain?: boolean; // Enable Matrix rain effect
    glitchEffect?: boolean; // Enable glitch animations
    bokeh?: boolean; // Enable bokeh light effects
  };
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

  // New Premium Themes
  synthwave84: {
    name: 'synthwave84',
    displayName: 'Synthwave \'84 🌆',
    isPremium: true,
    colors: {
      background: '#1a0f2e',
      backgroundSecondary: 'rgba(45, 27, 105, 0.6)',
      backgroundTertiary: '#2D1B69',
      primary: '#ff7edb',
      text: '#ffffff',
      textSecondary: '#ff7edb',
      accent: '#00ffff',
      border: '#ff7edb',
      highlight: '#ffaa00',
      comments: '#a19eb5'
    },
    font: '"VT323", monospace',
    description: 'Neon-soaked 1980s Miami aesthetic - perfect for sunset/sunrise times',
    effects: {
      backgroundGradient: 'linear-gradient(180deg, #241b2f 0%, #1a0f2e 100%)',
      cardGlow: '0 0 20px rgba(255, 126, 219, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1)',
      textGlow: '0 0 10px #ff7edb, 0 0 20px #ff7edb, 0 0 30px #ff7edb',
      borderGlow: '0 0 20px #ff7edb, 0 0 40px #ff7edb',
      scanlines: true,
      gridPattern: true,
      matrixRain: false,
      glitchEffect: false,
      bokeh: false
    }
  },
  tokyoNight: {
    name: 'tokyoNight',
    displayName: 'Tokyo Night 🌃',
    isPremium: true,
    colors: {
      background: '#16161e',
      backgroundSecondary: '#24283b',
      backgroundTertiary: '#2f3549',
      primary: '#7dcfff',
      text: '#c0caf5',
      textSecondary: '#a9b1d6',
      accent: '#ff9e64',
      border: '#9d7cd8',
      highlight: '#f7768e',
      comments: '#565f89'
    },
    font: '"Fira Code", monospace',
    description: 'Modern Japanese city at night with neon signs - perfect balance of style and readability',
    effects: {
      backgroundGradient: 'linear-gradient(180deg, #1a1b26 0%, #16161e 100%)',
      cardGlow: '0 0 15px rgba(125, 207, 255, 0.3)',
      textGlow: '0 0 5px rgba(125, 207, 255, 0.5)',
      borderGlow: '0 0 10px rgba(157, 124, 216, 0.6)',
      scanlines: false,
      gridPattern: false,
      matrixRain: false,
      glitchEffect: false,
      bokeh: true
    }
  },
  dracula: {
    name: 'dracula',
    displayName: 'Dracula 🦇',
    isPremium: true,
    colors: {
      background: '#1e1f29',
      backgroundSecondary: 'rgba(68, 71, 90, 0.8)',
      backgroundTertiary: '#44475a',
      primary: '#ff79c6',
      text: '#f8f8f2',
      textSecondary: '#e2e4e8',
      accent: '#50fa7b',
      border: '#ff79c6',
      highlight: '#bd93f9',
      comments: '#6272a4'
    },
    font: '"Fira Code", monospace',
    description: 'Gothic vampire castle meets modern development - extremely popular in dev community',
    effects: {
      backgroundGradient: 'linear-gradient(180deg, #282a36 0%, #1e1f29 100%)',
      cardGlow: '0 0 20px rgba(255, 121, 198, 0.4), inset 0 0 15px rgba(189, 147, 249, 0.1)',
      textGlow: '0 0 8px rgba(255, 121, 198, 0.6)',
      borderGlow: '0 0 15px #ff79c6',
      scanlines: false,
      gridPattern: false,
      matrixRain: false,
      glitchEffect: false,
      bokeh: false
    }
  },
  cyberpunk: {
    name: 'cyberpunk',
    displayName: 'Cyberpunk 2077 🤖',
    isPremium: true,
    colors: {
      background: '#0d0d0d',
      backgroundSecondary: 'rgba(20, 20, 20, 0.9)',
      backgroundTertiary: '#262626',
      primary: '#fcee0a',
      text: '#fcee0a',
      textSecondary: '#ffffff',
      accent: '#ff003c',
      border: '#00ffff',
      highlight: '#ff003c',
      comments: '#888888'
    },
    font: '"Courier New", monospace',
    description: 'Futuristic dystopian cityscape with glitch effects - edgy and trendy',
    effects: {
      backgroundGradient: 'radial-gradient(ellipse at bottom, #0d0d0d 0%, #000000 100%)',
      cardGlow: '0 0 25px rgba(252, 238, 10, 0.4), 0 0 15px rgba(0, 255, 255, 0.3)',
      textGlow: '0 0 10px #fcee0a, 0 0 20px #fcee0a',
      borderGlow: '0 0 15px #00ffff, 0 0 25px #00ffff',
      scanlines: false,
      gridPattern: false,
      matrixRain: false,
      glitchEffect: true,
      bokeh: false
    }
  },
  matrix: {
    name: 'matrix',
    displayName: 'Terminal Green (Matrix) 💻',
    isPremium: true,
    colors: {
      background: '#000000',
      backgroundSecondary: 'rgba(0, 20, 0, 0.8)',
      backgroundTertiary: '#001400',
      primary: '#00ff41',
      text: '#00ff41',
      textSecondary: '#33ff66',
      accent: '#008f11',
      border: '#008f11',
      highlight: '#00ff41',
      comments: '#006611'
    },
    font: '"Courier New", "VT323", monospace',
    description: 'Classic phosphor terminal with Matrix rain effects - for hackers and minimalists',
    effects: {
      backgroundGradient: 'linear-gradient(180deg, #000000 0%, #001400 100%)',
      cardGlow: '0 0 20px rgba(0, 255, 65, 0.4), inset 0 0 10px rgba(0, 255, 65, 0.1)',
      textGlow: '0 0 10px #00ff41, 0 0 20px #00ff41',
      borderGlow: '0 0 15px #00ff41',
      scanlines: true,
      gridPattern: false,
      matrixRain: true,
      glitchEffect: false,
      bokeh: false
    }
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
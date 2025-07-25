/**
 * Centralized Theme Utility System
 * 
 * Provides consistent theme styling across all components with optimized
 * color management and responsive design patterns.
 */

export type ThemeType = 'dark' | 'miami' | 'tron';

export interface ThemeStyles {
  background: string;
  text: string;
  borderColor: string;
  accentBg: string;
  accentText: string;
  cardBg: string;
  hoverBg: string;
  glow: string;
  gradient?: string;
  secondary?: string;
}

export interface ComponentVariants {
  card: ThemeStyles;
  button: ThemeStyles;
  input: ThemeStyles;
  navigation: ThemeStyles;
}

// Core theme color definitions - Consistent cyan theme
const THEME_COLORS = {
  dark: {
    background: '#0a0a1a',
    backgroundSecondary: '#0f0f0f',
    backgroundTertiary: '#16213e',
    primary: '#00FFFF',
    text: '#e0e0e0',
    textSecondary: '#00FFFF',
    accent: '#00FFFF',
    border: '#00FFFF'
  },
  miami: {
    background: '#0a0025',
    backgroundSecondary: '#2d1b69',
    backgroundTertiary: '#4a0e4e',
    primary: '#00FFFF',
    text: '#00FFFF',
    textSecondary: '#00FFFF',
    accent: '#00FFFF',
    border: '#00FFFF'
  },
  tron: {
    background: '#000000',
    backgroundSecondary: '#000000',
    backgroundTertiary: '#0a0a0a',
    primary: '#00FFFF',
    text: '#FFFFFF',
    textSecondary: '#00FFFF',
    accent: '#00FFFF',
    border: '#00FFFF'
  }
} as const;

/**
 * Get base theme styles for any component
 */
export const getThemeStyles = (theme: ThemeType): ThemeStyles => {
  const colors = THEME_COLORS[theme];
  
  return {
    background: `bg-[${colors.background}]`,
    text: `text-[${colors.text}]`,
    borderColor: `border-[${colors.border}]`,
    accentBg: `bg-[${colors.primary}]`,
    accentText: `text-[${colors.primary}]`,
    cardBg: `bg-[${colors.backgroundSecondary}]`,
    hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}]`,
    glow: '',
    secondary: `text-[${colors.textSecondary}]`
  };
};

/**
 * Get component-specific theme styles with variants
 */
export const getComponentStyles = (theme: ThemeType, variant: keyof ComponentVariants): ThemeStyles => {
  const base = getThemeStyles(theme);
  const colors = THEME_COLORS[theme];

  switch (variant) {
    case 'card':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        borderColor: `border-[${colors.border}]`,
        cardBg: `bg-[${colors.backgroundTertiary}]`
      };

    case 'button':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}] hover:scale-105`,
        borderColor: `border-[${colors.border}]`
      };

    case 'input':
      return {
        ...base,
        background: `bg-[${colors.backgroundTertiary}]`,
        borderColor: `border-[${colors.border}] focus:border-[${colors.primary}]`,
        text: `text-[${colors.text}] placeholder:text-[${colors.textSecondary}]`
      };

    case 'navigation':
      return {
        ...base,
        background: `bg-[${colors.background}]`,
        borderColor: `border-[${colors.border}]`,
        hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}]`
      };

    default:
      return base;
  }
};

/**
 * Get theme-specific gradient definitions
 */
export const getThemeGradients = (theme: ThemeType): { 
  primary: string; 
  accent: string; 
  card: string; 
  background: string; 
  text: string; 
  cardClass: string;
  backgroundClass: string;
  textClass: string;
} => {
  switch (theme) {
    case 'dark':
      return {
        primary: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 25%, #1a1a2e 50%, #16213e 75%, #0a0a1a 100%)',
        accent: 'linear-gradient(90deg, #00d4ff 0%, #00d4ff 50%, #00d4ff 100%)',
        card: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #0f0f0f 100%)',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 25%, #1a1a2e 50%, #16213e 75%, #0a0a1a 100%)',
        text: 'linear-gradient(90deg, #00d4ff 0%, #00d4ff 50%, #00d4ff 100%)',
        cardClass: 'gradient-card-dark',
        backgroundClass: 'gradient-bg-dark',
        textClass: 'gradient-text-dark'
      };

    case 'miami':
      return {
        primary: 'linear-gradient(135deg, #0a0025 0%, #2d1b69 25%, #4a0e4e 50%, #2d1b69 75%, #0a0025 100%)',
        accent: 'linear-gradient(90deg, #00d4ff 0%, #00d4ff 50%, #00d4ff 100%)',
        card: 'linear-gradient(135deg, #0a0025 0%, #2d1b69 30%, #4a0e4e 70%, #2d1b69 100%)',
        background: 'linear-gradient(135deg, #0a0025 0%, #2d1b69 25%, #4a0e4e 50%, #2d1b69 75%, #0a0025 100%)',
        text: 'linear-gradient(90deg, #00d4ff 0%, #00d4ff 50%, #00d4ff 100%)',
        cardClass: 'gradient-card-miami',
        backgroundClass: 'gradient-bg-miami',
        textClass: 'gradient-text-miami'
      };

    case 'tron':
      return {
        primary: 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #001111 50%, #0a0a0a 75%, #000000 100%)',
        accent: 'linear-gradient(90deg, #00d4ff 0%, #00d4ff 50%, #00d4ff 100%)',
        card: 'linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #001111 70%, #000000 100%)',
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #001111 50%, #0a0a0a 75%, #000000 100%)',
        text: 'linear-gradient(90deg, #00d4ff 0%, #00d4ff 50%, #00d4ff 100%)',
        cardClass: 'gradient-card-tron',
        backgroundClass: 'gradient-bg-tron',
        textClass: 'gradient-text-tron'
      };

    default:
      return getThemeGradients('dark');
  }
};

/**
 * Responsive breakpoint utilities
 */
export const BREAKPOINTS = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:'
} as const;

/**
 * Get responsive font sizing with clamp
 */
export const getResponsiveFontSize = (mobile: string, desktop: string, viewport = '2.5vw') => {
  return `clamp(${mobile}, ${viewport}, ${desktop})`;
};

/**
 * Standard component sizing for touch targets
 */
export const COMPONENT_SIZES = {
  touchTarget: 'min-h-[44px]',
  button: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  },
  icon: {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
} as const;

/**
 * Animation and transition utilities
 */
export const ANIMATIONS = {
  transition: 'transition-all duration-200',
  hover: 'hover:scale-105',
  smoothTransition: 'smooth-transition'
} as const;

/**
 * Typography and retro styling utilities
 */
export const TYPOGRAPHY = {
  retro: 'retro-font',
  pixel: 'font-pixel',
  monospace: 'font-mono',
  sizes: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl'
  },
  weights: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }
} as const;

/**
 * Color blending utilities for enhanced visual effects
 */
export const COLOR_BLENDING = {
  multiply: 'color-blend-multiply',
  screen: 'color-blend-screen',
  overlay: 'color-blend-overlay',
  normal: ''
} as const;

/**
 * Get typography classes for theme-specific text styling
 */
export const getTypographyClasses = (theme: ThemeType, size: keyof typeof TYPOGRAPHY.sizes = 'base', weight: keyof typeof TYPOGRAPHY.weights = 'normal') => {
  const gradients = getThemeGradients(theme);
  
  return {
    base: `${TYPOGRAPHY.retro} ${TYPOGRAPHY.sizes[size]} ${TYPOGRAPHY.weights[weight]}`,
    gradient: `${TYPOGRAPHY.retro} ${TYPOGRAPHY.sizes[size]} ${TYPOGRAPHY.weights[weight]} ${gradients.textClass}`,
    normal: `${TYPOGRAPHY.retro} ${TYPOGRAPHY.sizes[size]} ${TYPOGRAPHY.weights[weight]}`,
    mono: `${TYPOGRAPHY.pixel} ${TYPOGRAPHY.sizes[size]} ${TYPOGRAPHY.weights[weight]}`
  };
};
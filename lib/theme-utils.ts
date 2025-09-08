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

/**
 * Centralized Theme Utility System
 * 
 * Provides consistent theme styling across all components with optimized
 * color management and responsive design patterns.
 */

import { ThemeType, getThemeDefinition, THEME_DEFINITIONS } from './theme-config';

export type { ThemeType };

export interface ThemeStyles {
  background: string;
  text: string;
  mutedText?: string;
  borderColor: string;
  border: string;
  accentBg: string;
  accentText: string;
  cardBg: string;
  hoverBg: string;
  glow: string;
  gradient?: string;
  secondary: string;
  headerText?: string;
  secondaryText?: string;
}

export interface ComponentVariants {
  card: ThemeStyles;
  button: ThemeStyles;
  input: ThemeStyles;
  navigation: ThemeStyles;
  weather: ThemeStyles;
  dashboard: ThemeStyles;
  modal: ThemeStyles;
  auth: ThemeStyles;
}

// Get theme colors from the new configuration
const getThemeColors = (theme: ThemeType) => {
  const definition = getThemeDefinition(theme);
  return definition.colors;
};

/**
 * Get base theme styles for any component
 */
export const getThemeStyles = (theme: ThemeType): ThemeStyles => {
  // Default to 'dark' theme if invalid theme is provided
  const validTheme = (theme && THEME_DEFINITIONS[theme]) ? theme : 'dark';
  const colors = getThemeColors(validTheme);
  
  return {
    background: `bg-[${colors.background}]`,
    text: `text-[${colors.text}]`,
    mutedText: `text-[${colors.textSecondary}]`,
    borderColor: `border-[${colors.border}]`,
    border: `border-[${colors.border}]`,
    accentBg: `bg-[${colors.primary}]`,
    accentText: `text-[${colors.primary}]`,
    cardBg: `bg-[${colors.backgroundSecondary}]`,
    hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}]`,
    glow: `glow-${validTheme}`,
    secondary: `text-[${colors.textSecondary}]`
  };
};

/**
 * Get component-specific theme styles with variants
 */
export const getComponentStyles = (theme: ThemeType, variant: keyof ComponentVariants): ThemeStyles => {
  // Default to 'dark' theme if invalid theme is provided
  const validTheme = (theme && THEME_DEFINITIONS[theme]) ? theme : 'dark';
  const base = getThemeStyles(validTheme);
  const colors = getThemeColors(validTheme);

  switch (variant) {
    case 'card':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        borderColor: `border-[${colors.border}]`,
        border: `border-[${colors.border}]`,
        cardBg: `bg-[${colors.backgroundTertiary}]`
      };

    case 'button':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}] hover:scale-105`,
        borderColor: `border-[${colors.border}]`,
        border: `border-[${colors.border}]`
      };

    case 'input':
      return {
        ...base,
        background: `bg-[${colors.backgroundTertiary}]`,
        borderColor: `border-[${colors.border}] focus:border-[${colors.primary}]`,
        border: `border-[${colors.border}] focus:border-[${colors.primary}]`,
        text: `text-[${colors.text}] placeholder:text-[${colors.textSecondary}]`
      };

    case 'navigation':
      return {
        ...base,
        background: `bg-[${colors.background}]`,
        borderColor: `border-[${colors.border}]`,
        border: `border-[${colors.border}]`,
        hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}]`
      };

    case 'weather':
      return {
        ...base,
        background: `bg-[${colors.background}]`,
        cardBg: `bg-[${colors.backgroundSecondary}]`,
        borderColor: `border-[${colors.primary}]`,
        border: `border-[${colors.primary}]`,
        headerText: `text-[${colors.primary}] font-mono font-bold`,
        glow: `shadow-lg shadow-[${colors.primary}]/20`,
        secondaryText: `text-[${colors.textSecondary}]`
      };

    case 'dashboard':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        borderColor: `border-[${colors.border}]`,
        border: `border-[${colors.border}]`,
        accentBg: `bg-[${colors.primary}]`,
        hoverBg: `hover:bg-[${colors.backgroundTertiary}]`
      };

    case 'modal':
      return {
        ...base,
        background: `bg-[${colors.background}]`,
        borderColor: `border-[${colors.primary}]`,
        border: `border-[${colors.primary}]`,
        glow: `shadow-2xl shadow-[${colors.primary}]/30`
      };

    case 'auth':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        borderColor: `border-[${colors.border}]`,
        border: `border-[${colors.border}]`,
        accentBg: `bg-[${colors.primary}]`
      };

    default:
      return base;
  }
};

/**
 * Get theme-specific gradient definitions
 */
export const getThemeGradients = (theme: ThemeType): { primary: string; accent: string; card: string } => {
  const colors = getThemeColors(theme);
  
  switch (theme) {
    case 'dark':
      return {
        primary: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 100%)',
        accent: 'linear-gradient(90deg, #00d4ff 0%, #4ecdc4 100%)',
        card: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)'
      };

    case 'miami':
      return {
        primary: 'linear-gradient(135deg, #0a0025 0%, #2d1b69 50%, #4a0e4e 100%)',
        accent: 'linear-gradient(90deg, #ff1493 0%, #00ffff 100%)',
        card: 'linear-gradient(135deg, #2d1b69 0%, #4a0e4e 100%)'
      };

    case 'tron':
      return {
        primary: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
        accent: 'linear-gradient(90deg, #00FFFF 0%, #88CCFF 100%)',
        card: 'linear-gradient(135deg, #000000 0%, #001111 100%)'
      };

    case 'atari2600':
      return {
        primary: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundTertiary} 100%)`,
        accent: `linear-gradient(90deg, ${colors.highlight || colors.primary} 0%, ${colors.accent} 100%)`,
        card: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.backgroundTertiary} 100%)`
      };

    case 'monochromeGreen':
      return {
        primary: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundTertiary} 100%)`,
        accent: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        card: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.backgroundTertiary} 100%)`
      };

    case '8bitClassic':
      return {
        primary: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundSecondary} 100%)`,
        accent: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        card: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.backgroundTertiary} 100%)`
      };

    case '16bitSnes':
      return {
        primary: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundSecondary} 100%)`,
        accent: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.highlight || colors.accent} 100%)`,
        card: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.backgroundTertiary} 100%)`
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
  glow: 'animate-pulse',
  flicker: 'animate-flicker'
} as const;

/**
 * Pixel art effect utilities
 */
export const PIXEL_EFFECTS = {
  border: 'pixel-border',
  glow: (theme: ThemeType) => `pixel-glow glow-${theme}`,
  shadow: 'pixel-shadow',
  font: 'pixel-font font-mono'
} as const;


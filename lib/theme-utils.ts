/**
 * 16-Bit Weather Platform - v1.0.0
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
 *
 * IMPORTANT: When NEXT_PUBLIC_TERMINAL_DESIGN=true, this module returns
 * terminal CSS variable classes instead of hardcoded hex colors.
 */

import { ThemeType, getThemeDefinition, THEME_DEFINITIONS } from './theme-config';

export type { ThemeType };

// Check if Terminal Design System is enabled
const isTerminalDesignEnabled = process.env.NEXT_PUBLIC_TERMINAL_DESIGN === 'true';

/**
 * Terminal Design System theme styles
 * These use CSS variables that respond to data-palette and data-mode attributes
 */
const getTerminalThemeStyles = (): ThemeStyles => ({
  background: 'bg-terminal-bg-primary',
  text: 'text-terminal-text-primary',
  mutedText: 'text-terminal-text-muted',
  borderColor: 'border-transparent',
  border: 'border-transparent',
  accentBg: 'bg-terminal-accent',
  accentText: 'text-terminal-accent',
  cardBg: 'bg-terminal-bg-secondary',
  hoverBg: 'hover:bg-terminal-bg-elevated hover:text-terminal-text-primary',
  glow: 'shadow-lg shadow-terminal-accent/20',
  secondary: 'text-terminal-text-secondary',
  headerText: 'text-terminal-accent font-mono font-bold',
  secondaryText: 'text-terminal-text-secondary',
  warningText: 'text-terminal-accent-warning',
  successText: 'text-terminal-accent-success',
  shadowColor: 'var(--terminal-accent-primary)'
});

/**
 * Terminal Design System component variant styles
 */
const getTerminalComponentStyles = (variant: keyof ComponentVariants): ThemeStyles => {
  const base = getTerminalThemeStyles();

  switch (variant) {
    case 'card':
      return {
        ...base,
        background: 'bg-terminal-bg-secondary',
        borderColor: 'border-transparent',
        border: 'border-transparent',
        cardBg: 'bg-terminal-bg-elevated'
      };

    case 'button':
      return {
        ...base,
        background: 'bg-terminal-bg-secondary',
        hoverBg: 'hover:bg-terminal-accent hover:text-terminal-bg-primary hover:scale-105',
        borderColor: 'border-transparent',
        border: 'border-transparent'
      };

    case 'input':
      return {
        ...base,
        background: 'bg-terminal-bg-elevated',
        borderColor: 'border-transparent focus:border-transparent',
        border: 'border-transparent focus:border-transparent',
        text: 'text-terminal-text-primary placeholder:text-terminal-text-muted'
      };

    case 'navigation':
      return {
        ...base,
        background: 'bg-terminal-bg-primary',
        borderColor: 'border-transparent',
        border: 'border-transparent',
        hoverBg: 'hover:bg-terminal-accent hover:text-terminal-bg-primary'
      };

    case 'weather':
      return {
        ...base,
        background: 'bg-terminal-bg-primary',
        cardBg: 'bg-terminal-bg-secondary',
        borderColor: 'border-transparent',
        border: 'border-transparent',
        headerText: 'text-terminal-accent font-mono font-bold',
        glow: 'shadow-lg shadow-terminal-accent/20',
        secondaryText: 'text-terminal-text-secondary'
      };

    case 'dashboard':
      return {
        ...base,
        background: 'bg-terminal-bg-secondary',
        borderColor: 'border-transparent',
        border: 'border-transparent',
        accentBg: 'bg-terminal-accent',
        hoverBg: 'hover:bg-terminal-bg-elevated'
      };

    case 'modal':
      return {
        ...base,
        background: 'bg-terminal-bg-primary',
        borderColor: 'border-transparent',
        border: 'border-transparent',
        glow: 'shadow-2xl shadow-terminal-accent/30'
      };

    case 'auth':
      return {
        ...base,
        background: 'bg-terminal-bg-secondary',
        borderColor: 'border-transparent',
        border: 'border-transparent',
        accentBg: 'bg-terminal-accent'
      };

    default:
      return base;
  }
};

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
  // Legacy compatibility properties
  warningText?: string;
  successText?: string;
  shadowColor?: string;
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
 * When Terminal Design System is enabled, returns CSS variable-based classes
 */
export const getThemeStyles = (theme: ThemeType): ThemeStyles => {
  // Use terminal design system if enabled
  if (isTerminalDesignEnabled) {
    return getTerminalThemeStyles();
  }

  // Legacy: Default to 'dark' theme if invalid theme is provided
  const validTheme = (theme && THEME_DEFINITIONS[theme]) ? theme : 'dark';
  const colors = getThemeColors(validTheme);

  return {
    background: `bg-[${colors.background}]`,
    text: `text-[${colors.text}]`,
    mutedText: `text-[${colors.textSecondary}]`,
    borderColor: 'border-transparent',
    border: 'border-0',
    accentBg: `bg-[${colors.primary}]`,
    accentText: `text-[${colors.primary}]`,
    cardBg: `bg-[${colors.backgroundSecondary}]`,
    hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}]`,
    glow: `glow-${validTheme}`,
    secondary: `text-[${colors.textSecondary}]`,
    headerText: `text-[${colors.primary}]`,
    secondaryText: `text-[${colors.textSecondary}]`,
    // Legacy compatibility
    warningText: `text-[${colors.accent}]`,
    successText: `text-[${colors.primary}]`,
    shadowColor: colors.primary
  };
};

/**
 * Get component-specific theme styles with variants
 * When Terminal Design System is enabled, returns CSS variable-based classes
 */
export const getComponentStyles = (theme: ThemeType, variant: keyof ComponentVariants): ThemeStyles => {
  // Use terminal design system if enabled
  if (isTerminalDesignEnabled) {
    return getTerminalComponentStyles(variant);
  }

  // Legacy: Default to 'dark' theme if invalid theme is provided
  const validTheme = (theme && THEME_DEFINITIONS[theme]) ? theme : 'dark';
  const base = getThemeStyles(validTheme);
  const colors = getThemeColors(validTheme);

  switch (variant) {
    case 'card':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        borderColor: 'border-transparent',
        border: 'border-0',
        cardBg: `bg-[${colors.backgroundTertiary}]`
      };

    case 'button':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}] hover:scale-105`,
        borderColor: 'border-transparent',
        border: 'border-0'
      };

    case 'input':
      return {
        ...base,
        background: `bg-[${colors.backgroundTertiary}]`,
        borderColor: 'border-transparent focus:border-transparent',
        border: 'border-0 focus:border-0',
        text: `text-[${colors.text}] placeholder:text-[${colors.textSecondary}]`
      };

    case 'navigation':
      return {
        ...base,
        background: `bg-[${colors.background}]`,
        borderColor: 'border-transparent',
        border: 'border-0',
        hoverBg: `hover:bg-[${colors.primary}] hover:text-[${colors.background}]`
      };

    case 'weather':
      return {
        ...base,
        background: `bg-[${colors.background}]`,
        cardBg: `bg-[${colors.backgroundSecondary}]`,
        borderColor: 'border-transparent',
        border: 'border-0',
        headerText: `text-[${colors.primary}] font-mono font-bold`,
        glow: `shadow-lg shadow-[${colors.primary}]/20`,
        secondaryText: `text-[${colors.textSecondary}]`
      };

    case 'dashboard':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        borderColor: 'border-transparent',
        border: 'border-0',
        accentBg: `bg-[${colors.primary}]`,
        hoverBg: `hover:bg-[${colors.backgroundTertiary}]`
      };

    case 'modal':
      return {
        ...base,
        background: `bg-[${colors.background}]`,
        borderColor: 'border-transparent',
        border: 'border-0',
        glow: `shadow-2xl shadow-[${colors.primary}]/30`
      };

    case 'auth':
      return {
        ...base,
        background: `bg-[${colors.backgroundSecondary}]`,
        borderColor: 'border-transparent',
        border: 'border-0',
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

/**
 * Simple glow class helper - use this for adding theme-specific glow effects
 * This is the preferred approach for new code instead of getComponentStyles
 */
export const getGlowClass = (theme: ThemeType): string => `glow-${theme}`;

/**
 * Get retro 16-bit effects for a theme
 * Use this for custom 16-bit styling that shadcn doesn't provide
 */
export const getRetroEffects = (theme: ThemeType) => ({
  glow: `glow-${theme}`,
  pixelBorder: 'pixel-border',
  pixelShadow: 'pixel-shadow',
  scanlines: theme === 'matrix' || theme === 'synthwave84',
});


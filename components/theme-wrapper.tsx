"use client"

import React from 'react'
import { useTheme } from './theme-provider'

interface ThemeWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * ThemeWrapper component ensures all children inherit theme styles
 * This component forces theme application on all nested components
 */
export function ThemeWrapper({ children, className = '' }: ThemeWrapperProps) {
  const { theme } = useTheme()
  
  // Create theme-specific classes
  const themeClasses = {
    dark: 'theme-dark bg-[var(--bg)] text-[var(--text)]',
    miami: 'theme-miami bg-[var(--bg)] text-[var(--text)]',
    tron: 'theme-tron bg-[var(--bg)] text-[var(--text)]',
    atari2600: 'theme-atari2600 bg-[var(--bg)] text-[var(--text)]',
    monochromeGreen: 'theme-monochromeGreen bg-[var(--bg)] text-[var(--text)]',
    '8bitClassic': 'theme-8bitClassic bg-[var(--bg)] text-[var(--text)]',
    '16bitSnes': 'theme-16bitSnes bg-[var(--bg)] text-[var(--text)]'
  }
  
  return (
    <div 
      className={`theme-wrapper ${themeClasses[theme] || themeClasses.dark} ${className}`}
      data-theme={theme}
      style={{
        '--current-theme': theme,
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        minHeight: '100%'
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

/**
 * ThemeCard component for themed card containers
 */
export function ThemeCard({ children, className = '' }: ThemeWrapperProps) {
  const { theme } = useTheme()
  
  return (
    <div 
      className={`theme-card bg-[var(--bg-elev)] border-2 border-[var(--border)] p-4 ${className}`}
      data-theme={theme}
      style={{
        backgroundColor: 'var(--bg-elev)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        boxShadow: theme === 'tron' 
          ? '0 0 20px var(--primary)' 
          : theme === 'miami'
          ? '0 0 15px var(--primary)'
          : '0 0 10px var(--primary)'
      }}
    >
      {children}
    </div>
  )
}
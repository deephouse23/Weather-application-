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
  const themeClasses: Record<string, string> = {
    dark: 'theme-dark bg-[var(--bg)] text-[var(--text)]',
    nord: 'theme-nord bg-[var(--bg)] text-[var(--text)]',
    synthwave84: 'theme-synthwave84 bg-[var(--bg)] text-[var(--text)]',
    dracula: 'theme-dracula bg-[var(--bg)] text-[var(--text)]',
    cyberpunk: 'theme-cyberpunk bg-[var(--bg)] text-[var(--text)]',
    matrix: 'theme-matrix bg-[var(--bg)] text-[var(--text)]'
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
      className={`theme-card bg-[var(--bg-elev)] border-0 p-4 ${className}`}
      data-theme={theme}
      style={{
        backgroundColor: 'var(--bg-elev)',
        color: 'var(--text)',
        boxShadow: theme === 'synthwave84'
          ? '0 0 15px var(--primary)'
          : '0 0 10px var(--primary)'
      }}
    >
      {children}
    </div>
  )
}
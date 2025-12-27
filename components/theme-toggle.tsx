"use client"

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

import * as React from "react"
import { Moon, Sun, Zap, Timer } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"
import { useThemePreview } from "@/lib/hooks/use-theme-preview"
import { Badge } from "@/components/ui/badge"

export function ThemeToggle() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation')
  const { startPreview, isPreviewActive, timeRemaining } = useThemePreview()

  const handleClick = () => {
    // Cycle through themes using the preview system
    const themes = ['dark', 'miami', 'tron']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    startPreview(nextTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'miami':
        return <Sun className="w-4 h-4" />
      case 'tron':
        return <Zap className="w-4 h-4" />
      default:
        return <Moon className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`relative flex items-center justify-center p-2 border-2 transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
        title={`Switch theme (${theme})`}
        aria-label="Toggle theme"
      >
        {getThemeIcon()}
        {isPreviewActive && (
          <div className="absolute -top-1 -right-1">
            <Badge variant="secondary" className="text-xs px-1 py-0.5 bg-orange-500 text-white">
              <Timer className="w-2 h-2" />
            </Badge>
          </div>
        )}
      </button>
    </div>
  )
} 
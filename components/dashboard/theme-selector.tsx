'use client'

/**
 * 16-Bit Weather Platform - BETA v0.5.0
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

import { Moon, Sun, Zap, Gamepad2, Terminal, Cpu, Ghost, CloudLightning, Code2 } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { THEME_DEFINITIONS, ThemeDefinition, isThemePremium } from '@/lib/theme-config'

// Map icons to themes
const THEME_ICONS: Record<string, any> = {
  dark: Moon,
  miami: Sun,
  tron: Zap,
  atari2600: Gamepad2,
  monochromeGreen: Terminal,
  '8bitClassic': Gamepad2,
  '16bitSnes': Gamepad2,
  synthwave84: Sun,
  tokyoNight: Moon,
  dracula: Ghost,
  cyberpunk: Cpu,
  matrix: Code2
}

export default function ThemeSelector() {
  const { theme, setTheme, availableThemes, isAuthenticated } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')

  // Generate options from config
  const themeOptions = Object.values(THEME_DEFINITIONS).map((def: ThemeDefinition) => {
    // Determine preview colors based on theme definition
    // We try to match the tailwind classes if possible, otherwise rely on dynamic styles which we might not have here yet.
    // For now, we'll map a few known ones and default to a generic style for others or use inline styles if we were refactoring fully.
    // Given the previous code used hardcoded utility classes, we'll try to map colors to closest utilities or use arbitrary values.

    // Helper to get icon
    const Icon = THEME_ICONS[def.name] || Moon

    return {
      id: def.name,
      name: def.displayName,
      description: def.description || '',
      icon: Icon,
      isPremium: def.isPremium,
      // We will use inline styles for the preview to be accurate to the config
      colors: def.colors
    }
  })

  return (
    <div className={`p-6 border-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-mono font-bold uppercase tracking-wider ${themeClasses.text}`}>
          Theme Settings
        </h3>
        {isAuthenticated && (
          <span className="text-xs font-mono px-2 py-1 rounded bg-green-900 text-green-400 border border-green-700">
            PREMIUM UNLOCKED
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themeOptions.map((option) => {
          const isActive = theme === option.id
          const isLocked = option.isPremium && !isAuthenticated
          const IconComponent = option.icon

          return (
            <button
              key={option.id}
              onClick={() => !isLocked && setTheme(option.id as ThemeType)}
              disabled={isLocked}
              className={`relative p-4 border-2 transition-all duration-200 text-left w-full group ${isActive
                  ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                  : isLocked
                    ? `opacity-60 cursor-not-allowed ${themeClasses.background} border-gray-700 text-gray-500`
                    : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} hover:scale-[1.02] hover:bg-white/5`
                }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-black text-white text-[10px] font-mono uppercase">ACTIVE</span>
                </div>
              )}

              {/* Premium Indicator */}
              {option.isPremium && !isActive && (
                <div className="absolute top-2 right-2">
                  {isLocked ? (
                    <span className="px-2 py-1 bg-red-900/50 text-red-400 border border-red-800 text-[10px] font-mono uppercase">LOCKED</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-900/50 text-yellow-400 border border-yellow-800 text-[10px] font-mono uppercase">PREMIUM</span>
                  )}
                </div>
              )}

              <div className="flex items-start space-x-3">
                {/* Theme Preview Circle */}
                <div
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: option.colors.background,
                    borderColor: option.colors.primary,
                    color: option.colors.primary
                  }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Theme Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-mono font-bold text-sm uppercase tracking-wider mb-0.5 truncate">
                    {option.name}
                  </h4>
                  <p className={`text-xs font-mono line-clamp-2 ${isActive ? 'text-black/80' : 'text-gray-500'}`}>
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {!isAuthenticated && (
        <div className={`mt-6 p-4 border border-dashed ${themeClasses.borderColor} bg-black/20`}>
          <p className={`text-sm font-mono text-center ${themeClasses.text}`}>
            <span className="block mb-2 text-xl">🔒</span>
            Login to unlock <span className="font-bold text-yellow-400">{themeOptions.filter(t => t.isPremium).length} Premium Themes</span> keeping your preferences synced across devices.
          </p>
        </div>
      )}
    </div>
  )
}
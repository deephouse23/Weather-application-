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

import { Moon, Sun, Zap, Check } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

interface ThemeOption {
  id: ThemeType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  previewBg: string
  previewBorder: string
  previewText: string
  previewAccent: string
}

const themeOptions: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Classic terminal interface',
    icon: Moon,
    previewBg: 'bg-gray-900',
    previewBorder: 'border-green-400',
    previewText: 'text-green-400',
    previewAccent: 'text-green-400'
  },
  {
    id: 'miami',
    name: 'Miami Vice',
    description: 'Neon 80s aesthetic',
    icon: Sun,
    previewBg: 'bg-purple-900',
    previewBorder: 'border-orange-400',
    previewText: 'text-orange-400',
    previewAccent: 'text-pink-400'
  },
  {
    id: 'tron',
    name: 'TRON',
    description: 'Cyberpunk grid world',
    icon: Zap,
    previewBg: 'bg-black',
    previewBorder: 'border-cyan-400',
    previewText: 'text-cyan-400',
    previewAccent: 'text-cyan-400'
  }
]

export default function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')

  return (
    <div className={`p-6 border-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
      <h3 className={`text-lg font-mono font-bold uppercase tracking-wider mb-4 ${themeClasses.text}`}>
        Theme Settings
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {themeOptions.map((option) => {
          const isActive = theme === option.id
          const isAvailable = availableThemes.includes(option.id)
          const IconComponent = option.icon
          
          return (
            <button
              key={option.id}
              onClick={() => isAvailable && setTheme(option.id)}
              disabled={!isAvailable}
              className={`relative p-4 border-2 transition-all duration-200 text-left ${
                isActive
                  ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                  : isAvailable
                  ? `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg} hover:scale-[1.02]`
                  : `opacity-50 cursor-not-allowed ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.mutedText}`
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <Check className="absolute top-2 right-2 w-5 h-5 text-black" />
              )}
              
              <div className="flex items-start space-x-4">
                {/* Theme Preview Card */}
                <div className={`w-16 h-12 border-2 ${option.previewBg} ${option.previewBorder} flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 ${option.previewAccent}`} />
                </div>
                
                {/* Theme Info */}
                <div className="flex-1">
                  <h4 className="font-mono font-bold text-sm uppercase tracking-wider mb-1">
                    {option.name}
                  </h4>
                  <p className={`text-xs font-mono ${isActive ? 'text-black' : themeClasses.mutedText}`}>
                    {option.description}
                  </p>
                  
                  {/* Status */}
                  <div className="mt-2 flex items-center space-x-2">
                    {isActive && (
                      <span className="px-2 py-1 bg-black text-white text-xs font-mono uppercase">
                        Active
                      </span>
                    )}
                    {!isAvailable && (
                      <span className="px-2 py-1 border border-red-500 text-red-500 text-xs font-mono uppercase">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      
      <div className={`mt-4 p-3 border ${themeClasses.borderColor} ${themeClasses.background}`}>
        <p className={`text-xs font-mono ${themeClasses.mutedText}`}>
          <strong>Tip:</strong> Theme preferences are saved to your account and sync across devices.
        </p>
      </div>
    </div>
  )
}
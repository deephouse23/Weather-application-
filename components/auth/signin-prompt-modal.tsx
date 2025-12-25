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

import { X, Sun, Zap, Palette } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

interface SignInPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignInPromptModal({ isOpen, onClose }: SignInPromptModalProps) {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'modal')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md p-6 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
            Unlock Themes
          </h2>
          <button
            onClick={onClose}
            className={`p-2 border-2 transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className={`text-sm font-mono ${themeClasses.text} mb-4`}>
            Unlock Miami Vice and TRON themes by creating a free account
          </p>
          
          {/* Theme Preview */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 border-2 border-orange-400 bg-purple-900 text-center">
              <Sun className="w-5 h-5 mx-auto mb-1 text-orange-400" />
              <p className="text-xs font-mono text-orange-400 uppercase">Miami Vice</p>
            </div>
            <div className="p-3 border-2 border-cyan-400 bg-black text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
              <p className="text-xs font-mono text-cyan-400 uppercase">TRON</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <Palette className={`w-5 h-5 ${themeClasses.accentText}`} />
            <span className={`ml-2 text-sm font-mono ${themeClasses.text}`}>
              + Saved locations & preferences
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/signin"
            onClick={onClose}
            className={`w-full flex items-center justify-center px-4 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
          >
            Sign In / Sign Up
          </Link>
          
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 border-2 text-sm font-mono uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
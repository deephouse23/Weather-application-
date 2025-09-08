'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogIn, LogOut, User, ChevronDown, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

export default function AuthButton() {
  const { user, profile, loading, isInitialized, signOut } = useAuth()
  const { theme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation')

  // Show loading spinner only when not initialized or during auth transitions
  if (!isInitialized || (loading && !user)) {
    return (
      <div className={`flex items-center justify-center px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider min-w-[80px] h-[32px] ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text}`}>
        <div className={`animate-spin rounded-full h-3 w-3 border-b border-current`}></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className={`flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] h-[32px] ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
      >
        <LogIn className="w-3 h-3" />
        <span className="whitespace-nowrap">LOGIN</span>
      </Link>
    )
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsDropdownOpen(true)}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <button
        className={`flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] h-[32px] ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
      >
        <User className="w-3 h-3" />
        <span className="whitespace-nowrap">{profile?.username || 'USER'}</span>
        <ChevronDown className="w-2 h-2 ml-0.5" />
      </button>

      {/* User Dropdown Menu */}
      {isDropdownOpen && (
        <div className={`absolute top-full right-0 mt-1 w-44 border-2 z-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
          <Link
            href="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 w-full ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>DASHBOARD</span>
          </Link>
          
          <Link
            href="/profile"
            className={`flex items-center space-x-3 px-3 py-2 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 w-full ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <User className="w-3 h-3" />
            <span>PROFILE</span>
          </Link>
          
          <button
            onClick={signOut}
            className={`flex items-center space-x-3 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 w-full text-left ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <LogOut className="w-3 h-3" />
            <span>SIGN OUT</span>
          </button>
        </div>
      )}
    </div>
  )
}
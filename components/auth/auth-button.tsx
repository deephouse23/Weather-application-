'use client'

import { useState, useEffect } from 'react'
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

  // Handle click to toggle dropdown
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.auth-dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Show loading spinner only when not initialized
  if (!isInitialized) {
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
    <div className="relative auth-dropdown-container">
      <button
        onClick={handleButtonClick}
        className={`flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] h-[32px] ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
      >
        <User className="w-3 h-3" />
        <span className="whitespace-nowrap">{profile?.username || user?.email?.split('@')[0] || 'USER'}</span>
        <ChevronDown className={`w-2 h-2 ml-0.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Cloud, Zap, BookOpen, Gamepad2, Info, Home, ChevronDown } from "lucide-react"

// Theme types to match main app
type ThemeType = 'dark' | 'miami' | 'tron';

interface NavigationProps {
  currentTheme: ThemeType
  onThemeChange: (theme: ThemeType) => void
}

/**
 * 16-Bit Weather Education Platform Navigation
 * 
 * Features authentic retro styling with pixel-perfect borders
 * and three-theme support (Dark/Miami/Tron) for the expanded education platform
 */
export default function Navigation({ currentTheme, onThemeChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false)
  const pathname = usePathname()

  // Enhanced theme colors for three themes with authentic Tron movie colors
  const getThemeColors = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          background: '#0a0a1a',
          cardBg: '#16213e',
          border: '#00d4ff',
          text: '#e0e0e0',
          accent: '#00d4ff',
          hoverBg: '#1a2a4a'
        }
      case 'miami':
        return {
          background: '#0a0025',
          cardBg: '#4a0e4e',
          border: '#ff1493',
          text: '#00ffff',
          accent: '#ff1493',
          hoverBg: '#6a1e6e'
        }
      case 'tron':
        return {
          background: '#000000',
          cardBg: '#000000',
          border: '#00FFFF',           // Electric cyan blue - authentic 80s Tron
          text: '#FFFFFF',             // Bright white with cyan glow
          accent: '#00FFFF',           // Electric cyan for main UI
          hoverBg: '#001111',
          warning: '#FF1744',          // Bright neon red for warnings/MCP programs
          special: '#00FFFF'           // Electric cyan for special features
        }
    }
  }

  const themeColors = getThemeColors(currentTheme)

  const navItems = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/cloud-types", label: "CLOUD TYPES", icon: Cloud },
    { href: "/weather-systems", label: "WEATHER SYSTEMS", icon: Zap },
    { href: "/fun-facts", label: "FUN FACTS", icon: BookOpen },
    { href: "/games", label: "GAMES", icon: Gamepad2 },
    { href: "/about", label: "ABOUT", icon: Info }
  ]

  // Get theme display info for dropdown options
  const getThemeDisplay = (theme: ThemeType) => {
    switch (theme) {
      case 'dark': return { label: 'DARK', emoji: '🌙' }
      case 'miami': return { label: 'MIAMI', emoji: '🌴' }
      case 'tron': return { label: 'TRON', emoji: '⚡' }
    }
  }

  const handleThemeSelect = (theme: ThemeType) => {
    onThemeChange(theme)
    setIsThemeDropdownOpen(false)
  }

  return (
    <nav className="w-full border-b-4 pixel-border relative z-50"
         style={{ 
           backgroundColor: themeColors.background,
           borderColor: themeColors.border,
           boxShadow: `0 4px 20px ${themeColors.border}33`
         }}>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        {/* Logo/Brand - TOP LEFT */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 flex items-center justify-center animate-pulse"
               style={{ borderColor: themeColors.accent, backgroundColor: themeColors.accent }}>
            <span className="text-black font-bold text-sm">16</span>
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wider font-mono"
              style={{ 
                color: themeColors.text,
                textShadow: `0 0 8px ${themeColors.accent}`
              }}>
            BIT WEATHER
          </h1>
        </div>

        {/* Main Navigation Links - TOP CENTER */}
        <div className="flex items-center space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] h-[32px]"
                style={{
                  borderColor: isActive ? themeColors.accent : themeColors.border,
                  backgroundColor: isActive ? themeColors.accent : themeColors.background,
                  color: isActive ? (currentTheme === 'tron' ? '#000000' : '#000') : themeColors.text,
                  boxShadow: isActive ? `0 0 10px ${themeColors.accent}` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = themeColors.hoverBg
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = themeColors.background
                  }
                }}
              >
                <Icon className="w-3 h-3" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </div>
        
        {/* Theme Selector - TOP RIGHT */}
        <div className="relative">
          <button
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            className="flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 min-w-[80px] h-[32px]"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.background,
              color: themeColors.accent,
              boxShadow: currentTheme === 'tron' ? `0 0 10px ${themeColors.accent}` : 'none'
            }}
          >
            <span>🎮 THEMES</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {/* Theme Dropdown Menu */}
          {isThemeDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 border-2 z-50 min-w-[100px]"
                 style={{
                   backgroundColor: themeColors.background,
                   borderColor: themeColors.border,
                   boxShadow: `0 4px 20px ${themeColors.border}33`
                 }}>
              {(['dark', 'miami', 'tron'] as ThemeType[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeSelect(theme)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 h-[32px]"
                  style={{
                    backgroundColor: currentTheme === theme ? themeColors.accent : themeColors.background,
                    color: currentTheme === theme ? '#000000' : themeColors.text,
                    borderBottom: theme !== 'tron' ? `1px solid ${themeColors.border}33` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (currentTheme !== theme) {
                      e.currentTarget.style.backgroundColor = themeColors.hoverBg
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentTheme !== theme) {
                      e.currentTarget.style.backgroundColor = themeColors.background
                    }
                  }}
                >
                  <span>{getThemeDisplay(theme).emoji}</span>
                  <span>{getThemeDisplay(theme).label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        {/* Mobile Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 flex items-center justify-center"
               style={{ borderColor: themeColors.accent, backgroundColor: themeColors.accent }}>
            <span className="text-black font-bold text-xs">16</span>
          </div>
          <h1 className="text-sm font-bold uppercase tracking-wider font-mono"
              style={{ color: themeColors.text }}>
            BIT WEATHER
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 border-2"
          style={{
            borderColor: themeColors.border,
            backgroundColor: themeColors.background,
            color: themeColors.text
          }}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-4 border-t-0 z-50"
             style={{
               backgroundColor: themeColors.background,
               borderColor: themeColors.border
             }}>
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 border-2 text-sm font-mono font-bold uppercase tracking-wider w-full h-[48px]"
                  style={{
                    borderColor: isActive ? themeColors.accent : themeColors.border,
                    backgroundColor: isActive ? themeColors.accent : themeColors.background,
                    color: isActive ? '#000' : themeColors.text
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {/* Mobile Theme Selector */}
            <div className="mt-3 pt-3 border-t-2" style={{ borderColor: themeColors.border }}>
              <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2"
                   style={{ color: themeColors.accent }}>
                🎮 THEMES:
              </div>
              <div className="space-y-1">
                {(['dark', 'miami', 'tron'] as ThemeType[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      handleThemeSelect(theme)
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 p-2 border text-xs font-mono font-bold uppercase tracking-wider w-full h-[40px]"
                    style={{
                      borderColor: currentTheme === theme ? themeColors.accent : themeColors.border,
                      backgroundColor: currentTheme === theme ? themeColors.accent : themeColors.background,
                      color: currentTheme === theme ? '#000000' : themeColors.text
                    }}
                  >
                    <span>{getThemeDisplay(theme).emoji}</span>
                    <span>{getThemeDisplay(theme).label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 
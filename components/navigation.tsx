"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Cloud, Zap, BookOpen, Gamepad2, Info, Home, ChevronDown } from "lucide-react"
import { ThemeType, themeUtils, APP_CONSTANTS } from "@/lib/utils"

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

  // Use centralized theme classes
  const themeClasses = themeUtils.getThemeClasses(currentTheme)

  const navItems = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/cloud-types", label: "CLOUD TYPES", icon: Cloud },
    { href: "/weather-systems", label: "WEATHER SYSTEMS", icon: Zap },
    { href: "/fun-facts", label: "16-BIT TAKES", icon: BookOpen },
    { href: "/games", label: "GAMES", icon: Gamepad2 },
    { href: "/about", label: "ABOUT", icon: Info }
  ]

  // Use centralized theme display utility
  const getThemeDisplay = themeUtils.getThemeDisplay

  const handleThemeSelect = (theme: ThemeType) => {
    onThemeChange(theme)
    setIsThemeDropdownOpen(false)
  }

  return (
    <nav className={`w-full border-b-4 pixel-border relative z-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        {/* Logo/Brand - TOP LEFT */}
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 border-2 flex items-center justify-center animate-pulse ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
            <span className="text-black font-bold text-sm">16</span>
          </div>
          <h1 className={`text-xl font-bold uppercase tracking-wider font-mono ${themeClasses.text} ${themeClasses.glow}`}>
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
                className={`flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] h-[32px] ${
                  isActive 
                    ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`
                    : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`
                }`}
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
            className={`flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] h-[32px] whitespace-nowrap ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg} ${
              currentTheme === APP_CONSTANTS.THEMES.TRON ? themeClasses.glow : ''
            }`}
          >
            <span>PIXEL MODE</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {/* Theme Dropdown Menu */}
          {isThemeDropdownOpen && (
            <div className={`absolute top-full right-0 mt-1 border-2 z-50 min-w-[120px] ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
              {Object.values(APP_CONSTANTS.THEMES).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeSelect(theme)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 h-[32px] ${
                    currentTheme === theme 
                      ? `${themeClasses.accentBg} text-black`
                      : `${themeClasses.background} ${themeClasses.text} ${themeClasses.hoverBg}`
                  }`}
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
          <div className={`w-6 h-6 border-2 flex items-center justify-center ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
            <span className="text-black font-bold text-xs">16</span>
          </div>
          <h1 className={`text-sm font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
            BIT WEATHER
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 border-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text}`}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-full left-0 right-0 border-4 border-t-0 z-50 ${themeClasses.background} ${themeClasses.borderColor}`}>
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 p-3 border-2 text-sm font-mono font-bold uppercase tracking-wider w-full h-[48px] ${
                    isActive 
                      ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                      : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {/* Mobile Theme Selector */}
            <div className={`mt-3 pt-3 border-t-2 ${themeClasses.borderColor}`}>
              <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-2 ${themeClasses.accentText}`}>
                PIXEL MODE:
              </div>
              <div className="space-y-1">
                {Object.values(APP_CONSTANTS.THEMES).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      handleThemeSelect(theme)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`flex items-center space-x-3 p-2 border text-xs font-mono font-bold uppercase tracking-wider w-full h-[40px] ${
                      currentTheme === theme 
                        ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                        : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text}`
                    }`}
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
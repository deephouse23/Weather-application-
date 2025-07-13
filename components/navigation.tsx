"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Cloud, Zap, BookOpen, Gamepad2, Info, Home, ChevronDown } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface NavigationProps {
  weatherLocation?: string;
  weatherTemperature?: number;
  weatherUnit?: string;
}

/**
 * 16-Bit Weather Education Platform Navigation
 * 
 * Features authentic retro styling with pixel-perfect borders
 * and three-theme support (Dark/Miami/Tron) for the expanded education platform
 */
export default function Navigation({ weatherLocation, weatherTemperature, weatherUnit }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { theme } = useTheme()

  // Local theme classes function for better light mode support
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-[#0a0a1a]',
          text: 'text-[#e0e0e0]',
          borderColor: 'border-[#00d4ff]',
          accentBg: 'bg-[#00d4ff]',
          accentText: 'text-[#00d4ff]',
          cardBg: 'bg-[#0f0f0f]',
          hoverBg: 'hover:bg-[#00d4ff] hover:text-[#0a0a1a]',
          glow: 'glow-dark'
        }
      case 'miami':
        return {
          background: 'bg-[#2d1b69]',
          text: 'text-[#00ffff]',
          borderColor: 'border-[#ff1493]',
          accentBg: 'bg-[#ff1493]',
          accentText: 'text-[#ff1493]',
          cardBg: 'bg-[#4a0e4e]',
          hoverBg: 'hover:bg-[#ff1493] hover:text-[#2d1b69]',
          glow: 'glow-miami'
        }
      case 'tron':
        return {
          background: 'bg-black',
          text: 'text-white',
          borderColor: 'border-[#00FFFF]',
          accentBg: 'bg-[#00FFFF]',
          accentText: 'text-[#00FFFF]',
          cardBg: 'bg-black',
          hoverBg: 'hover:bg-[#00FFFF] hover:text-black',
          glow: 'glow-tron'
        }
      default:
        return {
          background: 'bg-[#0a0a1a]',
          text: 'text-[#e0e0e0]',
          borderColor: 'border-[#00d4ff]',
          accentBg: 'bg-[#00d4ff]',
          accentText: 'text-[#00d4ff]',
          cardBg: 'bg-[#0f0f0f]',
          hoverBg: 'hover:bg-[#00d4ff] hover:text-[#0a0a1a]',
          glow: 'glow-dark'
        }
    }
  }

  const themeClasses = getThemeClasses(theme)

  // Helper function to format location for header display
  const formatHeaderLocation = (location: string): string => {
    // Convert "Beverly Hills, US" to "BEVERLY HILLS" format
    // Convert "New York, NY, US" to "NEW YORK NY" format
    let formatted = location.toUpperCase();
    
    // Remove country codes and clean up
    formatted = formatted.replace(/, US$/, '');
    formatted = formatted.replace(/, CA$/, '');
    formatted = formatted.replace(/, UK$/, '');
    formatted = formatted.replace(/, GB$/, '');
    
    // Replace commas with spaces for cleaner look
    formatted = formatted.replace(/,/g, ' ');
    
    return formatted;
  };

  const navItems = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/cloud-types", label: "CLOUD TYPES", icon: Cloud },
    { href: "/weather-systems", label: "WEATHER SYSTEMS", icon: Zap },
    { href: "/fun-facts", label: "16-BIT TAKES", icon: BookOpen },
    { href: "/games", label: "GAMES", icon: Gamepad2 },
    { href: "/about", label: "ABOUT", icon: Info }
  ]

  return (
    <nav className={`w-full border-b-4 pixel-border relative z-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        {/* Logo/Brand with Weather Data - TOP LEFT */}
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 border-2 flex items-center justify-center animate-pulse ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
            <span className="text-black font-bold text-sm">16</span>
          </div>
          <h1 className={`text-lg font-bold uppercase tracking-wider font-mono ${themeClasses.text} ${themeClasses.glow}`} style={{ 
            fontFamily: "monospace",
            fontSize: "clamp(14px, 2vw, 18px)"
          }}>
            BIT WEATHER{weatherLocation && weatherTemperature ? ` ${formatHeaderLocation(weatherLocation)} ${Math.round(weatherTemperature)}°${weatherUnit === '°F' ? 'F' : 'C'}` : ''}
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
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        {/* Mobile Logo with Weather Data */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`w-6 h-6 border-2 flex items-center justify-center ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
            <span className="text-black font-bold text-xs">16</span>
          </div>
          <h1 className={`text-xs font-bold uppercase tracking-wider font-mono ${themeClasses.text} truncate`} style={{ 
            fontFamily: "monospace",
            fontSize: "clamp(10px, 2.5vw, 12px)"
          }}>
            BIT WEATHER{weatherLocation && weatherTemperature ? ` ${formatHeaderLocation(weatherLocation)} ${Math.round(weatherTemperature)}°${weatherUnit === '°F' ? 'F' : 'C'}` : ''}
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
          </div>
        </div>
      )}
    </nav>
  )
} 
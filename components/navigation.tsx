"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Cloud, Zap, BookOpen, Gamepad2, Info, Home, ChevronDown } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useUser, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs'

/**
 * 16-Bit Weather Education Platform Navigation
 * 
 * Features authentic retro styling with pixel-perfect borders
 * and three-theme support (Dark/Miami/Tron) for the expanded education platform
 */
export default function Navigation() {
  const { user, isLoaded } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const navItems = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/cloud-types", label: "CLOUD TYPES", icon: Cloud },
    { href: "/weather-systems", label: "WEATHER SYSTEMS", icon: Zap },
    { href: "/fun-facts", label: "16-BIT TAKES", icon: BookOpen },
    { href: "/games", label: "GAMES", icon: Gamepad2 },
    { href: "/about", label: "ABOUT", icon: Info }
  ]

  return (
    <nav className="bg-black border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-cyan-400 font-mono text-lg hover:text-cyan-300 transition-colors">
              16-BIT WEATHER
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Always visible links */}
              <Link 
                href="/about" 
                className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
              >
                About
              </Link>

              {/* Conditional links based on auth state */}
              {isLoaded && user && (
                <Link 
                  href="/weather" 
                  className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
                >
                  Weather
                </Link>
              )}

              {/* Auth buttons */}
              {isLoaded && !user ? (
                <>
                  <SignInButton mode="modal">
                    <button className="bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-4 py-2 font-mono text-sm transition-all duration-200">
                      Sign In
                    </button>
                  </SignInButton>
                  
                  <SignUpButton mode="modal">
                    <button className="bg-cyan-500 text-black hover:bg-cyan-400 px-4 py-2 font-mono text-sm transition-all duration-200">
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              ) : isLoaded && user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-cyan-600 font-mono text-sm">
                    Hello, {user.firstName || user.username || 'User'}
                  </span>
                  <SignOutButton>
                    <button className="bg-transparent border border-red-500 text-red-400 hover:bg-red-500 hover:text-black px-4 py-2 font-mono text-sm transition-all duration-200">
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                // Loading state
                <div className="text-cyan-600 font-mono text-sm">
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-cyan-400 hover:text-cyan-300 p-2"
            >
              <span className="font-mono text-sm">
                {isMenuOpen ? 'CLOSE' : 'MENU'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-cyan-500">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/about" 
                className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              {isLoaded && user && (
                <Link 
                  href="/weather" 
                  className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Weather
                </Link>
              )}

              {isLoaded && !user ? (
                <div className="space-y-2 pt-2">
                  <SignInButton mode="modal">
                    <button 
                      className="w-full bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-4 py-2 font-mono text-sm transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  
                  <SignUpButton mode="modal">
                    <button 
                      className="w-full bg-cyan-500 text-black hover:bg-cyan-400 px-4 py-2 font-mono text-sm transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              ) : isLoaded && user ? (
                <div className="pt-2 space-y-2">
                  <div className="text-cyan-600 font-mono text-sm px-3 py-2">
                    Hello, {user.firstName || user.username || 'User'}
                  </div>
                  <SignOutButton>
                    <button 
                      className="w-full bg-transparent border border-red-500 text-red-400 hover:bg-red-500 hover:text-black px-4 py-2 font-mono text-sm transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                <div className="text-cyan-600 font-mono text-sm px-3 py-2">
                  Loading...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 
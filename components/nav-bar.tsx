"use client"

import Link from "next/link"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * 16-Bit Weather Education Platform Navigation Bar
 * 
 * Features authentic retro styling with pixel-perfect borders
 * and three-theme support (Dark/Miami/Tron) for the expanded education platform
 */
export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

              <Link 
                href="/games" 
                className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
              >
                Games
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth buttons - will be handled by Clerk components */}
              <Link 
                href="/sign-in" 
                className="bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-4 py-2 font-mono text-sm transition-all duration-200"
              >
                Sign In
              </Link>
              
              <Link 
                href="/sign-up" 
                className="bg-cyan-500 text-black hover:bg-cyan-400 px-4 py-2 font-mono text-sm transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
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

              <Link 
                href="/games" 
                className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Games
              </Link>

              <div className="space-y-2 pt-2">
                <Link 
                  href="/sign-in"
                  className="w-full bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-4 py-2 font-mono text-sm transition-all duration-200 block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                
                <Link 
                  href="/sign-up"
                  className="w-full bg-cyan-500 text-black hover:bg-cyan-400 px-4 py-2 font-mono text-sm transition-all duration-200 block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 
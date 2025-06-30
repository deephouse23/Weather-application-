"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth, SignOutButton, useUser } from "@clerk/nextjs"

/**
 * 16-Bit Weather Education Platform Navigation Bar
 * 
 * Production-style navigation with horizontal layout
 */
export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()

  return (
    <nav className="bg-black border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-cyan-400 font-mono text-lg hover:text-cyan-300 transition-colors">
              16 BIT WEATHER
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
              >
                HOME
              </Link>

              <Link 
                href="/cloud-types" 
                className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
              >
                CLOUD TYPES
              </Link>

              <Link 
                href="/weather-systems" 
                className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
              >
                WEATHER SYSTEMS
              </Link>

              <Link 
                href="/fun-facts" 
                className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
              >
                16-BIT TAKES
              </Link>

              <Link 
                href="/games" 
                className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
              >
                GAMES
              </Link>

              <Link 
                href="/about" 
                className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors"
              >
                ABOUT
              </Link>
            </div>
          </div>

          {/* Auth Section - Right Side */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="relative">
                <button
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                  className="text-cyan-400 hover:text-cyan-300 px-3 py-2 font-mono text-sm transition-colors cursor-pointer"
                >
                  {user?.firstName || 'User'}
                </button>
                
                {/* Hover dropdown */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-gray-900 border-2 border-cyan-500 shadow-lg z-50"
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-cyan-400 font-mono text-sm border-b border-cyan-500/30">
                        {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
                      </div>
                      <SignOutButton>
                        <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/20 font-mono text-sm transition-colors">
                          Sign Out
                        </button>
                      </SignOutButton>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/sign-in" 
                className="bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-4 py-2 font-mono text-sm transition-all duration-200"
              >
                Sign In
              </Link>
            )}

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
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-cyan-500">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                HOME
              </Link>

              <Link 
                href="/cloud-types" 
                className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                CLOUD TYPES
              </Link>

              <Link 
                href="/weather-systems" 
                className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                WEATHER SYSTEMS
              </Link>

              <Link 
                href="/fun-facts" 
                className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                16-BIT TAKES
              </Link>

              <Link 
                href="/games" 
                className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                GAMES
              </Link>

              <Link 
                href="/about" 
                className="text-cyan-400 hover:text-cyan-300 block px-3 py-2 font-mono text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ABOUT
              </Link>

              <div className="space-y-2 pt-2">
                {isSignedIn ? (
                  <div className="space-y-2">
                    <div className="text-cyan-400 font-mono text-sm text-center py-2">
                      {user?.firstName || 'User'}
                    </div>
                    <div className="text-cyan-600 font-mono text-xs text-center">
                      {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
                    </div>
                    <SignOutButton>
                      <button className="w-full text-center px-4 py-2 text-red-400 hover:bg-red-900/20 font-mono text-sm transition-colors">
                        Sign Out
                      </button>
                    </SignOutButton>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      href="/sign-in" 
                      className="block text-center bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-4 py-2 font-mono text-sm transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    
                    <Link 
                      href="/sign-up" 
                      className="block text-center bg-cyan-500 text-black hover:bg-cyan-400 px-4 py-2 font-mono text-sm transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 
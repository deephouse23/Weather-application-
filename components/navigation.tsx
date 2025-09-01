'use client'

/**
 * 16-Bit Weather Platform - BETA v0.3.2
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


import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Cloud, Zap, BookOpen, Gamepad2, Info, Home, Newspaper, Thermometer, Map, ChevronDown, GraduationCap } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"

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
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { theme } = useTheme()

  // Use centralized theme system
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation')

  // Helper function to format location for header display
  const formatHeaderLocation = (location: string): string => {
    // Handle all location formats and ensure consistent state abbreviations
    // Examples: "Dublin, CA, US" → "Dublin, CA"
    //          "San Ramon, California, US" → "San Ramon, CA"
    //          "New York, NY, US" → "New York, NY"
    
    const parts = location.split(', ');
    
    // Comprehensive state name to abbreviation mapping
    const stateAbbreviations: { [key: string]: string } = {
      // Full state names to abbreviations
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
      // Already abbreviated states (pass through)
      'AL': 'AL', 'AK': 'AK', 'AZ': 'AZ', 'AR': 'AR', 'CA': 'CA', 'CO': 'CO', 'CT': 'CT',
      'DE': 'DE', 'FL': 'FL', 'GA': 'GA', 'HI': 'HI', 'ID': 'ID', 'IL': 'IL', 'IN': 'IN',
      'IA': 'IA', 'KS': 'KS', 'KY': 'KY', 'LA': 'LA', 'ME': 'ME', 'MD': 'MD', 'MA': 'MA',
      'MI': 'MI', 'MN': 'MN', 'MS': 'MS', 'MO': 'MO', 'MT': 'MT', 'NE': 'NE', 'NV': 'NV',
      'NH': 'NH', 'NJ': 'NJ', 'NM': 'NM', 'NY': 'NY', 'NC': 'NC', 'ND': 'ND', 'OH': 'OH',
      'OK': 'OK', 'OR': 'OR', 'PA': 'PA', 'RI': 'RI', 'SC': 'SC', 'SD': 'SD', 'TN': 'TN',
      'TX': 'TX', 'UT': 'UT', 'VT': 'VT', 'VA': 'VA', 'WA': 'WA', 'WV': 'WV', 'WI': 'WI', 'WY': 'WY'
    };

    // City-to-state fallback mapping for when API doesn't provide state
    const cityStateMap: { [key: string]: string } = {
      'Dublin': 'CA', 'San Ramon': 'CA', 'Beverly Hills': 'CA', 'Los Angeles': 'CA',
      'San Francisco': 'CA', 'San Diego': 'CA', 'Sacramento': 'CA', 'San Jose': 'CA',
      'Oakland': 'CA', 'Fresno': 'CA', 'Anaheim': 'CA', 'Bakersfield': 'CA', 'Long Beach': 'CA',
      'New York': 'NY', 'Brooklyn': 'NY', 'Buffalo': 'NY', 'Rochester': 'NY', 'Syracuse': 'NY',
      'Chicago': 'IL', 'Houston': 'TX', 'Phoenix': 'AZ', 'Philadelphia': 'PA', 'San Antonio': 'TX',
      'Dallas': 'TX', 'Austin': 'TX', 'Jacksonville': 'FL', 'Fort Worth': 'TX', 'Columbus': 'OH',
      'Charlotte': 'NC', 'Seattle': 'WA', 'Denver': 'CO', 'Boston': 'MA', 'Nashville': 'TN',
      'Baltimore': 'MD', 'Portland': 'OR', 'Las Vegas': 'NV', 'Atlanta': 'GA',
      'Detroit': 'MI', 'Memphis': 'TN', 'Louisville': 'KY', 'Milwaukee': 'WI', 'Albuquerque': 'NM',
      'Tucson': 'AZ', 'Mesa': 'AZ', 'Kansas City': 'MO', 'Virginia Beach': 'VA',
      'Omaha': 'NE', 'Colorado Springs': 'CO', 'Raleigh': 'NC', 'Miami Beach': 'FL'
    };
    
    if (parts.length >= 3) {
      // Format: "City, State, Country" -> "City, StateAbbrev"
      const city = parts[0];
      const state = parts[1];
      const abbreviatedState = stateAbbreviations[state] || state; // Convert to abbreviation or keep as-is
      return `${city}, ${abbreviatedState}`;
    } else if (parts.length === 2) {
      // Format: "City, Country" -> need to determine state
      const city = parts[0];
      const country = parts[1];
      
      if (country === 'US') {
        const state = cityStateMap[city] || 'US'; // Fallback to country if city not found
        return state === 'US' ? city : `${city}, ${state}`;
      } else {
        // Non-US locations, just return city
        return city;
      }
    } else {
      // Single part, just return as-is
      return parts[0];
    }
  };


  const mainNavItems = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/map", label: "MAP", icon: Map },
    { href: "/extremes", label: "EXTREMES", icon: Thermometer },
    { href: "/news", label: "NEWS", icon: Newspaper },
    { href: "/games", label: "GAMES", icon: Gamepad2 },
    { href: "/about", label: "ABOUT", icon: Info }
  ]

  const educationItems = [
    { href: "/cloud-types", label: "CLOUD TYPES", icon: Cloud },
    { href: "/weather-systems", label: "WEATHER SYSTEMS", icon: Zap },
    { href: "/fun-facts", label: "16-BIT TAKES", icon: BookOpen }
  ]

  // Check if any education item is currently active
  const isEducationActive = educationItems.some(item => pathname === item.href)

  return (
    <>
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
            BIT WEATHER{weatherLocation && weatherTemperature ? (
              <>
                <span className={`font-extrabold text-xl ml-2 ${themeClasses.accentText}`} style={{ 
                  fontSize: "clamp(16px, 2.5vw, 22px)",
                  textShadow: "0 0 8px currentColor"
                }}>
                  {formatHeaderLocation(weatherLocation)} {Math.round(weatherTemperature)}°{weatherUnit === '°F' ? 'F' : 'C'}
                </span>
              </>
            ) : ''}
          </h1>
        </div>

        {/* Main Navigation Links - TOP CENTER */}
        <div className="flex items-center space-x-4">
          {mainNavItems.slice(0, 3).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] ${
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

          {/* Education Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsEducationDropdownOpen(true)}
            onMouseLeave={() => setIsEducationDropdownOpen(false)}
          >
            <button
              className={`flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] ${
                isEducationActive 
                  ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`
                  : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span className="whitespace-nowrap">EDU ▾</span>
            </button>

            {/* Education Dropdown Menu */}
            {isEducationDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-48 border-2 z-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
                {educationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 border-b-2 last:border-b-0 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 w-full ${
                        isActive 
                          ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                          : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {mainNavItems.slice(3).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 min-w-[80px] ${
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
          <h1 className={`text-xs font-bold uppercase tracking-wider font-mono ${themeClasses.text}`} style={{ 
            fontFamily: "monospace",
            fontSize: "clamp(10px, 2.5vw, 12px)"
          }}>
            BIT WEATHER{weatherLocation && weatherTemperature ? (
              <>
                <span className={`font-extrabold ml-1 ${themeClasses.accentText}`} style={{ 
                  fontSize: "clamp(11px, 3vw, 14px)",
                  textShadow: "0 0 4px currentColor"
                }}>
                  {formatHeaderLocation(weatherLocation)} {Math.round(weatherTemperature)}°{weatherUnit === '°F' ? 'F' : 'C'}
                </span>
              </>
            ) : ''}
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
            {/* Main nav items before Education */}
            {mainNavItems.slice(0, 3).map((item) => {
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

            {/* Education Dropdown Toggle */}
            <button
              onClick={() => setIsEducationDropdownOpen(!isEducationDropdownOpen)}
              className={`flex items-center justify-between p-3 border-2 text-sm font-mono font-bold uppercase tracking-wider w-full h-[48px] ${
                isEducationActive 
                  ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                  : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text}`
              }`}
            >
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-4 h-4" />
                <span>EDUCATION</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isEducationDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Education Submenu */}
            {isEducationDropdownOpen && (
              <div className="ml-4 space-y-2">
                {educationItems.map((item) => {
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
            )}

            {/* Remaining main nav items after Education */}
            {mainNavItems.slice(3).map((item) => {
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
    </>
  )
}
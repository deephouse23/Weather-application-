'use client'

/**
 * 16-Bit Weather Platform - BETA v0.3.3
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
import { Menu, X, Gamepad2, Info, Home, Newspaper, Thermometer, Map, GraduationCap } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"
import AuthButton from "@/components/auth/auth-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    { href: "/map", label: "RADAR", icon: Map },
    { href: "/learn", label: "LEARN", icon: GraduationCap },
    { href: "/extremes", label: "EXTREMES", icon: Thermometer },
    { href: "/news", label: "NEWS", icon: Newspaper },
    { href: "/games", label: "GAMES", icon: Gamepad2 },
    { href: "/about", label: "ABOUT", icon: Info }
  ]

  return (
    <>
      <nav className={cn(
        "w-full sticky top-0 z-50 border-b backdrop-blur-md shadow-sm transition-all duration-300",
        "bg-background/80 border-border"
      )}>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          {/* Logo/Brand with Weather Data - TOP LEFT */}
          {/* Logo/Brand with Weather Data - TOP LEFT */}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span className="font-mono">16-BIT WEATHER</span>
              {weatherLocation && weatherTemperature ? (
                <span className="text-sm font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">
                  {formatHeaderLocation(weatherLocation)} <span className="text-foreground font-bold">{Math.round(weatherTemperature)}°{weatherUnit === '°F' ? 'F' : 'C'}</span>
                </span>
              ) : ''}
            </h1>
          </div>

          {/* Main Navigation Links - TOP CENTER */}
          <div className="flex items-center space-x-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "font-medium transition-all duration-200",
                    isActive && "font-bold shadow-sm"
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Auth Button - TOP RIGHT */}
          <div className="flex items-center space-x-2">
            <AuthButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between px-4 py-3">
          {/* Mobile Logo with Weather Data */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <h1 className="text-lg font-extrabold tracking-tight text-foreground truncate flex flex-col leading-tight">
              <span className="font-mono">16-BIT WEATHER</span>
              {weatherLocation && weatherTemperature && (
                <span className="text-xs font-normal text-muted-foreground">
                  {Math.round(weatherTemperature)}°{weatherUnit === '°F' ? 'F' : 'C'} in {formatHeaderLocation(weatherLocation).split(',')[0]}
                </span>
              )}
            </h1>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="ml-2"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b bg-background/95 backdrop-blur-lg shadow-xl animate-in slide-in-from-top-2">
            <div className="p-4 space-y-2">
              {/* All main nav items */}
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    size="lg"
                    asChild
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href={item.href}>
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}

              {/* Mobile Auth */}
              <div className="flex items-center justify-start pt-4 border-t mt-4">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
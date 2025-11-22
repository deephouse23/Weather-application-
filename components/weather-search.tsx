"use client"

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


import { useState, useEffect } from "react"
import { Search, Loader2, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// APP_CONSTANTS removed - no longer needed for themes
import CityAutocomplete from "./city-autocomplete"
import { type CityData } from "@/lib/city-database"
import { useLocationContext } from "./location-context"
import { useTheme } from "./theme-provider"
import { Input } from "@/components/ui/input"

interface WeatherSearchProps {
  onSearch: (location: string) => void;
  onLocationSearch?: () => void;
  isLoading: boolean;
  error?: string;
  isDisabled?: boolean;
  rateLimitError?: string;
  hideLocationButton?: boolean;
  isAutoDetecting?: boolean;
}

export default function WeatherSearch({
  onSearch,
  onLocationSearch,
  isLoading,
  error,
  isDisabled = false,
  rateLimitError,
  hideLocationButton = false,
  isAutoDetecting = false
}: WeatherSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const { locationInput, setLocationInput, clearLocationState } = useLocationContext()
  const { theme } = useTheme()

  // Sync with location context - prevent unnecessary loops and preserve user input
  useEffect(() => {
    // Only sync from context to local state if:
    // 1. The context value is different from local state
    // 2. The user isn't currently typing (to avoid interfering with active input)
    if (locationInput !== searchTerm && document.activeElement?.tagName !== 'INPUT') {
      setSearchTerm(locationInput)
    }
  }, [locationInput, searchTerm])

  // Semantic dark theme classes using CSS variables
  const themeClasses = {
    background: 'bg-weather-bg-elev',
    cardBg: 'bg-weather-bg-elev',
    borderColor: 'border-weather-border',
    text: 'text-weather-text',
    headerText: 'text-weather-primary',
    secondaryText: 'text-weather-text',
    accentText: 'text-weather-primary',
    successText: 'text-weather-ok',
    glow: 'glow',
    specialBorder: 'border-weather-primary',
    buttonHover: 'hover:bg-weather-primary hover:text-weather-bg',
    placeholderText: 'placeholder-weather-muted',
    hoverBorder: 'hover:border-weather-primary',
    buttonBg: 'bg-weather-bg-elev',
    buttonBorder: 'border-weather-border',
    buttonText: 'text-weather-text',
    errorBg: 'bg-weather-danger/10',
    errorText: 'text-weather-danger',
    warningText: 'text-weather-warn'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim() && !isLoading && !isDisabled) {
      onSearch(searchTerm.trim())
      setShowAutocomplete(false)
    }
  }

  const handleCitySelect = (city: CityData) => {
    setSearchTerm(city.searchTerm)
    setLocationInput(city.searchTerm)
    onSearch(city.searchTerm)
    setShowAutocomplete(false)

    // Ensure the input remains focusable and editable after selection
    // This helps maintain natural editing behavior
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.focus();
        // Position cursor at the end of the input
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 0);
  }

  const handleInputChange = (value: string) => {
    // Update local state immediately for responsive UI
    setSearchTerm(value)

    // Update context state (debounced behavior handled by context)
    setLocationInput(value)

    // Show autocomplete when typing, hide when empty
    setShowAutocomplete(value.length >= 2)
  }

  const handleLocationClick = () => {
    if (!isLoading && !isDisabled && onLocationSearch) {
      onLocationSearch()
    }
  }

  const handleClearClick = () => {
    if (!isLoading && !isDisabled) {
      setSearchTerm("")
      setLocationInput("")
      setShowAutocomplete(false)
      clearLocationState()
    }
  }

  // Handle input key events to ensure natural editing behavior
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // For backspace, delete, and other editing keys, ensure they work naturally
    // Don't interfere with these keys - let the browser handle them
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      // Let the browser handle these keys naturally
      return;
    }

    // For Enter key, submit the form if we don't have autocomplete visible
    if (e.key === 'Enter' && !showAutocomplete) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  // Determine if controls should be disabled
  const controlsDisabled = isLoading || isDisabled

  return (
    <div className="mb-4 sm:mb-6 w-full max-w-2xl mx-auto">
      {/* Simple format hints - Mobile responsive */}
      <div className="mb-2 sm:mb-3 text-center px-2">
        <div className={`text-xs sm:text-sm ${themeClasses.secondaryText} uppercase tracking-wider break-words`}>
          <span className="hidden sm:inline">► 90210 • NEW YORK, NY • LONDON, UK ◄</span>
          <span className="sm:hidden">► ZIP • CITY, STATE • CITY, COUNTRY ◄</span>
        </div>
      </div>

      {/* Search Form - Mobile optimized */}
      <form onSubmit={handleSubmit} className="mb-3 sm:mb-4 px-2 sm:px-0">
        <div className="relative">
          <Input
            type="text"
            data-testid="location-search-input"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => searchTerm.length >= 2 && setShowAutocomplete(true)}
            placeholder={isDisabled ? "Rate limit reached..." : "ZIP, City+State, or City+Country..."}
            disabled={controlsDisabled}
            aria-label="Search location"
            className={`w-full pr-10 sm:pr-12 ${themeClasses.cardBg} border-2 ${theme === 'miami' ? 'border-weather-accent' : themeClasses.borderColor} ${themeClasses.text} ${themeClasses.placeholderText} 
                     font-mono text-sm sm:text-base uppercase tracking-wider ${theme === 'miami' ? 'hover:border-weather-accent' : themeClasses.hoverBorder} 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed pixel-font ${theme === 'miami' ? 'border-weather-accent' : themeClasses.specialBorder}
                     min-h-[48px] touch-manipulation py-3 sm:py-4 px-3 sm:px-4`}
            style={{
              imageRendering: "pixelated",
              fontFamily: "monospace",
              fontSize: "clamp(12px, 3vw, 16px)"
            }}
          />
          <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Clear button */}
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearClick}
                disabled={controlsDisabled}
                className={cn(
                  "h-10 w-10",
                  themeClasses.secondaryText,
                  "hover:text-red-400"
                )}
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* Search button */}
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={controlsDisabled || !searchTerm.trim()}
              className={cn(
                "h-10 w-10",
                themeClasses.secondaryText,
                "hover:text-[#ffe66d]",
                themeClasses.glow
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>

          {/* City Autocomplete */}
          <CityAutocomplete
            query={searchTerm}
            onSelect={handleCitySelect}
            onQueryChange={setSearchTerm}
            theme={theme}
            isVisible={showAutocomplete}
            onVisibilityChange={setShowAutocomplete}
          />
        </div>
      </form>

      {/* Location Button - Mobile friendly - Hidden when auto-location is enabled */}
      {!hideLocationButton && onLocationSearch && (
        <div className="flex justify-center px-2 sm:px-0">
          <Button
            onClick={handleLocationClick}
            disabled={controlsDisabled}
            variant="outline"
            className={cn(
              "w-full sm:w-auto max-w-xs min-h-[48px]",
              "text-xs sm:text-sm uppercase tracking-wider font-mono",
              "border-2",
              theme === 'miami' && "border-weather-accent hover:bg-weather-accent hover:text-weather-bg"
            )}
          >
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span>
              {isAutoDetecting ? "LOCATING..." : isLoading ? "LOADING..." : isDisabled ? "RATE LIMITED" : "USE MY LOCATION"}
            </span>
          </Button>
        </div>
      )}

      {/* Error Display - Mobile responsive */}
      {(error || rateLimitError) && (
        <div className={`p-3 sm:p-4 mx-2 sm:mx-0 ${themeClasses.errorBg} border ${themeClasses.errorText} 
                      text-xs sm:text-sm text-center pixel-font ${theme === 'miami' ? 'border-weather-accent' : themeClasses.specialBorder}`}>
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <span>⚠</span>
            <span className="uppercase tracking-wider break-words">{error || rateLimitError}</span>
          </div>

          {/* Interactive suggestions based on error type - Mobile optimized */}
          {error?.includes('not found') && (
            <div className="space-y-2">
              <div className={`text-xs ${themeClasses.secondaryText} normal-case`}>
                Try these format examples:
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <Button
                  variant="link"
                  onClick={() => setSearchTerm("90210")}
                  className={cn(
                    "justify-start h-auto py-2",
                    themeClasses.warningText,
                    "hover:text-[#00d4ff]",
                    themeClasses.glow
                  )}
                  disabled={isDisabled}
                >
                  ► ZIP: 90210
                </Button>
                <Button
                  variant="link"
                  onClick={() => setSearchTerm("New York, NY")}
                  className={cn(
                    "justify-start h-auto py-2",
                    themeClasses.warningText,
                    "hover:text-[#00d4ff]",
                    themeClasses.glow
                  )}
                  disabled={isDisabled}
                >
                  ► City + State: New York, NY
                </Button>
                <Button
                  variant="link"
                  onClick={() => setSearchTerm("London, UK")}
                  className={cn(
                    "justify-start h-auto py-2",
                    themeClasses.warningText,
                    "hover:text-[#00d4ff]",
                    themeClasses.glow
                  )}
                  disabled={isDisabled}
                >
                  ► City + Country: London, UK
                </Button>
              </div>
            </div>
          )}

          {error?.includes('API key') && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2 break-words`}>
              Please configure your OpenWeatherMap API key in the environment variables.
            </div>
          )}

          {error?.includes('location') && error?.includes('denied') && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2 break-words`}>
              Location access was denied. Try searching manually or enable location permissions.
            </div>
          )}

          {(error?.includes('network') || error?.includes('fetch')) && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2 break-words`}>
              Network error. Please check your internet connection and try again.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
"use client"

import { useState } from "react"
import { Search, Loader2, MapPin } from "lucide-react"
import { ThemeType, APP_CONSTANTS } from "@/lib/utils"
import CityAutocomplete from "./city-autocomplete"
import { type CityData } from "@/lib/city-database"

interface WeatherSearchProps {
  onSearch: (location: string) => void;
  onLocationSearch?: () => void;
  isLoading: boolean;
  error?: string;
  isDisabled?: boolean;
  rateLimitError?: string;
  theme?: ThemeType;
  hideLocationButton?: boolean;
}

export default function WeatherSearch({ 
  onSearch, 
  onLocationSearch,
  isLoading, 
  error, 
  isDisabled = false,
  rateLimitError,
  theme = APP_CONSTANTS.THEMES.DARK,
  hideLocationButton = false
}: WeatherSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)

  // Local theme classes function
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-[#0f0f0f]',
          cardBg: 'bg-[#0f0f0f]',
          borderColor: 'border-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          headerText: 'text-[#00d4ff]',
          secondaryText: 'text-[#e0e0e0]',
          accentText: 'text-[#00d4ff]',
          successText: 'text-[#00ff00]',
          glow: 'glow-dark',
          specialBorder: 'border-[#00d4ff]',
          buttonHover: 'hover:bg-[#00d4ff] hover:text-[#0f0f0f]',
          placeholderText: 'placeholder-[#a0a0a0]',
          hoverBorder: 'hover:border-[#00d4ff]',
          buttonBg: 'bg-[#0f0f0f]',
          buttonBorder: 'border-[#00d4ff]',
          buttonText: 'text-[#e0e0e0]',
          errorBg: 'bg-[#1a0f0f]',
          errorText: 'text-[#ff4444]',
          warningText: 'text-[#ff6b6b]'
        }
      case 'miami':
        return {
          background: 'bg-[#0a0025]',
          cardBg: 'bg-[#0a0025]',
          borderColor: 'border-[#ff1493]',
          text: 'text-[#00ffff]',
          headerText: 'text-[#ff1493]',
          secondaryText: 'text-[#00ffff]',
          accentText: 'text-[#ff1493]',
          successText: 'text-[#00ff00]',
          glow: 'glow-miami',
          specialBorder: 'border-[#ff1493]',
          buttonHover: 'hover:bg-[#ff1493] hover:text-[#0a0025]',
          placeholderText: 'placeholder-[#b0d4f1]',
          hoverBorder: 'hover:border-[#ff1493]',
          buttonBg: 'bg-[#0a0025]',
          buttonBorder: 'border-[#ff1493]',
          buttonText: 'text-[#00ffff]',
          errorBg: 'bg-[#1a0025]',
          errorText: 'text-[#ff1493]',
          warningText: 'text-[#ff69b4]'
        }
      case 'tron':
        return {
          background: 'bg-black',
          cardBg: 'bg-black',
          borderColor: 'border-[#00FFFF]',
          text: 'text-white',
          headerText: 'text-[#00FFFF]',
          secondaryText: 'text-[#00FFFF]',
          accentText: 'text-[#00FFFF]',
          successText: 'text-[#00ff00]',
          glow: 'glow-tron',
          specialBorder: 'border-[#00FFFF]',
          buttonHover: 'hover:bg-[#00FFFF] hover:text-black',
          placeholderText: 'placeholder-[#88CCFF]',
          hoverBorder: 'hover:border-[#00FFFF]',
          buttonBg: 'bg-black',
          buttonBorder: 'border-[#00FFFF]',
          buttonText: 'text-white',
          errorBg: 'bg-[#001111]',
          errorText: 'text-[#FF4444]',
          warningText: 'text-[#FF6B6B]'
        }
    }
  }

  const themeClasses = getThemeClasses(theme)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim() && !isLoading && !isDisabled) {
      onSearch(searchTerm.trim())
      setShowAutocomplete(false)
    }
  }

  const handleCitySelect = (city: CityData) => {
    setSearchTerm(city.searchTerm)
    onSearch(city.searchTerm)
    setShowAutocomplete(false)
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    // Show autocomplete when typing, hide when empty
    setShowAutocomplete(value.length >= 2)
  }

  const handleLocationClick = () => {
    if (!isLoading && !isDisabled && onLocationSearch) {
      onLocationSearch()
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
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowAutocomplete(true)}
            placeholder={isDisabled ? "Rate limit reached..." : "ZIP, City+State, or City+Country..."}
            disabled={controlsDisabled}
            className={`w-full px-3 sm:px-4 py-3 sm:py-4 pr-10 sm:pr-12 ${themeClasses.cardBg} border-2 ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.placeholderText} 
                     font-mono text-sm sm:text-base uppercase tracking-wider focus:outline-none ${themeClasses.hoverBorder} 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed pixel-font ${themeClasses.specialBorder}
                     min-h-[48px] touch-manipulation`}
            style={{
              imageRendering: "pixelated",
              fontFamily: "monospace",
              fontSize: "clamp(12px, 3vw, 16px)" // Responsive font size
            }}
          />
          <button
            type="submit"
            disabled={controlsDisabled || !searchTerm.trim()}
            className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-2 ${themeClasses.secondaryText} hover:text-[#ffe66d] 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.glow}
                     min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

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
          <button
            onClick={handleLocationClick}
            disabled={controlsDisabled}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 ${themeClasses.buttonBg} border ${themeClasses.buttonBorder} 
                     ${themeClasses.buttonText} ${themeClasses.buttonHover} transition-all duration-200 
                     text-xs sm:text-sm uppercase tracking-wider font-mono disabled:opacity-50 
                     disabled:cursor-not-allowed pixel-font ${themeClasses.specialBorder}
                     min-h-[48px] touch-manipulation w-full sm:w-auto max-w-xs`}
              style={{
                imageRendering: "pixelated",
                fontFamily: "monospace",
                fontSize: "clamp(11px, 2.5vw, 14px)" // Responsive font size
              }}
          >
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="break-words text-center">
              {isLoading ? "LOADING..." : isDisabled ? "RATE LIMITED" : "USE MY LOCATION"}
            </span>
          </button>
        </div>
      )}

      {/* Error Display - Mobile responsive */}
      {(error || rateLimitError) && (
        <div className={`p-3 sm:p-4 mx-2 sm:mx-0 ${themeClasses.errorBg} border ${themeClasses.errorText} 
                      text-xs sm:text-sm text-center pixel-font ${themeClasses.specialBorder}`}>
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
                <button 
                  onClick={() => setSearchTerm("90210")}
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.glow}
                           py-2 px-3 touch-manipulation min-h-[44px] text-left`}
                  disabled={isDisabled}
                >
                  ► ZIP: 90210
                </button>
                <button 
                  onClick={() => setSearchTerm("New York, NY")}
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.glow}
                           py-2 px-3 touch-manipulation min-h-[44px] text-left`}
                  disabled={isDisabled}
                >
                  ► City + State: New York, NY
                </button>
                <button 
                  onClick={() => setSearchTerm("London, UK")}
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.glow}
                           py-2 px-3 touch-manipulation min-h-[44px] text-left`}
                  disabled={isDisabled}
                >
                  ► City + Country: London, UK
                </button>
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
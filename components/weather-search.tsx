"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { useDebounce } from "@/lib/hooks"
import { ThemeType, themeUtils, APP_CONSTANTS } from "@/lib/utils"

interface WeatherSearchProps {
  onSearch: (location: string) => void;
  onLocationSearch: () => void;
  isLoading: boolean;
  error?: string;
  isDisabled?: boolean;
  rateLimitError?: string;
  theme?: ThemeType;
}

export default function WeatherSearch({ 
  onSearch, 
  onLocationSearch, 
  isLoading, 
  error, 
  isDisabled = false,
  rateLimitError,
  theme = APP_CONSTANTS.THEMES.DARK
}: WeatherSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounce<string>((value) => {
    if (value.trim() && !isLoading && !isDisabled) {
      onSearch(value.trim())
    }
  }, 300)

  // Use centralized theme classes
  const themeClasses = themeUtils.getThemeClasses(theme)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim() && !isLoading && !isDisabled) {
      onSearch(searchTerm.trim())
    }
  }

  const handleLocationClick = () => {
    if (!isLoading && !isDisabled) {
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
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setDebouncedSearchTerm(e.target.value)
            }}
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
        </div>
      </form>

      {/* Location Button - Mobile friendly */}
      <div className="flex items-center justify-center mb-3 sm:mb-4 px-2 sm:px-0">
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

      {/* Error Display - Mobile responsive */}
      {(error && !rateLimitError) && (
        <div className={`p-3 sm:p-4 mx-2 sm:mx-0 ${themeClasses.errorBg} border ${themeClasses.errorText} 
                      text-xs sm:text-sm text-center pixel-font ${themeClasses.specialBorder}`}>
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <span>⚠</span>
            <span className="uppercase tracking-wider break-words">{error}</span>
          </div>
          
          {/* Interactive suggestions based on error type - Mobile optimized */}
          {error.includes('not found') && (
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
          
          {error.includes('API key') && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2 break-words`}>
              Please configure your OpenWeatherMap API key in the environment variables.
            </div>
          )}
          
          {error.includes('location') && error.includes('denied') && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2 break-words`}>
              Location access was denied. Try searching manually or enable location permissions.
            </div>
          )}
          
          {(error.includes('network') || error.includes('fetch')) && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2 break-words`}>
              Network error. Please check your internet connection and try again.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
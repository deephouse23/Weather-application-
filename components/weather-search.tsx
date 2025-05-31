"use client"

import { useState } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"

interface WeatherSearchProps {
  onSearch: (location: string) => void;
  onLocationSearch: () => void;
  isLoading: boolean;
  error?: string;
  isDisabled?: boolean;
  rateLimitError?: string;
  isDarkMode?: boolean;
}

export default function WeatherSearch({ 
  onSearch, 
  onLocationSearch, 
  isLoading, 
  error, 
  isDisabled = false,
  rateLimitError,
  isDarkMode = true
}: WeatherSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

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

  // Theme-based color classes
  const themeClasses = {
    cardBg: isDarkMode ? 'bg-[#16213e]' : 'bg-[#1a0033]',
    text: isDarkMode ? 'text-[#e0e0e0]' : 'text-[#00ffff]',
    placeholderText: isDarkMode ? 'placeholder-[#4ecdc4]' : 'placeholder-[#00ffff]',
    secondaryText: isDarkMode ? 'text-[#4ecdc4]' : 'text-[#00ffff]',
    borderColor: isDarkMode ? 'border-[#00d4ff]' : 'border-[#ff1493]', // Hot pink borders
    hoverBorder: isDarkMode ? 'focus:border-[#ffe66d]' : 'focus:border-[#00ffff]',
    buttonBg: isDarkMode ? 'bg-[#16213e]' : 'bg-[#2d1b69]',
    buttonBorder: isDarkMode ? 'border-[#4ecdc4]' : 'border-[#00ffff]',
    buttonText: isDarkMode ? 'text-[#4ecdc4]' : 'text-[#00ffff]',
    buttonHover: isDarkMode ? 'hover:bg-[#4ecdc4] hover:text-[#1a1a2e]' : 'hover:bg-[#00ffff] hover:text-[#1a0033]',
    errorBg: isDarkMode ? 'bg-[#1a1a2e]' : 'bg-[#4a0e4e]',
    errorText: 'text-[#ff6b6b]',
    warningText: isDarkMode ? 'text-[#ffe66d]' : 'text-[#ff1493]',
    miamiViceGlow: isDarkMode ? '' : 'drop-shadow-[0_0_8px_#ff1493]',
    miamiViceBorder: isDarkMode ? '' : 'shadow-[0_0_15px_#ff1493]',
  }

  return (
    <div className="mb-6">
      {/* Simple format hints */}
      <div className="mb-3 text-center">
        <div className={`text-xs ${themeClasses.secondaryText} uppercase tracking-wider`}>
          ► 90210 • NEW YORK, NY • LONDON, UK ◄
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isDisabled ? "Rate limit reached..." : "ZIP, City+State, or City+Country..."}
            disabled={controlsDisabled}
            className={`w-full px-4 py-3 pr-12 ${themeClasses.cardBg} border-2 ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.placeholderText} 
                     font-mono text-sm uppercase tracking-wider focus:outline-none ${themeClasses.hoverBorder} 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed pixel-font ${!isDarkMode ? themeClasses.miamiViceBorder : ''}`}
            style={{
              imageRendering: "pixelated",
              fontFamily: "monospace",
              ...(isDarkMode ? {} : {
                background: 'linear-gradient(135deg, #1a0033, #2d1b69)',
                boxShadow: '0 0 20px #ff1493, inset 0 0 15px rgba(255, 20, 147, 0.1)',
                textShadow: '0 0 8px #00ffff'
              })
            }}
          />
          <button
            type="submit"
            disabled={controlsDisabled || !searchTerm.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 ${isDarkMode ? 'text-[#00d4ff] hover:text-[#ffe66d]' : 'text-[#00ffff] hover:text-[#ff1493]'} 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${!isDarkMode ? 'drop-shadow-[0_0_8px_#00ffff]' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Location Button */}
      <div className="flex items-center justify-center mb-4">
        <button
          onClick={handleLocationClick}
          disabled={controlsDisabled}
          className={`flex items-center gap-2 px-4 py-2 ${themeClasses.buttonBg} border ${themeClasses.buttonBorder} 
                   ${themeClasses.buttonText} ${themeClasses.buttonHover} transition-all duration-200 
                   text-sm uppercase tracking-wider font-mono disabled:opacity-50 
                   disabled:cursor-not-allowed pixel-font ${!isDarkMode ? themeClasses.miamiViceBorder : ''}`}
          style={{
            imageRendering: "pixelated",
            fontFamily: "monospace",
            ...(isDarkMode ? {} : {
              background: 'linear-gradient(135deg, #2d1b69, #4a0e4e)',
              boxShadow: '0 0 20px #00ffff, inset 0 0 15px rgba(0, 255, 255, 0.1)',
              textShadow: '0 0 8px #00ffff'
            })
          }}
        >
          <MapPin className="w-4 h-4" />
          {isLoading ? "LOADING..." : isDisabled ? "RATE LIMITED" : "USE MY LOCATION"}
        </button>
      </div>

      {/* Error Display - show regular errors but prioritize rate limit errors */}
      {(error && !rateLimitError) && (
        <div className={`p-4 ${themeClasses.errorBg} border ${themeClasses.errorText} 
                      text-sm text-center pixel-font ${!isDarkMode ? themeClasses.miamiViceBorder : ''}`} 
             style={!isDarkMode ? { 
               borderColor: '#ff6b6b',
               background: 'linear-gradient(135deg, #4a0e4e, #2d1b69)',
               boxShadow: '0 0 20px #ff6b6b, inset 0 0 15px rgba(255, 107, 107, 0.1)'
             } : { borderColor: '#ff6b6b' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span>⚠</span>
            <span className="uppercase tracking-wider">{error}</span>
          </div>
          
          {/* Interactive suggestions based on error type */}
          {error.includes('not found') && (
            <div className="space-y-2">
              <div className={`text-xs ${themeClasses.secondaryText} normal-case`}>
                Try these format examples:
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <button 
                  onClick={() => setSearchTerm("90210")}
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.miamiViceGlow}`}
                  disabled={isDisabled}
                >
                  ► ZIP: 90210
                </button>
                <button 
                  onClick={() => setSearchTerm("New York, NY")}
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.miamiViceGlow}`}
                  disabled={isDisabled}
                >
                  ► City + State: New York, NY
                </button>
                <button 
                  onClick={() => setSearchTerm("London, UK")}
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.miamiViceGlow}`}
                  disabled={isDisabled}
                >
                  ► City + Country: London, UK
                </button>
              </div>
            </div>
          )}
          
          {error.includes('API key') && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2`}>
              Please configure your OpenWeatherMap API key in the environment variables.
            </div>
          )}
          
          {error.includes('location') && error.includes('denied') && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2`}>
              Location access was denied. Try searching manually or enable location permissions.
            </div>
          )}
          
          {error.includes('network') || error.includes('fetch') && (
            <div className={`text-xs ${themeClasses.secondaryText} normal-case mt-2`}>
              Network error. Please check your internet connection and try again.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
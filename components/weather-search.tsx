"use client"

import { useState } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"

// Theme types
type ThemeType = 'dark' | 'miami' | 'tron';

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
  theme = 'dark'
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

  // Enhanced theme-based color classes for three themes
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          cardBg: 'bg-[#16213e]',
          text: 'text-[#e0e0e0]',
          placeholderText: 'placeholder-[#4ecdc4]',
          secondaryText: 'text-[#4ecdc4]',
          borderColor: 'border-[#00d4ff]',
          hoverBorder: 'focus:border-[#ffe66d]',
          buttonBg: 'bg-[#16213e]',
          buttonBorder: 'border-[#4ecdc4]',
          buttonText: 'text-[#4ecdc4]',
          buttonHover: 'hover:bg-[#4ecdc4] hover:text-[#1a1a2e]',
          errorBg: 'bg-[#1a1a2e]',
          errorText: 'text-[#ff6b6b]',
          warningText: 'text-[#ffe66d]',
          glow: '',
          specialBorder: '',
          inputStyle: {},
          buttonStyle: {}
        }
      case 'miami':
        return {
          cardBg: 'bg-[#1a0033]',
          text: 'text-[#00ffff]',
          placeholderText: 'placeholder-[#00ffff]',
          secondaryText: 'text-[#00ffff]',
          borderColor: 'border-[#ff1493]',
          hoverBorder: 'focus:border-[#00ffff]',
          buttonBg: 'bg-[#2d1b69]',
          buttonBorder: 'border-[#ff1493]',
          buttonText: 'text-[#00ffff]',
          buttonHover: 'hover:bg-[#ff1493] hover:text-[#1a0033]',
          errorBg: 'bg-[#4a0e4e]',
          errorText: 'text-[#ff6b6b]',
          warningText: 'text-[#ff1493]',
          glow: 'drop-shadow-[0_0_8px_#ff1493]',
          specialBorder: 'shadow-[0_0_15px_#ff1493]',
          inputStyle: {
            background: 'linear-gradient(135deg, #1a0033, #2d1b69)',
            boxShadow: '0 0 20px #ff1493, inset 0 0 15px rgba(255, 20, 147, 0.1)',
            textShadow: '0 0 8px #00ffff'
          },
          buttonStyle: {
            background: 'linear-gradient(135deg, #2d1b69, #4a0e4e)',
            boxShadow: '0 0 20px #ff1493, inset 0 0 15px rgba(255, 20, 147, 0.1)',
            textShadow: '0 0 8px #00ffff'
          }
        }
      case 'tron':
        return {
          cardBg: 'bg-[#000000]',
          text: 'text-[#FFFFFF]',
          placeholderText: 'placeholder-[#88CCFF]',
          secondaryText: 'text-[#00FFFF]',
          borderColor: 'border-[#00FFFF]',
          hoverBorder: 'focus:border-[#00FFFF]',
          buttonBg: 'bg-[#000000]',
          buttonBorder: 'border-[#00FFFF]',
          buttonText: 'text-[#00FFFF]',
          buttonHover: 'hover:bg-[#00FFFF] hover:text-[#000000]',
          errorBg: 'bg-[#000000]',
          errorText: 'text-[#FF1744]',
          warningText: 'text-[#00FFFF]',
          glow: 'drop-shadow-[0_0_15px_#00FFFF]',
          specialBorder: 'shadow-[0_0_20px_#00FFFF]',
          inputStyle: {
            background: 'linear-gradient(135deg, #000000, #001111)',
            boxShadow: '0 0 25px #00FFFF, inset 0 0 20px rgba(0, 255, 255, 0.1)',
            textShadow: '0 0 10px #00FFFF'
          },
          buttonStyle: {
            background: 'linear-gradient(135deg, #000000, #001111)',
            boxShadow: '0 0 25px #00FFFF, inset 0 0 20px rgba(0, 255, 255, 0.1)',
            textShadow: '0 0 10px #00FFFF'
          }
        }
    }
  }

  const themeClasses = getThemeClasses(theme)

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
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed pixel-font ${themeClasses.specialBorder}`}
            style={{
              imageRendering: "pixelated",
              fontFamily: "monospace",
              ...themeClasses.inputStyle
            }}
          />
          <button
            type="submit"
            disabled={controlsDisabled || !searchTerm.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 ${themeClasses.secondaryText} hover:text-[#ffe66d] 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.glow}`}
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
                   disabled:cursor-not-allowed pixel-font ${themeClasses.specialBorder}`}
          style={{
            imageRendering: "pixelated",
            fontFamily: "monospace",
            ...themeClasses.buttonStyle
          }}
        >
          <MapPin className="w-4 h-4" />
          {isLoading ? "LOADING..." : isDisabled ? "RATE LIMITED" : "USE MY LOCATION"}
        </button>
      </div>

      {/* Error Display - show regular errors but prioritize rate limit errors */}
      {(error && !rateLimitError) && (
        <div className={`p-4 ${themeClasses.errorBg} border ${themeClasses.errorText} 
                      text-sm text-center pixel-font ${themeClasses.specialBorder}`} 
             style={{ 
               borderColor: theme === 'tron' ? '#FF6600' : '#ff6b6b',
               ...themeClasses.buttonStyle
             }}>
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
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.glow}`}
                  disabled={isDisabled}
                >
                  ► ZIP: 90210
                </button>
                <button 
                  onClick={() => setSearchTerm("New York, NY")}
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.glow}`}
                  disabled={isDisabled}
                >
                  ► City + State: New York, NY
                </button>
                <button 
                  onClick={() => setSearchTerm("London, UK")}
                  className={`${themeClasses.warningText} hover:text-[#00d4ff] transition-colors cursor-pointer underline ${themeClasses.glow}`}
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
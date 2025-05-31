"use client"

import { useState } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"

interface WeatherSearchProps {
  onSearch: (location: string) => void;
  onLocationSearch: () => void;
  isLoading: boolean;
  error?: string;
}

export default function WeatherSearch({ onSearch, onLocationSearch, isLoading, error }: WeatherSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim() && !isLoading) {
      onSearch(searchTerm.trim())
    }
  }

  const handleLocationClick = () => {
    if (!isLoading) {
      onLocationSearch()
    }
  }

  return (
    <div className="mb-6">
      {/* Simple format hints */}
      <div className="mb-3 text-center">
        <div className="text-xs text-[#4ecdc4] uppercase tracking-wider">
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
            placeholder="ZIP, City+State, or City+Country..."
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 bg-[#16213e] border-2 border-[#00d4ff] text-[#e0e0e0] placeholder-[#4ecdc4] 
                     font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-[#ffe66d] 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed pixel-font"
            style={{
              imageRendering: "pixelated",
              fontFamily: "monospace",
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-[#00d4ff] 
                     hover:text-[#ffe66d] transition-colors duration-200 disabled:opacity-50 
                     disabled:cursor-not-allowed"
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
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#16213e] border border-[#4ecdc4] 
                   text-[#4ecdc4] hover:bg-[#4ecdc4] hover:text-[#1a1a2e] transition-all duration-200 
                   text-sm uppercase tracking-wider font-mono disabled:opacity-50 
                   disabled:cursor-not-allowed pixel-font"
          style={{
            imageRendering: "pixelated",
            fontFamily: "monospace",
          }}
        >
          <MapPin className="w-4 h-4" />
          {isLoading ? "LOADING..." : "USE MY LOCATION"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-[#1a1a2e] border border-[#ff6b6b] text-[#ff6b6b] 
                      text-sm text-center pixel-font">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span>⚠</span>
            <span className="uppercase tracking-wider">{error}</span>
          </div>
          
          {/* Interactive suggestions based on error type */}
          {error.includes('not found') && (
            <div className="space-y-2">
              <div className="text-xs text-[#4ecdc4] normal-case">
                Try these format examples:
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <button 
                  onClick={() => setSearchTerm("90210")}
                  className="text-[#ffe66d] hover:text-[#00d4ff] transition-colors cursor-pointer underline"
                >
                  ► ZIP: 90210
                </button>
                <button 
                  onClick={() => setSearchTerm("New York, NY")}
                  className="text-[#ffe66d] hover:text-[#00d4ff] transition-colors cursor-pointer underline"
                >
                  ► City + State: New York, NY
                </button>
                <button 
                  onClick={() => setSearchTerm("London, UK")}
                  className="text-[#ffe66d] hover:text-[#00d4ff] transition-colors cursor-pointer underline"
                >
                  ► City + Country: London, UK
                </button>
              </div>
            </div>
          )}
          
          {error.includes('API key') && (
            <div className="text-xs text-[#4ecdc4] normal-case mt-2">
              Please configure your OpenWeatherMap API key in the environment variables.
            </div>
          )}
          
          {error.includes('location') && error.includes('denied') && (
            <div className="text-xs text-[#4ecdc4] normal-case mt-2">
              Location access was denied. Try searching manually or enable location permissions.
            </div>
          )}
          
          {error.includes('network') || error.includes('fetch') && (
            <div className="text-xs text-[#4ecdc4] normal-case mt-2">
              Network error. Please check your internet connection and try again.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
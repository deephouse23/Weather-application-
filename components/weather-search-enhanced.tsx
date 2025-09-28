"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * Enhanced version with shadcn/ui components and toast notifications
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
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { toastService } from "@/lib/toast-service"
import CityAutocomplete from "./city-autocomplete"
import { type CityData } from "@/lib/city-database"
import { useLocationContext } from "./location-context"
import { useTheme } from "./theme-provider"

interface WeatherSearchEnhancedProps {
  onSearch: (location: string) => void;
  onLocationSearch?: () => void;
  isLoading: boolean;
  error?: string;
  isDisabled?: boolean;
  rateLimitError?: string;
  hideLocationButton?: boolean;
}

export default function WeatherSearchEnhanced({ 
  onSearch, 
  onLocationSearch,
  isLoading, 
  error, 
  isDisabled = false,
  rateLimitError,
  hideLocationButton = false
}: WeatherSearchEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const { locationInput, setLocationInput, clearLocationState } = useLocationContext()
  const { theme } = useTheme()

  // Sync with location context
  useEffect(() => {
    if (locationInput !== searchTerm && document.activeElement?.tagName !== 'INPUT') {
      setSearchTerm(locationInput)
    }
  }, [locationInput, searchTerm])

  // Show toast notifications for errors
  useEffect(() => {
    if (error) {
      if (error.includes('not found')) {
        toastService.locationNotFound(searchTerm)
      } else if (error.includes('network') || error.includes('fetch')) {
        toastService.networkError()
      } else {
        toastService.error(error)
      }
    }
    
    if (rateLimitError) {
      toastService.rateLimited()
    }
  }, [error, rateLimitError, searchTerm])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim() && !isLoading && !isDisabled) {
      onSearch(searchTerm.trim())
      setShowAutocomplete(false)
      toastService.info(`Searching weather for ${searchTerm.trim()}...`)
    }
  }

  const handleCitySelect = (city: CityData) => {
    setSearchTerm(city.searchTerm)
    setLocationInput(city.searchTerm)
    onSearch(city.searchTerm)
    setShowAutocomplete(false)
    toastService.info(`Loading weather for ${city.searchTerm}...`)
    
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 0);
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    setLocationInput(value)
    setShowAutocomplete(value.length >= 2)
  }

  const handleLocationClick = () => {
    if (!isLoading && !isDisabled && onLocationSearch) {
      toastService.info("Detecting your location...")
      onLocationSearch()
    }
  }

  const handleClearClick = () => {
    if (!isLoading && !isDisabled) {
      setSearchTerm("")
      setLocationInput("")
      setShowAutocomplete(false)
      clearLocationState()
      toastService.info("Search cleared")
    }
  }

  const controlsDisabled = isLoading || isDisabled

  return (
    <div className="mb-4 sm:mb-6 w-full max-w-2xl mx-auto space-y-4">
      {/* Format hints */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-muted-foreground font-mono uppercase tracking-wider">
          <span className="hidden sm:inline">► ZIP • CITY, STATE • CITY, COUNTRY ◄</span>
          <span className="sm:hidden">► 90210 • NYC, NY • LONDON, UK ◄</span>
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowAutocomplete(true)}
            placeholder={isDisabled ? "Rate limit reached..." : "Enter location..."}
            disabled={controlsDisabled}
            className={cn(
              "pr-20 font-mono uppercase tracking-wider",
              "min-h-[48px] text-center sm:text-left"
            )}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Clear button */}
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearClick}
                disabled={controlsDisabled}
                className="h-8 w-8 hover:text-red-400"
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
              className="h-8 w-8 hover:text-primary"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
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

        {/* Location Button */}
        {!hideLocationButton && onLocationSearch && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleLocationClick}
              disabled={controlsDisabled}
              className={cn(
                "w-full sm:w-auto font-mono uppercase tracking-wider",
                "min-h-[48px] border-2"
              )}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {isLoading ? "DETECTING..." : isDisabled ? "RATE LIMITED" : "USE MY LOCATION"}
            </Button>
          </div>
        )}
      </form>

      {/* Error Display */}
      {(error || rateLimitError) && (
        <Alert variant="destructive" className="border-2">
          <AlertDescription className="font-mono">
            <div className="flex items-center gap-2 mb-2">
              <span>⚠️</span>
              <span className="uppercase tracking-wider">
                {error || rateLimitError}
              </span>
            </div>
            
            {/* Error suggestions */}
            {error?.includes('not found') && (
              <div className="space-y-2 mt-3">
                <p className="text-xs normal-case">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="link"
                    size="sm"
                    onClick={() => handleInputChange("90210")}
                    className="h-auto p-1 text-xs"
                    disabled={isDisabled}
                  >
                    90210
                  </Button>
                  <Button 
                    variant="link"
                    size="sm"
                    onClick={() => handleInputChange("New York, NY")}
                    className="h-auto p-1 text-xs"
                    disabled={isDisabled}
                  >
                    New York, NY
                  </Button>
                  <Button 
                    variant="link"
                    size="sm"
                    onClick={() => handleInputChange("London, UK")}
                    className="h-auto p-1 text-xs"
                    disabled={isDisabled}
                  >
                    London, UK
                  </Button>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
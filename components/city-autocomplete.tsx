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


import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { searchCities, getCityDisplayName, getCityPageSlug, type CityData } from "@/lib/city-database"
import { ThemeType } from "@/lib/theme-config"

interface CityAutocompleteProps {
  query: string;
  onSelect: (city: CityData) => void;
  onQueryChange: (query: string) => void;
  theme?: ThemeType;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

export default function CityAutocomplete({
  query,
  onSelect,
  onQueryChange,
  theme = 'dark',
  isVisible,
  onVisibilityChange
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'miami':
        return {
          dropdown: "bg-[#0a0025] border-[#ff1493] text-[#00ffff]",
          item: "hover:bg-[#ff1493] hover:text-[#0a0025]",
          selectedItem: "bg-[#ff1493] text-[#0a0025]",
          cityName: "text-[#00ffff]",
          location: "text-[#ff69b4]",
          pageIndicator: "text-[#ff1493]"
        };
      case 'tron':
        return {
          dropdown: "bg-black border-[#00FFFF] text-white",
          item: "hover:bg-[#00FFFF] hover:text-black",
          selectedItem: "bg-[#00FFFF] text-black",
          cityName: "text-white",
          location: "text-[#00FFFF]",
          pageIndicator: "text-[#00FFFF]"
        };
      case 'atari2600':
        return {
          dropdown: "bg-[#000000] border-[#702800] text-[#FFFFFF]",
          item: "hover:bg-[#702800] hover:text-[#E0EC9C]",
          selectedItem: "bg-[#702800] text-[#E0EC9C]",
          cityName: "text-[#FFFFFF]",
          location: "text-[#E0EC9C]",
          pageIndicator: "text-[#E0EC9C]"
        };
      case 'monochromeGreen':
        return {
          dropdown: "bg-[#0D0D0D] border-[#009900] text-[#33FF33]",
          item: "hover:bg-[#009900] hover:text-[#0D0D0D]",
          selectedItem: "bg-[#009900] text-[#0D0D0D]",
          cityName: "text-[#33FF33]",
          location: "text-[#66FF66]",
          pageIndicator: "text-[#33FF33]"
        };
      case '8bitClassic':
        return {
          dropdown: "bg-[#D3D3D3] border-[#000000] text-[#000000]",
          item: "hover:bg-[#000000] hover:text-[#D3D3D3]",
          selectedItem: "bg-[#000000] text-[#D3D3D3]",
          cityName: "text-[#000000]",
          location: "text-[#CC0000]",
          pageIndicator: "text-[#CC0000]"
        };
      case '16bitSnes':
        return {
          dropdown: "bg-[#B8B8D0] border-[#5B5B8B] text-[#2C2C3E]",
          item: "hover:bg-[#5B5B8B] hover:text-[#B8B8D0]",
          selectedItem: "bg-[#5B5B8B] text-[#B8B8D0]",
          cityName: "text-[#2C2C3E]",
          location: "text-[#FFD700]",
          pageIndicator: "text-[#FFD700]"
        };
      default: // dark
        return {
          dropdown: "bg-[#0f0f0f] border-[#00d4ff] text-[#e0e0e0]",
          item: "hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
          selectedItem: "bg-[#00d4ff] text-[#0f0f0f]",
          cityName: "text-[#e0e0e0]",
          location: "text-[#00d4ff]",
          pageIndicator: "text-[#00d4ff]"
        };
    }
  };

  const themeClasses = getThemeClasses();

  // Update suggestions when query changes
  useEffect(() => {
    if (query.length >= 2) {
      const results = searchCities(query, 4);
      setSuggestions(results);
      setSelectedIndex(-1);
      onVisibilityChange(results.length > 0);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
      onVisibilityChange(false);
    }
  }, [query, onVisibilityChange]);

  // Handle keyboard navigation - only for autocomplete-specific keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when autocomplete is visible and has suggestions
      if (!isVisible || suggestions.length === 0) return;
      
      // Only prevent default for navigation keys we specifically handle
      // Let all other keys (including backspace, delete, typing) pass through naturally
      switch (e.key) {
        case 'ArrowDown':
          // Only prevent default if we're actually in the search input
          const activeElement = document.activeElement as HTMLInputElement;
          if (activeElement && (activeElement.type === 'text' || activeElement.tagName === 'INPUT')) {
            e.preventDefault();
            setSelectedIndex(prev => 
              prev < suggestions.length - 1 ? prev + 1 : prev
            );
          }
          break;
        case 'ArrowUp':
          // Only prevent default if we're actually in the search input
          const activeElementUp = document.activeElement as HTMLInputElement;
          if (activeElementUp && (activeElementUp.type === 'text' || activeElementUp.tagName === 'INPUT')) {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          }
          break;
        case 'Enter':
          // Only handle Enter if we have a selected item and we're in the search input
          const activeElementEnter = document.activeElement as HTMLInputElement;
          if (activeElementEnter && (activeElementEnter.type === 'text' || activeElementEnter.tagName === 'INPUT') &&
              selectedIndex >= 0 && selectedIndex < suggestions.length) {
            e.preventDefault();
            handleCitySelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          // Always handle Escape to close autocomplete
          e.preventDefault();
          onVisibilityChange(false);
          setSelectedIndex(-1);
          break;
        // Explicitly DO NOT handle any other keys - let them pass through to the input
        default:
          // Do nothing - let the browser handle all other keys naturally
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onVisibilityChange]);

  // Handle city selection
  const handleCitySelect = (city: CityData) => {
    if (city.hasPage && city.pageSlug) {
      // Navigate to dedicated page
      router.push(`/weather/${city.pageSlug}`);
    } else {
      // Use search term for weather API
      onSelect(city);
    }
    onVisibilityChange(false);
    setSelectedIndex(-1);
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onVisibilityChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onVisibilityChange]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 border-2 rounded shadow-lg",
        "font-mono text-sm max-h-64 overflow-y-auto",
        themeClasses.dropdown
      )}
      style={{ 
        boxShadow: `0 4px 20px ${themeClasses.dropdown.includes('[#00d4ff]') ? '#00d4ff33' : 
                    themeClasses.dropdown.includes('[#ff1493]') ? '#ff149333' : 
                    '#00FFFF33'}` 
      }}
    >
      {suggestions.map((city, index) => (
        <div
          key={`${city.name}-${city.country}-${city.state || ''}`}
          className={cn(
            "px-4 py-3 cursor-pointer transition-colors duration-150",
            "flex items-center justify-between border-b border-opacity-20",
            "border-gray-600 last:border-b-0",
            selectedIndex === index ? themeClasses.selectedItem : themeClasses.item
          )}
          onClick={() => handleCitySelect(city)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="flex-1 min-w-0">
            <div className={cn(
              "font-semibold text-sm truncate",
              selectedIndex === index ? themeClasses.selectedItem.split(' ')[1] : themeClasses.cityName
            )}>
              {city.name}
            </div>
            <div className={cn(
              "text-xs opacity-80 truncate",
              selectedIndex === index ? themeClasses.selectedItem.split(' ')[1] : themeClasses.location
            )}>
              {city.country === "US" && city.state ? city.state : city.country}
            </div>
          </div>
          
          {/* Page indicator */}
          {city.hasPage && (
            <div className={cn(
              "ml-2 text-xs font-bold flex-shrink-0",
              selectedIndex === index ? themeClasses.selectedItem.split(' ')[1] : themeClasses.pageIndicator
            )}>
              PAGE
            </div>
          )}
        </div>
      ))}
      
      {/* Footer hint */}
      <div className={cn(
        "px-4 py-2 text-xs opacity-60 border-t border-gray-600 border-opacity-20",
        "text-center bg-opacity-50",
        themeClasses.location
      )}>
        ↑↓ Navigate • Enter Select • Esc Close
      </div>
    </div>
  );
}
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { searchCities, getCityDisplayName, getCityPageSlug, type CityData } from "@/lib/city-database"
import { ThemeType } from "@/lib/utils"

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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleCitySelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onVisibilityChange(false);
          setSelectedIndex(-1);
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
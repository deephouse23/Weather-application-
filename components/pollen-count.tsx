import React from 'react';
import { cn } from "@/lib/utils";

interface PollenCountProps {
  pollen: {
    tree: number;
    grass: number;
    weed: number;
  };
  season: string;
  theme: 'dark' | 'miami' | 'tron';
}

const PollenCount: React.FC<PollenCountProps> = ({ pollen, season, theme }) => {
  const getPollenLevel = (count: number): { text: string; color: string } => {
    if (count <= 2.4) return { text: 'Low', color: 'bg-green-500' };
    if (count <= 4.8) return { text: 'Moderate', color: 'bg-yellow-500' };
    if (count <= 7.2) return { text: 'High', color: 'bg-orange-500' };
    if (count <= 9.6) return { text: 'Very High', color: 'bg-red-500' };
    return { text: 'Extreme', color: 'bg-red-700' };
  };

  const getSeasonalRecommendation = (season: string): string => {
    switch (season.toLowerCase()) {
      case 'spring':
        return 'Tree pollen is high. Consider keeping windows closed and using air filters.';
      case 'summer':
        return 'Grass pollen is prevalent. Shower after outdoor activities.';
      case 'fall':
        return 'Weed pollen is high. Limit outdoor activities on windy days.';
      case 'winter':
        return 'Pollen levels are generally low. Indoor allergens may be more concerning.';
      default:
        return 'Check local pollen forecasts for current conditions.';
    }
  };

  const themeClasses = {
    dark: {
      background: 'bg-gray-800',
      text: 'text-gray-100',
      border: 'border-gray-700',
      header: 'text-cyan-400'
    },
    miami: {
      background: 'bg-pink-900',
      text: 'text-pink-100',
      border: 'border-pink-700',
      header: 'text-yellow-300'
    },
    tron: {
      background: 'bg-black',
      text: 'text-cyan-400',
      border: 'border-cyan-500',
      header: 'text-cyan-400'
    }
  }[theme];

  return (
    <div className={cn("p-4 rounded-lg border-2", themeClasses.background, themeClasses.border)}>
      <h2 className={cn("text-xl font-bold mb-4", themeClasses.header)}>Pollen Count</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(pollen).map(([type, count]) => {
            const { text, color } = getPollenLevel(count);
            return (
              <div key={type} className={cn("p-2 rounded", themeClasses.background)}>
                <p className={cn("text-sm capitalize", themeClasses.text)}>{type}</p>
                <div className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded-full", color)} />
                  <p className={cn("text-lg font-semibold", themeClasses.text)}>{text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <h3 className={cn("text-lg font-semibold mb-2", themeClasses.header)}>Seasonal Forecast</h3>
          <p className={cn("text-sm", themeClasses.text)}>{getSeasonalRecommendation(season)}</p>
        </div>
      </div>
    </div>
  );
};

export default PollenCount; 
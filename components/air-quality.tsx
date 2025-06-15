import React from 'react';
import { cn } from "@/lib/utils";

interface AirQualityProps {
  aqi: number;
  pollution: {
    pm2_5: number;
    pm10: number;
    o3: number;
  };
  theme: 'dark' | 'miami' | 'tron';
}

const AirQuality: React.FC<AirQualityProps> = ({ aqi, pollution, theme }) => {
  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-700';
  };

  const getHealthRecommendation = (aqi: number): string => {
    if (aqi <= 50) return 'Good air quality. Enjoy outdoor activities!';
    if (aqi <= 100) return 'Moderate air quality. Sensitive individuals should limit outdoor activities.';
    if (aqi <= 150) return 'Unhealthy for sensitive groups. Limit outdoor activities.';
    if (aqi <= 200) return 'Unhealthy. Avoid outdoor activities.';
    if (aqi <= 300) return 'Very unhealthy. Stay indoors.';
    return 'Hazardous. Avoid all outdoor activities.';
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
      <h2 className={cn("text-xl font-bold mb-4", themeClasses.header)}>Air Quality</h2>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("w-8 h-8 rounded-full", getAQIColor(aqi))} />
          <span className={cn("text-lg font-semibold", themeClasses.text)}>AQI: {aqi}</span>
        </div>
        <p className={cn("text-sm", themeClasses.text)}>{getHealthRecommendation(aqi)}</p>
      </div>

      <div className="space-y-2">
        <h3 className={cn("text-lg font-semibold", themeClasses.header)}>Pollutant Levels:</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className={cn("p-2 rounded", themeClasses.background)}>
            <p className={cn("text-sm", themeClasses.text)}>PM2.5</p>
            <p className={cn("text-lg font-semibold", themeClasses.text)}>{pollution.pm2_5} μg/m³</p>
          </div>
          <div className={cn("p-2 rounded", themeClasses.background)}>
            <p className={cn("text-sm", themeClasses.text)}>PM10</p>
            <p className={cn("text-lg font-semibold", themeClasses.text)}>{pollution.pm10} μg/m³</p>
          </div>
          <div className={cn("p-2 rounded", themeClasses.background)}>
            <p className={cn("text-sm", themeClasses.text)}>O3</p>
            <p className={cn("text-lg font-semibold", themeClasses.text)}>{pollution.o3} μg/m³</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality; 
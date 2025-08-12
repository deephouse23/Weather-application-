/**
 * 16-Bit Weather Platform - BETA v0.3.32
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Air Quality utilities using EPA AQI standards
 * EPA AQI Scale: 0-500 (lower is better)
 * Reference: https://www.airnow.gov/aqi/aqi-basics/
 */

/**
 * Get color class for AQI value using EPA AQI scale (0-500, lower = better)
 */
export const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'text-green-400 font-semibold';        // Good (0-50)
  if (aqi <= 100) return 'text-yellow-400 font-semibold';      // Moderate (51-100)
  if (aqi <= 150) return 'text-orange-400 font-semibold';      // Unhealthy for Sensitive Groups (101-150)
  if (aqi <= 200) return 'text-red-400 font-semibold';         // Unhealthy (151-200)
  if (aqi <= 300) return 'text-purple-400 font-semibold';      // Very Unhealthy (201-300)
  return 'text-red-900 font-semibold';                         // Hazardous (301+)
};

/**
 * Get text description for AQI value using EPA standards
 */
export const getAQIDescription = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

/**
 * Get health recommendation for AQI value using EPA guidelines
 */
export const getAQIRecommendation = (aqi: number): string => {
  if (aqi <= 50) {
    return 'Air quality is satisfactory. Air pollution poses little or no risk.';
  }
  if (aqi <= 100) {
    return 'Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.';
  }
  if (aqi <= 150) {
    return 'Members of sensitive groups may experience health effects. General public is less likely to be affected.';
  }
  if (aqi <= 200) {
    return 'Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects.';
  }
  if (aqi <= 300) {
    return 'Health alert: everyone may experience more serious health effects.';
  }
  return 'Health warning of emergency conditions. The entire population is likely to be affected.';
};

/**
 * Get color class for pollen category level
 */
export const getPollenColor = (category: string | number): string => {
  const cat = typeof category === 'string' ? category.toLowerCase() : category.toString();
  
  if (cat === 'no data' || cat === '0') return 'text-gray-400 font-semibold';
  if (cat === 'low' || cat === '1' || cat === '2') return 'text-green-400 font-semibold';
  if (cat === 'moderate' || cat === '3' || cat === '4' || cat === '5') return 'text-yellow-400 font-semibold';
  if (cat === 'high' || cat === '6' || cat === '7' || cat === '8') return 'text-orange-400 font-semibold';
  if (cat === 'very high' || cat === '9' || cat === '10') return 'text-red-400 font-semibold';
  
  return 'text-white font-semibold'; // Default fallback
};

/**
 * Calculate AQI indicator position for color bar (0-100%)
 * For EPA scale visualization (0-500)
 */
export const getAQIIndicatorPosition = (aqi: number): number => {
  // EPA scale goes to 500
  // We need to map the position correctly for the visual bar
  if (aqi <= 50) {
    // 0-50 takes up first 10% of bar
    return (aqi / 50) * 10;
  } else if (aqi <= 100) {
    // 51-100 takes up next 10% of bar (10-20%)
    return 10 + ((aqi - 50) / 50) * 10;
  } else if (aqi <= 150) {
    // 101-150 takes up next 10% of bar (20-30%)
    return 20 + ((aqi - 100) / 50) * 10;
  } else if (aqi <= 200) {
    // 151-200 takes up next 10% of bar (30-40%)
    return 30 + ((aqi - 150) / 50) * 10;
  } else if (aqi <= 300) {
    // 201-300 takes up next 20% of bar (40-60%)
    return 40 + ((aqi - 200) / 100) * 20;
  } else {
    // 301-500 takes up last 40% of bar (60-100%)
    return 60 + Math.min(((aqi - 300) / 200) * 40, 40);
  }
};

/**
 * AQI scale labels for display (EPA scale)
 */
export const AQI_SCALE_LABELS = ['0', '50', '100', '150', '200', '300', '500'];

/**
 * AQI color segments for the visual bar (EPA standard colors)
 */
export const AQI_COLOR_SEGMENTS = [
  { color: 'bg-green-500', width: '10%', label: 'Good (0-50)' },
  { color: 'bg-yellow-400', width: '10%', label: 'Moderate (51-100)' },
  { color: 'bg-orange-500', width: '10%', label: 'USG (101-150)' },
  { color: 'bg-red-500', width: '10%', label: 'Unhealthy (151-200)' },
  { color: 'bg-purple-600', width: '20%', label: 'Very Unhealthy (201-300)' },
  { color: 'bg-red-900', width: '40%', label: 'Hazardous (301-500)' }
];
/**
 * Air Quality and Pollen Utility Functions
 * Shared utilities for consistent AQI and pollen data handling across the application
 */

/**
 * Get color class for AQI value using Google Universal AQI scale (0-100, higher = better)
 */
export const getAQIColor = (aqi: number): string => {
  if (aqi >= 80) return 'text-green-400 font-semibold';      // Excellent
  if (aqi >= 60) return 'text-green-400 font-semibold';      // Good  
  if (aqi >= 40) return 'text-yellow-400 font-semibold';     // Moderate
  if (aqi >= 20) return 'text-orange-400 font-semibold';     // Low
  if (aqi >= 1) return 'text-red-400 font-semibold';         // Poor
  return 'text-red-600 font-semibold';                       // Critical (0)
};

/**
 * Get text description for AQI value
 */
export const getAQIDescription = (aqi: number): string => {
  if (aqi >= 80) return 'Excellent';
  if (aqi >= 60) return 'Good';
  if (aqi >= 40) return 'Moderate';
  if (aqi >= 20) return 'Low';
  if (aqi >= 1) return 'Poor';
  return 'Critical';
};

/**
 * Get health recommendation for AQI value
 */
export const getAQIRecommendation = (aqi: number): string => {
  if (aqi >= 80) return 'Excellent air quality. Perfect for all outdoor activities.';
  if (aqi >= 60) return 'Good air quality. Great for outdoor activities.';
  if (aqi >= 40) return 'Moderate air quality. Generally acceptable for most people.';
  if (aqi >= 20) return 'Low air quality. Consider limiting prolonged outdoor exertion.';
  if (aqi >= 1) return 'Poor air quality. Avoid outdoor activities.';
  return 'Critical air quality. Stay indoors.';
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
 */
export const getAQIIndicatorPosition = (aqi: number): number => {
  return Math.min(Math.max((aqi / 250) * 100, 0), 100);
};

/**
 * AQI scale labels for display
 */
export const AQI_SCALE_LABELS = ['0', '50', '100', '150', '200', '250+'];

/**
 * AQI color segments for the visual bar
 */
export const AQI_COLOR_SEGMENTS = [
  { color: 'bg-green-500', width: '20%', label: 'Excellent (80-100)' },
  { color: 'bg-yellow-400', width: '20%', label: 'Good (60-79)' },
  { color: 'bg-orange-500', width: '20%', label: 'Moderate (40-59)' },
  { color: 'bg-red-500', width: '20%', label: 'Low (20-39)' },
  { color: 'bg-purple-600', width: '20%', label: 'Poor (1-19)' }
];
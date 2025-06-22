/**
 * ⚠️ DEVELOPMENT-ONLY WEATHER API UTILITY - NEVER USE IN PRODUCTION ⚠️
 * 
 * This file provides a development-only version of the weather API that uses
 * hardcoded API keys for local debugging purposes.
 * 
 * USAGE:
 * 1. Only import this file in development
 * 2. Replace with proper environment variables for production
 * 3. Delete this file before deploying to production
 * 
 * SECURITY WARNING:
 * - Contains hardcoded API keys
 * - Only for local development
 * - Never commit to version control
 * - Delete after debugging
 */

import { WeatherData } from './types';
import { fetchWeatherData as originalFetchWeatherData, fetchWeatherByLocation as originalFetchWeatherByLocation } from './weather-api';

// Import debug configuration (this file is ignored by git)
let DEBUG_API_KEY: string;
let debugConfig: any;

try {
  const debugModule = require('../local-dev-config');
  DEBUG_API_KEY = debugModule.DEBUG_API_KEY;
  debugConfig = debugModule.DEBUG_CONFIG;
} catch (error) {
  console.error('❌ Debug configuration not found. Please create local-dev-config.ts with your API key.');
  DEBUG_API_KEY = '';
  debugConfig = { isDebugMode: false };
}

// ============================================================================
// 🔧 DEBUG API KEY VALIDATION
// ============================================================================
const validateDebugApiKey = (): boolean => {
  if (!DEBUG_API_KEY || DEBUG_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ DEBUG API KEY NOT CONFIGURED');
    console.error('Please update local-dev-config.ts with your actual API key');
    return false;
  }
  
  if (DEBUG_API_KEY.length < 10) {
    console.error('❌ DEBUG API KEY TOO SHORT');
    return false;
  }
  
  console.log('✅ DEBUG API KEY VALIDATED');
  return true;
};

// ============================================================================
// 🚨 SECURITY WARNINGS
// ============================================================================
const showSecurityWarnings = () => {
  console.warn(`
    🚨 SECURITY WARNING 🚨
    
    You are using the DEBUG weather API utility with hardcoded API keys.
    This should ONLY be used for local development debugging.
    
    REMEMBER TO:
    1. Delete this file before production deployment
    2. Remove any imports of this file
    3. Use proper environment variables in production
    4. Never commit API keys to version control
    
    Current debug mode: ${debugConfig?.isDebugMode || false}
    API key configured: ${DEBUG_API_KEY ? 'YES' : 'NO'}
  `);
};

// ============================================================================
// 🔧 DEBUG WEATHER API FUNCTIONS
// ============================================================================

/**
 * Debug version of fetchWeatherData that uses hardcoded API key
 * ⚠️ ONLY FOR LOCAL DEVELOPMENT - NEVER USE IN PRODUCTION ⚠️
 */
export const fetchWeatherDataDebug = async (locationInput: string): Promise<WeatherData> => {
  // Show security warnings
  showSecurityWarnings();
  
  // Validate API key
  if (!validateDebugApiKey()) {
    throw new Error('Debug API key not configured. Please update local-dev-config.ts');
  }
  
  console.log('🔧 [DEBUG] Fetching weather data for:', locationInput);
  console.log('🔧 [DEBUG] Using hardcoded API key (development only)');
  
  try {
    // Use the original function with the debug API key
    const result = await originalFetchWeatherData(locationInput, DEBUG_API_KEY);
    console.log('✅ [DEBUG] Weather data fetched successfully');
    return result;
  } catch (error) {
    console.error('❌ [DEBUG] Weather data fetch failed:', error);
    throw error;
  }
};

/**
 * Debug version of fetchWeatherByLocation that uses hardcoded API key
 * ⚠️ ONLY FOR LOCAL DEVELOPMENT - NEVER USE IN PRODUCTION ⚠️
 */
export const fetchWeatherByLocationDebug = async (coords: string): Promise<WeatherData> => {
  // Show security warnings
  showSecurityWarnings();
  
  // Validate API key
  if (!validateDebugApiKey()) {
    throw new Error('Debug API key not configured. Please update local-dev-config.ts');
  }
  
  console.log('🔧 [DEBUG] Fetching weather data by coordinates:', coords);
  console.log('🔧 [DEBUG] Using hardcoded API key (development only)');
  
  try {
    // Use the original function with the debug API key
    const result = await originalFetchWeatherByLocation(coords);
    console.log('✅ [DEBUG] Weather data by location fetched successfully');
    return result;
  } catch (error) {
    console.error('❌ [DEBUG] Weather data by location fetch failed:', error);
    throw error;
  }
};

// ============================================================================
// 🧹 CLEANUP UTILITIES
// ============================================================================

/**
 * Cleanup function to remind developers to remove debug code
 */
export const cleanupDebugCode = () => {
  console.warn(`
    🧹 CLEANUP REMINDER 🧹
    
    Before deploying to production:
    1. Delete this file: lib/weather-api-debug.ts
    2. Delete debug config: local-dev-config.ts
    3. Remove all imports of debug functions
    4. Ensure proper environment variables are set
    5. Test with production configuration
    
    Files to delete:
    - local-dev-config.ts
    - lib/weather-api-debug.ts
    
    Replace debug imports with:
    - import { fetchWeatherData } from './weather-api'
    - Use process.env.REACT_APP_OPENWEATHER_API_KEY
    - Use process.env.REACT_APP_GOOGLE_POLLEN_API_KEY
  `);
};

// Auto-run cleanup reminder on import
if (typeof window !== 'undefined') {
  cleanupDebugCode();
} 
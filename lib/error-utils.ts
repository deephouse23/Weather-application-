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

/**
 * Error Handling Utilities
 * Centralized error handling for consistent error messages and logging
 */

export enum WeatherErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  NETWORK_ERROR = 'NETWORK_ERROR',
  GEOLOCATION_ERROR = 'GEOLOCATION_ERROR',
  INVALID_LOCATION = 'INVALID_LOCATION',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface WeatherError {
  type: WeatherErrorType
  message: string
  userMessage: string
  retryable: boolean
}

/**
 * Parse and categorize weather-related errors
 */
export function parseWeatherError(error: unknown): WeatherError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // API Key errors
    if (message.includes('api key') || message.includes('unauthorized')) {
      return {
        type: WeatherErrorType.API_KEY_MISSING,
        message: error.message,
        userMessage: 'Weather service is temporarily unavailable. Please try again later.',
        retryable: false
      }
    }
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return {
        type: WeatherErrorType.NETWORK_ERROR,
        message: error.message,
        userMessage: 'Unable to connect to weather service. Please check your internet connection.',
        retryable: true
      }
    }
    
    // Location errors
    if (message.includes('location') || message.includes('not found') || message.includes('invalid')) {
      return {
        type: WeatherErrorType.INVALID_LOCATION,
        message: error.message,
        userMessage: 'Location not found. Please try a different city or zip code.',
        retryable: false
      }
    }
    
    // Rate limit errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        type: WeatherErrorType.RATE_LIMIT,
        message: error.message,
        userMessage: 'Too many requests. Please wait a moment and try again.',
        retryable: true
      }
    }
    
    // Server errors
    if (message.includes('500') || message.includes('server error')) {
      return {
        type: WeatherErrorType.SERVER_ERROR,
        message: error.message,
        userMessage: 'Weather service is experiencing issues. Please try again later.',
        retryable: true
      }
    }
    
    // Generic error with message
    return {
      type: WeatherErrorType.UNKNOWN_ERROR,
      message: error.message,
      userMessage: error.message.includes('Failed to') ? error.message : 'An unexpected error occurred.',
      retryable: true
    }
  }
  
  // Unknown error type
  return {
    type: WeatherErrorType.UNKNOWN_ERROR,
    message: 'Unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true
  }
}

/**
 * Parse geolocation errors
 */
export function parseGeolocationError(error: GeolocationPositionError): WeatherError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        type: WeatherErrorType.GEOLOCATION_ERROR,
        message: 'Geolocation permission denied',
        userMessage: 'Location access denied. Please enable location services or search manually.',
        retryable: false
      }
    case error.POSITION_UNAVAILABLE:
      return {
        type: WeatherErrorType.GEOLOCATION_ERROR,
        message: 'Geolocation position unavailable',
        userMessage: 'Unable to determine your location. Please search manually.',
        retryable: true
      }
    case error.TIMEOUT:
      return {
        type: WeatherErrorType.GEOLOCATION_ERROR,
        message: 'Geolocation timeout',
        userMessage: 'Location request timed out. Please try again or search manually.',
        retryable: true
      }
    default:
      return {
        type: WeatherErrorType.GEOLOCATION_ERROR,
        message: 'Geolocation error',
        userMessage: 'Unable to get your location. Please search manually.',
        retryable: true
      }
  }
}

/**
 * Log error with appropriate level based on type
 */
export function logWeatherError(error: WeatherError, context?: string) {
  const prefix = context ? `[${context}]` : '[Weather]'
  
  switch (error.type) {
    case WeatherErrorType.API_KEY_MISSING:
      console.error(`${prefix} Critical: ${error.message}`)
      break
    case WeatherErrorType.NETWORK_ERROR:
    case WeatherErrorType.SERVER_ERROR:
      console.warn(`${prefix} Network/Server: ${error.message}`)
      break
    case WeatherErrorType.RATE_LIMIT:
      console.warn(`${prefix} Rate Limited: ${error.message}`)
      break
    case WeatherErrorType.INVALID_LOCATION:
      console.info(`${prefix} Invalid Location: ${error.message}`)
      break
    case WeatherErrorType.GEOLOCATION_ERROR:
      console.info(`${prefix} Geolocation: ${error.message}`)
      break
    default:
      console.error(`${prefix} Unknown: ${error.message}`)
  }
}

/**
 * Enhanced error handler for async operations
 */
export async function handleAsyncWeatherOperation<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<{ data?: T; error?: WeatherError }> {
  try {
    const data = await operation()
    return { data }
  } catch (err) {
    const error = parseWeatherError(err)
    logWeatherError(error, context)
    
    if (fallback !== undefined) {
      return { data: fallback, error }
    }
    
    return { error }
  }
}
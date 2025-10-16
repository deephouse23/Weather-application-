/**
 * 16-Bit Weather Platform - News Configuration
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * News ticker configuration settings
 */

export const newsConfig = {
  // API Configuration
  api: {
    newsApiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY || '',
    newsApiUrl: 'https://newsapi.org/v2',
    weatherAlertsUrl: 'https://api.weather.gov/alerts/active',
    // Free news sources (no API key required)
    backupSources: [
      'https://api.weather.gov/alerts/active', // NOAA weather alerts
      'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss', // NASA Earth Observatory
      'https://www.foxweather.com/feeds/public/latest.rss', // FOX Weather
      'https://www.reddit.com/r/weather/.json', // Reddit weather
    ]
  },

  // Source Configuration
  sources: {
    noaa: {
      enabled: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      priority: 1, // Highest priority
    },
    nasa: {
      enabled: true,
      cacheDuration: 60 * 60 * 1000, // 1 hour
      priority: 2,
    },
    fox: {
      enabled: true,
      cacheDuration: 15 * 60 * 1000, // 15 minutes
      priority: 3,
    },
    reddit: {
      enabled: true,
      cacheDuration: 10 * 60 * 1000, // 10 minutes
      priority: 4,
    },
    newsapi: {
      enabled: true,
      cacheDuration: 15 * 60 * 1000, // 15 minutes
      priority: 5,
      requiresApiKey: true,
    }
  },

  // Cache Configuration
  cache: {
    duration: 5 * 60 * 1000, // 5 minutes in milliseconds
    maxSize: 100, // Maximum number of cached items
  },

  // Display Configuration
  display: {
    defaultCategories: ['breaking', 'weather', 'local'] as const,
    defaultMaxItems: 10,
    defaultPriority: 'all' as const,
    animationSpeed: '30s', // CSS animation duration
    autoRefreshInterval: 5 * 60 * 1000, // 5 minutes
  },

  // Rate Limiting
  rateLimit: {
    maxRequestsPerHour: 20, // Stay well under NewsAPI free tier limit
    minTimeBetweenRequests: 3000, // 3 seconds minimum between requests
  },

  // Search Terms for News
  searchTerms: {
    weather: [
      'weather',
      'storm',
      'hurricane',
      'tornado',
      'flooding',
      'drought',
      'heatwave',
      'blizzard',
      'wildfire',
      'climate'
    ],
    breaking: [
      'breaking',
      'urgent',
      'alert',
      'emergency'
    ]
  },

  // Priority Mapping
  priorityKeywords: {
    high: [
      'breaking',
      'urgent',
      'emergency',
      'severe',
      'extreme',
      'critical',
      'immediate'
    ],
    medium: [
      'warning',
      'watch',
      'advisory',
      'moderate',
      'expected'
    ],
    low: [
      'update',
      'forecast',
      'outlook',
      'minor'
    ]
  },

  // Localization (for future expansion)
  localization: {
    defaultCountry: 'us',
    supportedCountries: ['us', 'ca', 'gb', 'au'],
    defaultLanguage: 'en',
  }
};

export type NewsConfig = typeof newsConfig;
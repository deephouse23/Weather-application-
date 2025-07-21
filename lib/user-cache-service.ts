/**
 * User Cache Service
 * 
 * This service provides comprehensive caching and user preference management with:
 * - Location preferences and last location caching
 * - Weather data caching with expiration
 * - User settings persistence
 * - Cache cleanup and management
 * - Type-safe storage operations
 */

import { WeatherData } from './types';
import { LocationData } from './location-service';

export interface UserPreferences {
  lastLocation?: LocationData;
  settings: {
    units: 'metric' | 'imperial';
    theme: 'dark' | 'miami' | 'tron';
    cacheEnabled: boolean;
  };
  updatedAt: number;
}

export interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
  expiresAt: number;
  locationKey: string;
}

export interface CacheMetrics {
  totalEntries: number;
  totalSize: number; // approximate size in bytes
  oldestEntry?: number;
  newestEntry?: number;
  expiredEntries: number;
}

export class UserCacheService {
  private static instance: UserCacheService;
  private readonly STORAGE_PREFIX = 'bitweather_';
  private readonly PREFERENCES_KEY = 'user_preferences';
  private readonly WEATHER_CACHE_KEY = 'weather_cache';
  private readonly DEFAULT_WEATHER_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly DEFAULT_LOCATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB limit

  static getInstance(): UserCacheService {
    if (!UserCacheService.instance) {
      UserCacheService.instance = new UserCacheService();
    }
    return UserCacheService.instance;
  }

  private constructor() {
    this.initializeDefaults();
    this.performMaintenanceCleanup();
  }

  /**
   * Initialize default preferences if they don't exist
   */
  private initializeDefaults(): void {
    if (!this.getPreferences()) {
      const defaultPreferences: UserPreferences = {
        settings: {
          units: 'imperial',
          theme: 'dark',
          cacheEnabled: true
        },
        updatedAt: Date.now()
      };
      this.savePreferences(defaultPreferences);
    }
  }

  /**
   * Check if localStorage is available and functional
   */
  private isStorageAvailable(): boolean {
    try {
      const testKey = this.STORAGE_PREFIX + 'test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }

  /**
   * Get user preferences with type safety
   */
  getPreferences(): UserPreferences | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const stored = localStorage.getItem(this.STORAGE_PREFIX + this.PREFERENCES_KEY);
      if (stored) {
        const preferences = JSON.parse(stored) as UserPreferences;
        // Validate and migrate old data if needed
        return this.validateAndMigratePreferences(preferences);
      }
    } catch (error) {
      console.warn('Failed to get preferences:', error);
      this.handleCorruptedData(this.PREFERENCES_KEY);
    }
    return null;
  }

  /**
   * Save user preferences
   */
  savePreferences(preferences: UserPreferences): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      preferences.updatedAt = Date.now();
      const serialized = JSON.stringify(preferences);
      localStorage.setItem(this.STORAGE_PREFIX + this.PREFERENCES_KEY, serialized);
      console.log('Preferences saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      this.handleStorageQuotaExceeded();
      return false;
    }
  }

  /**
   * Update specific preference settings
   */
  updateSettings(settings: Partial<UserPreferences['settings']>): boolean {
    const preferences = this.getPreferences();
    if (!preferences) return false;

    preferences.settings = { ...preferences.settings, ...settings };
    return this.savePreferences(preferences);
  }

  /**
   * Save last location
   */
  saveLastLocation(location: LocationData): boolean {
    const preferences = this.getPreferences();
    if (!preferences) return false;

    preferences.lastLocation = location;
    return this.savePreferences(preferences);
  }

  /**
   * Get last location
   */
  getLastLocation(): LocationData | null {
    const preferences = this.getPreferences();
    return preferences?.lastLocation || null;
  }


  /**
   * Cache weather data
   */
  cacheWeatherData(locationKey: string, weatherData: WeatherData, customDuration?: number): boolean {
    if (!this.isStorageAvailable()) return false;

    const preferences = this.getPreferences();
    if (!preferences?.settings.cacheEnabled) return false;

    try {
      const duration = customDuration || this.DEFAULT_WEATHER_CACHE_DURATION;
      const cacheEntry: CachedWeatherData = {
        data: weatherData,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration,
        locationKey
      };

      const cacheKey = this.STORAGE_PREFIX + this.WEATHER_CACHE_KEY + '_' + this.sanitizeKey(locationKey);
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      
      console.log(`Weather data cached for ${locationKey}, expires in ${Math.round(duration / 1000 / 60)} minutes`);
      return true;
    } catch (error) {
      console.warn('Failed to cache weather data:', error);
      this.handleStorageQuotaExceeded();
      return false;
    }
  }

  /**
   * Get cached weather data
   */
  getCachedWeatherData(locationKey: string): WeatherData | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const cacheKey = this.STORAGE_PREFIX + this.WEATHER_CACHE_KEY + '_' + this.sanitizeKey(locationKey);
      const stored = localStorage.getItem(cacheKey);
      
      if (stored) {
        const cacheEntry: CachedWeatherData = JSON.parse(stored);
        
        // Check if cache is still valid
        if (Date.now() < cacheEntry.expiresAt) {
          console.log(`Using cached weather data for ${locationKey}`);
          return cacheEntry.data;
        } else {
          // Remove expired cache
          localStorage.removeItem(cacheKey);
          console.log(`Cached weather data expired for ${locationKey}`);
        }
      }
    } catch (error) {
      console.warn('Failed to get cached weather data:', error);
      this.handleCorruptedData(locationKey);
    }
    
    return null;
  }

  /**
   * Clear weather cache for specific location
   */
  clearWeatherCache(locationKey?: string): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      if (locationKey) {
        // Clear specific location cache
        const cacheKey = this.STORAGE_PREFIX + this.WEATHER_CACHE_KEY + '_' + this.sanitizeKey(locationKey);
        localStorage.removeItem(cacheKey);
        console.log(`Weather cache cleared for ${locationKey}`);
      } else {
        // Clear all weather cache
        const keys = Object.keys(localStorage);
        const weatherCacheKeys = keys.filter(key => 
          key.startsWith(this.STORAGE_PREFIX + this.WEATHER_CACHE_KEY)
        );
        
        weatherCacheKeys.forEach(key => localStorage.removeItem(key));
        console.log(`All weather cache cleared (${weatherCacheKeys.length} entries)`);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear weather cache:', error);
      return false;
    }
  }

  /**
   * Get cache metrics and statistics
   */
  getCacheMetrics(): CacheMetrics {
    const metrics: CacheMetrics = {
      totalEntries: 0,
      totalSize: 0,
      expiredEntries: 0
    };

    if (!this.isStorageAvailable()) return metrics;

    try {
      const keys = Object.keys(localStorage);
      const weatherCacheKeys = keys.filter(key => 
        key.startsWith(this.STORAGE_PREFIX + this.WEATHER_CACHE_KEY)
      );

      let oldestTimestamp = Date.now();
      let newestTimestamp = 0;

      weatherCacheKeys.forEach(key => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            metrics.totalSize += stored.length * 2; // Approximate bytes (UTF-16)
            metrics.totalEntries++;

            const cacheEntry: CachedWeatherData = JSON.parse(stored);
            if (cacheEntry.timestamp < oldestTimestamp) {
              oldestTimestamp = cacheEntry.timestamp;
            }
            if (cacheEntry.timestamp > newestTimestamp) {
              newestTimestamp = cacheEntry.timestamp;
            }

            if (Date.now() > cacheEntry.expiresAt) {
              metrics.expiredEntries++;
            }
          }
        } catch (error) {
          console.warn(`Corrupted cache entry: ${key}`);
          metrics.expiredEntries++;
        }
      });

      if (metrics.totalEntries > 0) {
        metrics.oldestEntry = oldestTimestamp;
        metrics.newestEntry = newestTimestamp;
      }

    } catch (error) {
      console.error('Failed to get cache metrics:', error);
    }

    return metrics;
  }

  /**
   * Perform maintenance cleanup
   */
  performMaintenanceCleanup(): void {
    if (!this.isStorageAvailable()) return;

    try {
      const metrics = this.getCacheMetrics();
      console.log('Cache metrics before cleanup:', metrics);

      // Remove expired entries
      if (metrics.expiredEntries > 0) {
        this.cleanupExpiredEntries();
      }

      // If cache is too large, remove oldest entries
      if (metrics.totalSize > this.MAX_CACHE_SIZE) {
        this.cleanupOldestEntries();
      }

      console.log('Cache maintenance completed');
    } catch (error) {
      console.error('Cache maintenance failed:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const keys = Object.keys(localStorage);
    const weatherCacheKeys = keys.filter(key => 
      key.startsWith(this.STORAGE_PREFIX + this.WEATHER_CACHE_KEY)
    );

    let removedCount = 0;

    weatherCacheKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const cacheEntry: CachedWeatherData = JSON.parse(stored);
          if (Date.now() > cacheEntry.expiresAt) {
            localStorage.removeItem(key);
            removedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key);
        removedCount++;
      }
    });

    console.log(`Removed ${removedCount} expired/corrupted cache entries`);
  }

  /**
   * Clean up oldest cache entries to reduce size
   */
  private cleanupOldestEntries(): void {
    const keys = Object.keys(localStorage);
    const weatherCacheKeys = keys.filter(key => 
      key.startsWith(this.STORAGE_PREFIX + this.WEATHER_CACHE_KEY)
    );

    const entries: Array<{ key: string; timestamp: number; size: number }> = [];

    weatherCacheKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const cacheEntry: CachedWeatherData = JSON.parse(stored);
          entries.push({
            key,
            timestamp: cacheEntry.timestamp,
            size: stored.length * 2
          });
        }
      } catch (error) {
        // Add corrupted entries for removal
        entries.push({
          key,
          timestamp: 0,
          size: 0
        });
      }
    });

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries until under size limit
    let currentSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    let removedCount = 0;

    while (currentSize > this.MAX_CACHE_SIZE && entries.length > 0) {
      const entry = entries.shift()!;
      localStorage.removeItem(entry.key);
      currentSize -= entry.size;
      removedCount++;
    }

    console.log(`Removed ${removedCount} old cache entries to reduce size`);
  }

  /**
   * Handle corrupted data by removing it
   */
  private handleCorruptedData(key: string): void {
    try {
      const fullKey = this.STORAGE_PREFIX + key;
      localStorage.removeItem(fullKey);
      console.log(`Removed corrupted data: ${key}`);
    } catch (error) {
      console.error('Failed to remove corrupted data:', error);
    }
  }

  /**
   * Handle storage quota exceeded
   */
  private handleStorageQuotaExceeded(): void {
    console.warn('Storage quota exceeded, performing emergency cleanup');
    this.cleanupOldestEntries();
    this.cleanupExpiredEntries();
  }

  /**
   * Validate and migrate old preference data
   */
  private validateAndMigratePreferences(preferences: any): UserPreferences {
    const defaultPreferences: UserPreferences = {
      settings: {
        units: 'imperial',
        theme: 'dark',
        cacheEnabled: true
      },
      updatedAt: Date.now()
    };

    // Merge with defaults to handle missing properties
    return {
      ...defaultPreferences,
      ...preferences,
      settings: {
        ...defaultPreferences.settings,
        ...preferences.settings
      }
    };
  }

  /**
   * Sanitize key for safe localStorage usage
   */
  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  }

  /**
   * Clear all user data (for privacy/reset purposes)
   */
  clearAllData(): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      const keys = Object.keys(localStorage);
      const ourKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
      
      ourKeys.forEach(key => localStorage.removeItem(key));
      
      console.log(`All user data cleared (${ourKeys.length} entries)`);
      this.initializeDefaults();
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * Export user data for backup
   */
  exportUserData(): string | null {
    try {
      const preferences = this.getPreferences();
      const metrics = this.getCacheMetrics();
      
      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        preferences,
        cacheMetrics: metrics
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export user data:', error);
      return null;
    }
  }

  /**
   * Import user data from backup (preferences only, not cache)
   */
  importUserData(data: string): boolean {
    try {
      const importData = JSON.parse(data);
      
      if (importData.preferences) {
        const validatedPreferences = this.validateAndMigratePreferences(importData.preferences);
        return this.savePreferences(validatedPreferences);
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }

  /**
   * Get location key for caching
   */
  getLocationKey(location: LocationData): string {
    return `${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}`;
  }

  /**
   * Get location key from coordinate string
   */
  getLocationKeyFromCoords(coords: string): string {
    const [lat, lon] = coords.split(',').map(parseFloat);
    return `${lat.toFixed(4)}_${lon.toFixed(4)}`;
  }
}

// Export singleton instance
export const userCacheService = UserCacheService.getInstance();
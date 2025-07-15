/**
 * Location Detection Service
 * 
 * This service provides comprehensive location detection capabilities with:
 * - Browser geolocation API with high accuracy
 * - IP-based location fallback detection
 * - Comprehensive error handling
 * - Permission management
 * - Reverse geocoding to get human-readable location names
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  displayName: string;
  source: 'geolocation' | 'ip' | 'manual';
}

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  supported: boolean;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'NETWORK_ERROR';
  message: string;
  suggestion?: string;
}

export class LocationService {
  private static instance: LocationService;
  private currentPosition: LocationData | null = null;
  private lastRequestTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check if geolocation is supported by the browser
   */
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get current permission status for geolocation
   */
  async getPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!this.isGeolocationSupported()) {
      return {
        granted: false,
        denied: false,
        prompt: false,
        supported: false
      };
    }

    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return {
          granted: permission.state === 'granted',
          denied: permission.state === 'denied',
          prompt: permission.state === 'prompt',
          supported: true
        };
      }
    } catch (error) {
      console.warn('Permissions API not available:', error);
    }

    // Fallback for browsers without permissions API
    return {
      granted: false,
      denied: false,
      prompt: true,
      supported: true
    };
  }

  /**
   * Request user's current location using browser geolocation
   */
  async getCurrentLocation(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    useCache?: boolean;
  }): Promise<LocationData> {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      useCache: true,
      ...options
    };

    // Return cached position if available and not expired
    if (defaultOptions.useCache && this.currentPosition && 
        Date.now() - this.lastRequestTime < this.CACHE_DURATION) {
      console.log('Returning cached location:', this.currentPosition);
      return this.currentPosition;
    }

    if (!this.isGeolocationSupported()) {
      throw this.createLocationError('NOT_SUPPORTED', 'Geolocation is not supported by this browser');
    }

    try {
      console.log('Requesting geolocation with options:', defaultOptions);
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: defaultOptions.enableHighAccuracy,
            timeout: defaultOptions.timeout,
            maximumAge: defaultOptions.maximumAge
          }
        );
      });

      console.log('Geolocation success:', position);

      // Get human-readable location name
      const locationData = await this.reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );

      this.currentPosition = {
        ...locationData,
        source: 'geolocation'
      };
      this.lastRequestTime = Date.now();

      return this.currentPosition;

    } catch (error: any) {
      console.error('Geolocation error:', error);
      throw this.handleGeolocationError(error);
    }
  }

  /**
   * Get location using IP-based detection as fallback
   */
  async getLocationByIP(): Promise<LocationData> {
    console.log('Attempting IP-based location detection...');
    
    try {
      // Try multiple IP geolocation services
      const services = [
        'https://ipapi.co/json/',
        'https://ipinfo.io/json',
        'https://api.ipgeolocation.io/ipgeo?apiKey=free'
      ];

      for (const serviceUrl of services) {
        try {
          console.log(`Trying IP service: ${serviceUrl}`);
          const response = await fetch(serviceUrl);
          
          if (!response.ok) {
            console.warn(`IP service failed: ${serviceUrl} - ${response.status}`);
            continue;
          }

          const data = await response.json();
          console.log(`IP service response from ${serviceUrl}:`, data);

          // Parse response based on service format
          const locationData = this.parseIPLocationResponse(data, serviceUrl);
          
          if (locationData) {
            console.log('IP-based location detected:', locationData);
            return {
              ...locationData,
              source: 'ip'
            };
          }
        } catch (error) {
          console.warn(`IP service error for ${serviceUrl}:`, error);
          continue;
        }
      }

      throw this.createLocationError('NETWORK_ERROR', 'All IP-based location services failed');

    } catch (error: any) {
      console.error('IP location detection failed:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get human-readable location
   */
  private async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // Use OpenStreetMap Nominatim for reverse geocoding (free service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Reverse geocoding response:', data);

      const address = data.address || {};
      const city = address.city || address.town || address.village || address.hamlet || 'Unknown City';
      const region = address.state || address.province || address.region || '';
      const country = address.country || 'Unknown Country';

      return {
        latitude,
        longitude,
        city,
        region,
        country,
        displayName: region ? `${city}, ${region}, ${country}` : `${city}, ${country}`,
        source: 'geolocation'
      };

    } catch (error) {
      console.warn('Reverse geocoding failed, using coordinates:', error);
      
      // Fallback to coordinate display
      return {
        latitude,
        longitude,
        displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        source: 'geolocation'
      };
    }
  }

  /**
   * Parse IP location service responses
   */
  private parseIPLocationResponse(data: any, serviceUrl: string): LocationData | null {
    try {
      let latitude: number, longitude: number, city: string, region: string, country: string;

      if (serviceUrl.includes('ipapi.co')) {
        latitude = parseFloat(data.latitude);
        longitude = parseFloat(data.longitude);
        city = data.city || 'Unknown City';
        region = data.region || '';
        country = data.country_name || data.country || 'Unknown Country';
      } else if (serviceUrl.includes('ipinfo.io')) {
        const [lat, lon] = (data.loc || '0,0').split(',').map(parseFloat);
        latitude = lat;
        longitude = lon;
        city = data.city || 'Unknown City';
        region = data.region || '';
        country = data.country || 'Unknown Country';
      } else if (serviceUrl.includes('ipgeolocation.io')) {
        latitude = parseFloat(data.latitude);
        longitude = parseFloat(data.longitude);
        city = data.city || 'Unknown City';
        region = data.state_prov || '';
        country = data.country_name || 'Unknown Country';
      } else {
        return null;
      }

      if (isNaN(latitude) || isNaN(longitude)) {
        console.warn('Invalid coordinates from IP service:', data);
        return null;
      }

      return {
        latitude,
        longitude,
        city,
        region,
        country,
        displayName: region ? `${city}, ${region}, ${country}` : `${city}, ${country}`,
        source: 'geolocation'
      };

    } catch (error) {
      console.warn('Failed to parse IP location response:', error);
      return null;
    }
  }

  /**
   * Get location with automatic fallback (geolocation -> IP -> manual)
   */
  async getLocationWithFallback(options?: {
    skipGeolocation?: boolean;
    skipIPFallback?: boolean;
  }): Promise<LocationData> {
    const opts = {
      skipGeolocation: false,
      skipIPFallback: false,
      ...options
    };

    // Try geolocation first
    if (!opts.skipGeolocation) {
      try {
        console.log('Attempting geolocation detection...');
        return await this.getCurrentLocation();
      } catch (error: any) {
        console.log('Geolocation failed, trying fallback:', error.message);
        
        // If user denied permission, don't try IP fallback
        if (error.code === 'PERMISSION_DENIED') {
          throw error;
        }
      }
    }

    // Try IP-based detection as fallback
    if (!opts.skipIPFallback) {
      try {
        console.log('Attempting IP-based location detection...');
        return await this.getLocationByIP();
      } catch (error) {
        console.log('IP-based detection failed:', error);
      }
    }

    // If all methods fail
    throw this.createLocationError(
      'POSITION_UNAVAILABLE',
      'Unable to determine your location automatically',
      'Please enter your location manually or allow location access'
    );
  }

  /**
   * Clear cached location data
   */
  clearCache(): void {
    this.currentPosition = null;
    this.lastRequestTime = 0;
    console.log('Location cache cleared');
  }

  /**
   * Handle geolocation API errors
   */
  private handleGeolocationError(error: GeolocationPositionError): LocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return this.createLocationError(
          'PERMISSION_DENIED',
          'Location access denied',
          'Please allow location access in your browser settings or enter your location manually'
        );
      
      case error.POSITION_UNAVAILABLE:
        return this.createLocationError(
          'POSITION_UNAVAILABLE',
          'Location information unavailable',
          'Please check your device location settings or enter your location manually'
        );
      
      case error.TIMEOUT:
        return this.createLocationError(
          'TIMEOUT',
          'Location request timed out',
          'Please try again or enter your location manually'
        );
      
      default:
        return this.createLocationError(
          'POSITION_UNAVAILABLE',
          'Failed to get location',
          'Please try again or enter your location manually'
        );
    }
  }

  /**
   * Create standardized location error
   */
  private createLocationError(
    code: LocationError['code'],
    message: string,
    suggestion?: string
  ): LocationError {
    return {
      code,
      message,
      suggestion
    };
  }

  /**
   * Format location for display
   */
  formatLocationDisplay(location: LocationData): string {
    if (location.city && location.region && location.country) {
      return `${location.city}, ${location.region}, ${location.country}`;
    } else if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    } else if (location.displayName) {
      return location.displayName;
    } else {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
  }

  /**
   * Convert location to coordinate string for weather API
   */
  getCoordinateString(location: LocationData): string {
    return `${location.latitude},${location.longitude}`;
  }

  /**
   * Get cached location if available
   */
  getCachedLocation(): LocationData | null {
    if (this.currentPosition && Date.now() - this.lastRequestTime < this.CACHE_DURATION) {
      return this.currentPosition;
    }
    return null;
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();
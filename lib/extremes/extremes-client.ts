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
 * Client-side API wrapper for extremes data
 * Version 0.3.2
 */

import { ExtremesData } from './extremes-data';

/**
 * Fetch extreme temperatures from the API
 * @param userCoords Optional user coordinates for ranking
 */
export async function fetchExtremesAPI(
  userCoords?: { lat: number; lon: number }
): Promise<ExtremesData> {
  let url = '/api/extremes';
  
  if (userCoords) {
    url += `?lat=${userCoords.lat}&lon=${userCoords.lon}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch extremes: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get user's current location
 */
export function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false
      }
    );
  });
}

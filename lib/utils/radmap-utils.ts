/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 */

/**
 * Utility functions for Iowa State RadMap API integration
 */

export interface RadMapParams {
  latitude: number
  longitude: number
  width?: number
  height?: number
  timestamp?: Date
  layers?: string[]
  radiusDegrees?: number
}

/**
 * Calculate bounding box around a center point
 * @param lat Center latitude
 * @param lon Center longitude
 * @param radiusDegrees Radius in degrees (default 0.75 = ~50 miles)
 * @returns Bounding box string in format "minLon,minLat,maxLon,maxLat"
 */
export function calculateBoundingBox(
  lat: number,
  lon: number,
  radiusDegrees: number = 0.75
): string {
  const minLon = (lon - radiusDegrees).toFixed(4)
  const minLat = (lat - radiusDegrees).toFixed(4)
  const maxLon = (lon + radiusDegrees).toFixed(4)
  const maxLat = (lat + radiusDegrees).toFixed(4)
  
  return `${minLon},${minLat},${maxLon},${maxLat}`
}

/**
 * Format timestamp for RadMap API (YYYYMMDDHHII format in UTC)
 * @param date Date object or undefined for current time
 * @returns Formatted timestamp string
 */
export function formatRadMapTimestamp(date?: Date): string {
  const d = date || new Date()
  
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  
  return `${year}${month}${day}${hours}${minutes}`
}

/**
 * Get available Iowa State RadMap layers based on options
 * @param options Configuration options
 * @returns Array of layer names
 */
export function getRadMapLayers(options: {
  includeNexrad?: boolean
  includeWarnings?: boolean
  includeStormReports?: boolean
  includeCounties?: boolean
}): string[] {
  const layers: string[] = []
  
  if (options.includeNexrad !== false) {
    layers.push('nexrad')
  }
  
  if (options.includeWarnings) {
    layers.push('cbw') // County-based warnings
  }
  
  if (options.includeStormReports) {
    layers.push('lsrs') // Local storm reports
  }
  
  if (options.includeCounties) {
    layers.push('uscounties')
  }
  
  return layers
}

/**
 * Build Iowa State RadMap URL with parameters
 * @param params RadMap parameters
 * @returns Complete URL string for the proxy API
 */
export function buildRadMapUrl(params: RadMapParams): string {
  const {
    latitude,
    longitude,
    width = 800,
    height = 600,
    timestamp,
    layers = ['nexrad'],
    radiusDegrees = 0.75
  } = params
  
  const bbox = calculateBoundingBox(latitude, longitude, radiusDegrees)
  
  const urlParams = new URLSearchParams()
  urlParams.set('bbox', bbox)
  urlParams.set('width', width.toString())
  urlParams.set('height', height.toString())
  
  // Add layers
  layers.forEach(layer => {
    urlParams.append('layers[]', layer)
  })
  
  // Add timestamp if provided
  if (timestamp) {
    urlParams.set('ts', formatRadMapTimestamp(timestamp))
  }
  
  return `/api/weather/iowa-radmap?${urlParams.toString()}`
}

/**
 * Parse Iowa State timestamp back to Date object
 * @param timestamp String in YYYYMMDDHHII format
 * @returns Date object in UTC
 */
export function parseRadMapTimestamp(timestamp: string): Date | null {
  if (timestamp.length !== 12) {
    return null
  }
  
  const year = parseInt(timestamp.substring(0, 4))
  const month = parseInt(timestamp.substring(4, 6)) - 1
  const day = parseInt(timestamp.substring(6, 8))
  const hours = parseInt(timestamp.substring(8, 10))
  const minutes = parseInt(timestamp.substring(10, 12))
  
  return new Date(Date.UTC(year, month, day, hours, minutes))
}

/**
 * Calculate optimal zoom radius based on viewport size
 * @param viewportWidth Viewport width in pixels
 * @returns Radius in degrees
 */
export function calculateOptimalRadius(viewportWidth: number): number {
  // Mobile: smaller radius for tighter view
  if (viewportWidth < 640) {
    return 0.5
  }
  // Tablet: medium radius
  if (viewportWidth < 1024) {
    return 0.75
  }
  // Desktop: larger radius for broader view
  return 1.0
}


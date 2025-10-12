/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * Iowa State RadMap API Proxy
 * 
 * Proxies requests to Iowa State's RadMap service for static radar images
 * Base URL: https://mesonet.agron.iastate.edu/GIS/radmap.php
 * 
 * Query Parameters:
 * - bbox: Bounding box (minLon,minLat,maxLon,maxLat)
 * - width: Image width in pixels (default: 800)
 * - height: Image height in pixels (default: 600)
 * - layers[]: Array of layer names (nexrad, cbw, lsrs, uscounties)
 * - ts: Timestamp in YYYYMMDDHHII format (UTC)
 * - sector: Predefined sector (conus, iem, texas, etc.)
 */

const IOWA_STATE_BASE_URL = 'https://mesonet.agron.iastate.edu/GIS/radmap.php'
const MAX_REQUESTS_PER_MINUTE = 30
const requestCounts = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple rate limiting by IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }
  
  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false
  }
  
  record.count++
  return true
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.warn(`[RadMap] Rate limit exceeded for IP: ${ip}`)
      return new NextResponse('Rate limit exceeded', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'text/plain'
        }
      })
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    
    // Build Iowa State URL
    const iowaUrl = new URL(IOWA_STATE_BASE_URL)
    
    // Copy all query parameters
    searchParams.forEach((value, key) => {
      iowaUrl.searchParams.append(key, value)
    })
    
    // Ensure we have required parameters
    if (!iowaUrl.searchParams.has('bbox') && !iowaUrl.searchParams.has('sector')) {
      return new NextResponse('Missing required parameter: bbox or sector', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
    
    // Default dimensions if not provided
    if (!iowaUrl.searchParams.has('width')) {
      iowaUrl.searchParams.set('width', '800')
    }
    if (!iowaUrl.searchParams.has('height')) {
      iowaUrl.searchParams.set('height', '600')
    }
    
    // Ensure at least one layer
    if (!iowaUrl.searchParams.has('layers[]')) {
      iowaUrl.searchParams.append('layers[]', 'nexrad')
    }
    
    console.log(`[RadMap] Fetching from Iowa State: ${iowaUrl.toString()}`)
    
    // Fetch from Iowa State
    const response = await fetch(iowaUrl.toString(), {
      headers: {
        'User-Agent': '16-Bit-Weather/1.0 (+https://github.com/deephouse23/Weather-application-)',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })
    
    if (!response.ok) {
      console.error(`[RadMap] Iowa State API error: ${response.status} ${response.statusText}`)
      
      // Return transparent 1x1 PNG on error
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      )
      
      return new NextResponse(transparentPng, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60',
          'X-Error': 'Iowa State API unavailable'
        }
      })
    }
    
    // Get image data
    const imageBuffer = await response.arrayBuffer()
    
    // Determine caching strategy
    const hasTimestamp = searchParams.has('ts')
    const timestamp = searchParams.get('ts')
    
    let cacheControl: string
    
    if (!hasTimestamp || !timestamp) {
      // Current/realtime image - short cache
      cacheControl = 'public, max-age=300, s-maxage=300, stale-while-revalidate=60'
    } else {
      // Historical image - can be cached longer
      const now = Date.now()
      const tsDate = parseTimestamp(timestamp)
      const ageMinutes = tsDate ? (now - tsDate.getTime()) / 60000 : 0
      
      if (ageMinutes < 30) {
        // Recent past - medium cache
        cacheControl = 'public, max-age=600, s-maxage=1800, stale-while-revalidate=300'
      } else {
        // Older data - long cache
        cacheControl = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600'
      }
    }
    
    console.log(`[RadMap] Successfully fetched ${imageBuffer.byteLength} bytes`)
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*',
        'X-RadMap-Source': 'Iowa State University IEM'
      }
    })
    
  } catch (error) {
    console.error('[RadMap] Proxy error:', error)
    
    // Return transparent PNG on error
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )
    
    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=30',
        'X-Error': String(error)
      }
    })
  }
}

/**
 * Parse Iowa State timestamp (YYYYMMDDHHII) to Date
 */
function parseTimestamp(ts: string): Date | null {
  if (ts.length !== 12) return null
  
  const year = parseInt(ts.substring(0, 4))
  const month = parseInt(ts.substring(4, 6)) - 1
  const day = parseInt(ts.substring(6, 8))
  const hours = parseInt(ts.substring(8, 10))
  const minutes = parseInt(ts.substring(10, 12))
  
  return new Date(Date.UTC(year, month, day, hours, minutes))
}


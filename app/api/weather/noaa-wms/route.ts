import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Proxy NOAA MRMS WMS tiles to bypass CORS restrictions
// GET /api/weather/noaa-wms?REQUEST=GetMap&SERVICE=WMS&...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate required WMS parameters
    const requiredParams = ['REQUEST', 'SERVICE', 'VERSION', 'LAYERS', 'WIDTH', 'HEIGHT', 'CRS', 'BBOX']
    for (const param of requiredParams) {
      if (!searchParams.get(param)) {
        return new NextResponse(`Missing required parameter: ${param}`, { status: 400 })
      }
    }

    // Build NOAA WMS URL with all parameters
    const noaaBaseUrl = 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer'
    const noaaUrl = new URL(noaaBaseUrl)
    
    // Copy all query parameters from the request
    searchParams.forEach((value, key) => {
      noaaUrl.searchParams.set(key, value)
    })

    console.log(`[NOAA WMS Proxy] Fetching: ${noaaUrl.toString().substring(0, 200)}...`)

    const response = await fetch(noaaUrl.toString(), {
      headers: {
        'User-Agent': '16-Bit-Weather/noaa-wms-proxy',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout for WMS requests
    })

    if (!response.ok) {
      console.error(`[NOAA WMS Proxy] Error ${response.status}: ${response.statusText}`)
      
      // Return a transparent 1x1 PNG for failed requests
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      )
      return new NextResponse(transparentPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const imageBuffer = await response.arrayBuffer()

    // Adaptive caching based on TIME parameter
    const timeParam = searchParams.get('TIME')
    let cacheControl = 'public, max-age=300, s-maxage=600' // Default: 5 min / 10 min
    
    if (timeParam) {
      try {
        const tileTime = new Date(timeParam).getTime()
        const now = Date.now()
        const ageMinutes = (now - tileTime) / (1000 * 60)
        
        if (ageMinutes < 10) {
          // Recent tiles: shorter cache (data still updating)
          cacheControl = 'public, max-age=60, s-maxage=120, stale-while-revalidate=60'
        } else if (ageMinutes < 60) {
          // Recent history: medium cache
          cacheControl = 'public, max-age=300, s-maxage=600, stale-while-revalidate=300'
        } else {
          // Older tiles: longer cache (data unlikely to change)
          cacheControl = 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=1800'
        }
      } catch (e) {
        // Invalid time format, use default caching
      }
    }

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('[NOAA WMS Proxy] Fetch error:', error)
    
    // Return a transparent 1x1 PNG for errors
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )
    return new NextResponse(transparentPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=30',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}


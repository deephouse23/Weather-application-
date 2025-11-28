import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Proxy Iowa State NEXRAD WMS tiles to bypass CORS restrictions
// GET /api/weather/iowa-nexrad?REQUEST=GetMap&SERVICE=WMS&...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate required WMS parameters
    const requiredParams = ['LAYERS', 'FORMAT']
    for (const param of requiredParams) {
      if (!searchParams.get(param)) {
        return new NextResponse(`Missing required parameter: ${param}`, { status: 400 })
      }
    }

    // Build Iowa State NEXRAD WMS URL with all parameters
    const iowaBaseUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi'
    const iowaUrl = new URL(iowaBaseUrl)
    
    // Copy all query parameters from the request
    searchParams.forEach((value, key) => {
      iowaUrl.searchParams.set(key, value)
    })

    console.log(`[Iowa NEXRAD Proxy] Fetching: ${iowaUrl.toString().substring(0, 200)}...`)

    const response = await fetch(iowaUrl.toString(), {
      headers: {
        'User-Agent': '16-Bit-Weather/iowa-nexrad-proxy',
      },
      // @ts-expect-error - AbortSignal.timeout is supported in Node 18+
      signal: AbortSignal.timeout(10000), // 10 second timeout for WMS requests
    })

    if (!response.ok) {
      console.error(`[Iowa NEXRAD Proxy] Error ${response.status}: ${response.statusText}`)
      
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
    let cacheControl = 'public, max-age=120, s-maxage=240' // Default: 2 min / 4 min (shorter than NOAA)
    
    if (timeParam) {
      try {
        const tileTime = new Date(timeParam).getTime()
        const now = Date.now()
        const ageMinutes = (now - tileTime) / (1000 * 60)
        
        if (ageMinutes < 5) {
          // Very recent tiles: very short cache (data updating rapidly)
          cacheControl = 'public, max-age=30, s-maxage=60, stale-while-revalidate=30'
        } else if (ageMinutes < 30) {
          // Recent history: short cache
          cacheControl = 'public, max-age=120, s-maxage=240, stale-while-revalidate=120'
        } else {
          // Older tiles: longer cache
          cacheControl = 'public, max-age=600, s-maxage=1200, stale-while-revalidate=600'
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
    console.error('[Iowa NEXRAD Proxy] Fetch error:', error)
    
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


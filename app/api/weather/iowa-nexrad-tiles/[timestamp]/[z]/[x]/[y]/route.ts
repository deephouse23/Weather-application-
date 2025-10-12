import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Proxy Iowa State RIDGE NEXRAD tile cache
// GET /api/weather/iowa-nexrad-tiles/{timestamp}/{z}/{x}/{y}.png
// timestamp format: YYYYMMDD-HHMM (e.g., 20251011-2050)
export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = context as { params: { timestamp: string; z: string; x: string; y: string } }
  const { timestamp, z, x, y } = params

  if (!timestamp || !z || !x || !y) {
    return new NextResponse('Missing required parameters', { status: 400 })
  }

  // Iowa State RIDGE tile cache URL
  // Format: https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-YYYYMMDD-HHMM/{z}/{x}/{y}.png
  const iowaUrl = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-${timestamp}/${z}/${x}/${y}.png`

  console.log(`[Iowa NEXRAD Tiles] Fetching: ${iowaUrl}`)

  try {
    const response = await fetch(iowaUrl, {
      headers: {
        'User-Agent': '16-Bit-Weather/iowa-nexrad-tiles',
      },
      // @ts-ignore - AbortSignal.timeout is supported in Node 18+
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error(`[Iowa NEXRAD Tiles] Error ${response.status}: ${response.statusText}`)
      
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

    const imageBuffer = await response.arrayBuffer()

    // Parse timestamp to determine cache duration
    // Format: YYYYMMDD-HHMM
    let cacheControl = 'public, max-age=120, s-maxage=240'
    
    try {
      const year = parseInt(timestamp.substring(0, 4))
      const month = parseInt(timestamp.substring(4, 6)) - 1
      const day = parseInt(timestamp.substring(6, 8))
      const hour = parseInt(timestamp.substring(9, 11))
      const minute = parseInt(timestamp.substring(11, 13))
      
      const tileTime = new Date(Date.UTC(year, month, day, hour, minute)).getTime()
      const now = Date.now()
      const ageMinutes = (now - tileTime) / (1000 * 60)
      
      if (ageMinutes < 5) {
        // Very recent: short cache
        cacheControl = 'public, max-age=30, s-maxage=60, stale-while-revalidate=30'
      } else if (ageMinutes < 30) {
        // Recent: medium cache
        cacheControl = 'public, max-age=120, s-maxage=240, stale-while-revalidate=120'
      } else {
        // Older: long cache
        cacheControl = 'public, max-age=600, s-maxage=1200, stale-while-revalidate=600'
      }
    } catch (e) {
      // Use default caching if timestamp parsing fails
    }

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('[Iowa NEXRAD Tiles] Fetch error:', error)
    
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


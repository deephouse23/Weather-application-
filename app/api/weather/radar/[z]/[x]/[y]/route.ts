import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { z: string; x: string; y: string } }
) {
  const { z, x, y } = params
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  console.log('Radar API called:', { z, x, y, hasApiKey: !!apiKey })

  if (!apiKey) {
    console.error('OpenWeatherMap API key not found in environment variables')
    return new NextResponse('API key not configured', { status: 500 })
  }

  // Use precipitation layer for radar visualization
  const url = `https://tile.openweathermap.org/map/precipitation_new/${z}/${x}/${y}.png?appid=${apiKey}`
  
  console.log('Fetching tile from:', url)

  try {
    const response = await fetch(url, { 
      next: { revalidate: 600 }, // 10 minutes cache
      headers: {
        'User-Agent': '16-Bit-Weather/1.0'
      }
    })
    
    console.log('OpenWeatherMap response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      console.error('OpenWeatherMap API error:', response.status, response.statusText)
      // Return a transparent tile instead of error for better UX
      if (response.status === 401) {
        return new NextResponse('Invalid API key', { status: 401 })
      }
      if (response.status === 429) {
        return new NextResponse('Rate limit exceeded', { status: 429 })
      }
      // For other errors, return transparent tile
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      return new NextResponse(transparentPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
        }
      })
    }

    const imageBuffer = await response.arrayBuffer()
    const headers = new Headers({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
      'Access-Control-Allow-Origin': '*'
    })

    console.log('Successfully served tile:', { size: imageBuffer.byteLength })
    return new NextResponse(imageBuffer, { headers })
  } catch (error) {
    console.error('Error fetching weather radar tile:', error)
    
    // Return transparent tile instead of error for better UX
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    return new NextResponse(transparentPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60',
      }
    })
  }
}

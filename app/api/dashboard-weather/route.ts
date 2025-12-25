import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }
    
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY is not configured')
      return NextResponse.json({ error: 'Weather API not configured' }, { status: 500 })
    }
    
    // Fetch weather data from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    
    const response = await fetch(weatherUrl, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    })
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform to dashboard format
    const dashboardWeather = {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 10
    }
    
    return NextResponse.json(dashboardWeather)
    
  } catch (error) {
    console.error('Dashboard weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
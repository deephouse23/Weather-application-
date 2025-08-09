import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://api.openweathermap.org/data/2.5'

export async function GET(request: NextRequest) {
  try {
    // Get API keys from server-side environment
    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY
    const googleApiKey = process.env.GOOGLE_AIR_QUALITY_API_KEY
    
    if (!openWeatherApiKey) {
      return NextResponse.json(
        { error: 'OpenWeather API key not configured' },
        { status: 500 }
      )
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    // Validate required parameters
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
      )
    }

    // Validate coordinates
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates provided' },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of valid range' },
        { status: 400 }
      )
    }

    // Try Google Air Quality API first if available
    if (googleApiKey) {
      try {
        const googleUrl = 'https://airquality.googleapis.com/v1/currentConditions:lookup'
        const payload = JSON.stringify({ 
          location: { latitude, longitude } 
        })
        
        const response = await fetch(`${googleUrl}?key=${googleApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        })
        
        if (response.ok) {
          const data = await response.json()
          const aqiValue = data?.indexes?.[0]?.aqi || 0
          const aqiCategory = data?.indexes?.[0]?.category || 'No Data'
          
          return NextResponse.json({
            aqi: aqiValue,
            category: aqiCategory,
            source: 'google'
          })
        }
      } catch {
        console.log('Google Air Quality API failed, trying fallback')
      }
    }

    // Fallback to OpenWeather Air Pollution API
    const airPollutionUrl = `${BASE_URL}/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`
    
    const response = await fetch(airPollutionUrl)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Air quality service unavailable: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // OpenWeather uses a different AQI scale (1-5)
    const openWeatherAQI = data.list?.[0]?.main?.aqi || 1
    const components = data.list?.[0]?.components || {}
    
    // Convert OpenWeather AQI (1-5) to US EPA AQI scale (0-500)
    const convertedAQI = convertOpenWeatherAQIToEPA(openWeatherAQI, components)
    const category = getAQICategory(convertedAQI)
    
    return NextResponse.json({
      aqi: convertedAQI,
      category,
      source: 'openweather'
    })

  } catch (error) {
    console.error('Air quality API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface AirQualityComponents {
  pm2_5?: number;
  pm10?: number;
  [key: string]: number | undefined;
}

// Convert OpenWeather AQI (1-5) to US EPA AQI scale (0-500)
function convertOpenWeatherAQIToEPA(openWeatherAQI: number, components: AirQualityComponents): number {
  const aqiRanges = {
    1: { min: 0, max: 50 },      // Good
    2: { min: 51, max: 100 },    // Fair/Moderate
    3: { min: 101, max: 150 },   // Moderate/Unhealthy for Sensitive Groups
    4: { min: 151, max: 200 },   // Poor/Unhealthy
    5: { min: 201, max: 300 }    // Very Poor/Very Unhealthy
  }
  
  const range = aqiRanges[openWeatherAQI as keyof typeof aqiRanges] || aqiRanges[1]
  
  // Use PM2.5 and PM10 values if available for more accurate conversion
  if (components.pm2_5 && components.pm10) {
    const pm25AQI = calculateEPAFromPM25(components.pm2_5)
    const pm10AQI = calculateEPAFromPM10(components.pm10)
    
    // Return the higher of the two (worst case)
    return Math.max(pm25AQI, pm10AQI)
  }
  
  // Fallback to range-based conversion
  return Math.round((range.min + range.max) / 2)
}

// Calculate EPA AQI from PM2.5 concentration
function calculateEPAFromPM25(pm25: number): number {
  const breakpoints = [
    { low: 0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 350.4, aqiLow: 301, aqiHigh: 400 },
    { low: 350.5, high: 500.4, aqiLow: 401, aqiHigh: 500 }
  ]
  
  for (const bp of breakpoints) {
    if (pm25 >= bp.low && pm25 <= bp.high) {
      return Math.round(((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low) + bp.aqiLow)
    }
  }
  
  return 500 // Above 500.4 μg/m³
}

// Calculate EPA AQI from PM10 concentration
function calculateEPAFromPM10(pm10: number): number {
  const breakpoints = [
    { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
    { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
    { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
    { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
    { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
    { low: 425, high: 504, aqiLow: 301, aqiHigh: 400 },
    { low: 505, high: 604, aqiLow: 401, aqiHigh: 500 }
  ]
  
  for (const bp of breakpoints) {
    if (pm10 >= bp.low && pm10 <= bp.high) {
      return Math.round(((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm10 - bp.low) + bp.aqiLow)
    }
  }
  
  return 500 // Above 604 μg/m³
}

// Get AQI category based on EPA scale
function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}
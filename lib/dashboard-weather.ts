// Dashboard-specific weather data fetching
// Simplified version of weather-api.ts for location cards

interface DashboardWeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
  feelsLike: number
  pressure: number
  visibility: number
}

export async function getDashboardWeather(latitude: number, longitude: number): Promise<DashboardWeatherData | null> {
  try {
    // Use our API route instead of calling OpenWeather directly
    const response = await fetch(
      `/api/dashboard-weather?lat=${latitude}&lon=${longitude}`,
      { 
        cache: 'default',
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Weather API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Data is already transformed by the API route
    return data
  } catch (error) {
    console.error('Error fetching dashboard weather:', error)
    return null
  }
}

export function getWeatherIcon(iconCode: string): string {
  const iconMap: { [key: string]: string } = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
  }

  return iconMap[iconCode] || '🌤️'
}

export function getTemperatureColor(temp: number): string {
  if (temp >= 100) return 'text-red-600'
  if (temp >= 90) return 'text-red-500'
  if (temp >= 80) return 'text-orange-500'
  if (temp >= 70) return 'text-yellow-500'
  if (temp >= 60) return 'text-green-500'
  if (temp >= 50) return 'text-blue-400'
  if (temp >= 40) return 'text-blue-500'
  if (temp >= 32) return 'text-blue-600'
  return 'text-blue-700'
}
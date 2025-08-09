import type { Metadata } from 'next'
import { fetchWeatherData } from '@/lib/weather-api'

type Props = {
  params: { city: string }
  children: React.ReactNode
}

// City name formatting function
function formatCityName(citySlug: string): string {
  return citySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// City slug to search term conversion
function citySlugToSearchTerm(citySlug: string): string {
  const parts = citySlug.split('-')
  if (parts.length >= 2) {
    const state = parts[parts.length - 1].toUpperCase()
    const city = parts.slice(0, -1).join(' ')
    return `${city}, ${state}`
  }
  return formatCityName(citySlug)
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const cityName = formatCityName(params.city)
  const searchTerm = citySlugToSearchTerm(params.city)
  
  // Default metadata
  const title = `${cityName} Weather Forecast | 16-Bit Retro Weather Terminal`
  const description = `Get ${cityName} weather in nostalgic 16-bit style. Real-time conditions, 7-day forecast, and atmospheric data for ${searchTerm}.`
  const canonical = `https://16-bit-weather.vercel.app/weather/${params.city}`
  
  // Try to fetch weather data for enhanced metadata
  let weatherData = null
  try {
    weatherData = await fetchWeatherData(searchTerm)
  } catch (error) {
    console.log('Failed to fetch weather data for metadata:', error)
  }

  // Enhanced description with current weather if available
  let enhancedDescription = description
  if (weatherData) {
    enhancedDescription = `Current weather in ${cityName}: ${weatherData.temperature}${weatherData.unit}, ${weatherData.condition}. Get real-time weather conditions, 7-day forecast, and atmospheric data in nostalgic 16-bit style.`
  }

  // Structured data for WeatherForecast
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": enhancedDescription,
    "url": canonical,
    "mainEntity": {
      "@type": "Place",
      "name": cityName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": cityName
      }
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "16-Bit Weather Education Platform",
      "url": "https://16-bit-weather.vercel.app"
    }
  }

  // Add weather forecast structured data if available
  if (weatherData && weatherData.forecast && weatherData.forecast.length > 0) {
    const weatherForecast = {
      "@context": "https://schema.org",
      "@type": "WeatherForecast",
      "dateModified": new Date().toISOString(),
      "expires": new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      "about": {
        "@type": "Place",
        "name": cityName,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityName
        }
      },
      "provider": {
        "@type": "Organization",
        "name": "16-Bit Weather Platform",
        "url": "https://16-bit-weather.vercel.app"
      },
      "dayOfWeek": weatherData.forecast.slice(0, 5).map((day, index) => {
        const date = new Date()
        date.setDate(date.getDate() + index)
        return {
          "@type": "DayOfWeek",
          "name": day.day || date.toLocaleDateString('en-US', { weekday: 'long' }),
          "temperature": `${day.high}${weatherData.unit}`,
          "temperatureUnit": weatherData.unit === '°F' ? 'Fahrenheit' : 'Celsius',
          "conditions": day.condition || 'Partly Cloudy'
        }
      })
    }
    
    // Merge weather forecast into structured data
    structuredData.mainEntity = {
      ...structuredData.mainEntity,
      "hasMap": weatherForecast
    }
  }

  return {
    title,
    description: enhancedDescription,
    keywords: `${cityName} weather, weather forecast ${cityName}, ${searchTerm} weather, retro weather, 16-bit weather, current conditions ${cityName}`,
    authors: [{ name: 'Weather Education Systems' }],
    creator: 'Weather Education Systems',
    publisher: 'Weather Education Systems',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://16-bit-weather.vercel.app'),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: enhancedDescription,
      url: canonical,
      siteName: '16-Bit Weather Education',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${cityName} Weather Forecast - 16-Bit Style`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: enhancedDescription,
      images: ['/og-image.png'],
      creator: '@weather16bit',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'application/ld+json': JSON.stringify(structuredData),
    }
  }
}

export default function CityWeatherLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}
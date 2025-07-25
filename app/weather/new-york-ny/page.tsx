"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchWeatherData } from '@/lib/weather-api'
import { WeatherData } from '@/lib/types'
import PageWrapper from '@/components/page-wrapper'
import WeatherSearch from '@/components/weather-search'
import Forecast from '@/components/forecast'
import ForecastDetails from '@/components/forecast-details'
import { useTheme } from '@/components/theme-provider'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CollapsibleSection } from '@/components/collapsible-section'

// City data for SEO and functionality
const cityData: { [key: string]: { 
  name: string
  state: string
  searchTerm: string
  title: string
  description: string
  content: {
    intro: string
    climate: string
    patterns: string
  }
}} = {
  'new-york-ny': {
    name: 'New York',
    state: 'NY',
    searchTerm: 'New York, NY',
    title: 'New York Weather Forecast | 16-Bit Retro Weather Terminal',
    description: 'Get New York weather in nostalgic 16-bit style. Real-time conditions, 7-day forecast, radar, and atmospheric data.',
    content: {
      intro: 'New York City experiences a humid subtropical climate with four distinct seasons. Located in the northeastern United States, the city\'s weather is influenced by its coastal position and urban heat island effect.',
      climate: 'Summers in NYC are typically hot and humid with average highs in the mid-80s°F (29°C), while winters are cold with temperatures often dropping below freezing. The city receives about 50 inches of precipitation annually, distributed fairly evenly throughout the year.',
      patterns: 'Weather patterns in New York are heavily influenced by the Atlantic Ocean and can change rapidly. The city experiences everything from nor\'easters in winter to thunderstorms and occasional heat waves in summer. Spring and fall offer the most pleasant weather conditions.'
    }
  },
  'los-angeles-ca': {
    name: 'Los Angeles',
    state: 'CA',
    searchTerm: 'Los Angeles, CA',
    title: 'Los Angeles Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Los Angeles, CA. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Los Angeles enjoys a Mediterranean climate characterized by warm, dry summers and mild, wet winters. The city\'s location along the Pacific coast and surrounded by mountains creates diverse microclimates throughout the region.',
      climate: 'Summer temperatures typically range from the mid-70s to mid-80s°F (24-29°C) with very low humidity and minimal rainfall. Winters are mild with highs in the 60s-70s°F (15-21°C) and most of the year\'s 15 inches of rainfall occurring between November and March.',
      patterns: 'LA\'s weather is notably stable and predictable, with over 280 sunny days per year. The marine layer from the Pacific often creates morning fog and clouds that burn off by afternoon. Santa Ana winds occasionally bring hot, dry conditions and elevated fire risk.'
    }
  },
  'chicago-il': {
    name: 'Chicago',
    state: 'IL',
    searchTerm: 'Chicago, IL',
    title: 'Chicago Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Chicago, IL. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Chicago experiences a continental climate with hot, humid summers and cold, snowy winters. The city\'s location on Lake Michigan significantly influences its weather patterns, moderating temperatures and increasing precipitation.',
      climate: 'Summer highs average in the low 80s°F (27°C) with high humidity, while winter temperatures often drop below freezing with average lows around 20°F (-7°C). The city receives about 38 inches of precipitation annually, including significant snowfall in winter.',
      patterns: 'Lake Michigan creates a "lake effect" that moderates temperatures year-round but can enhance snowfall in winter. The city is known for its rapidly changing weather and strong winds, earning it the nickname "Windy City." Spring and fall are transitional with variable conditions.'
    }
  },
  'houston-tx': {
    name: 'Houston',
    state: 'TX',
    searchTerm: 'Houston, TX',
    title: 'Houston Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Houston, TX. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Houston has a humid subtropical climate with hot, humid summers and mild winters. Located near the Gulf of Mexico, the city experiences high humidity year-round and is prone to tropical weather systems.',
      climate: 'Summer temperatures regularly reach the 90s°F (32-37°C) with very high humidity making it feel even hotter. Winters are mild with highs in the 60s-70s°F (15-21°C). The city receives about 50 inches of rain annually, much of it from thunderstorms and tropical systems.',
      patterns: 'Houston\'s weather is dominated by Gulf moisture creating frequent afternoon and evening thunderstorms during summer. The city is vulnerable to hurricanes and tropical storms from June through November. Heat and humidity can make summer conditions particularly challenging.'
    }
  },
  'phoenix-az': {
    name: 'Phoenix',
    state: 'AZ',
    searchTerm: 'Phoenix, AZ',
    title: 'Phoenix Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Phoenix, AZ. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Phoenix has a hot desert climate with extremely hot summers and mild winters. Located in the Sonoran Desert, the city experiences low humidity year-round and abundant sunshine with minimal precipitation.',
      climate: 'Summer temperatures routinely exceed 110°F (43°C) from May through September, making Phoenix one of the hottest major cities in the US. Winters are pleasant with highs in the 70s°F (21°C). Annual rainfall is only about 8 inches, mostly from winter storms and summer monsoons.',
      patterns: 'Phoenix weather is characterized by extreme heat and drought, broken by the North American Monsoon which brings thunderstorms and flash flooding from July through September. Winter months offer ideal outdoor weather conditions with clear skies and comfortable temperatures.'
    }
  },
  'philadelphia-pa': {
    name: 'Philadelphia',
    state: 'PA',
    searchTerm: 'Philadelphia, PA',
    title: 'Philadelphia Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Philadelphia, PA. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Philadelphia has a humid subtropical climate with hot, humid summers and cool to cold winters. Located in southeastern Pennsylvania, the city experiences four distinct seasons with moderate precipitation throughout the year.',
      climate: 'Summer highs average in the mid-80s°F (29°C) with high humidity, while winter temperatures typically range from the 20s to 40s°F (-7 to 4°C). The city receives about 42 inches of precipitation annually, including snow in winter months.',
      patterns: 'Philadelphia\'s weather is influenced by both continental and maritime air masses, creating variable conditions. The city can experience nor\'easters, thunderstorms, and occasional severe weather. Spring and fall provide the most comfortable weather with mild temperatures and lower humidity.'
    }
  },
  'san-antonio-tx': {
    name: 'San Antonio',
    state: 'TX',
    searchTerm: 'San Antonio, TX',
    title: 'San Antonio Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for San Antonio, TX. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'San Antonio has a humid subtropical climate with hot summers and mild winters. Located in south-central Texas, the city experiences warm weather year-round with moderate to high humidity.',
      climate: 'Summer temperatures regularly reach the 90s-100s°F (32-38°C) with moderate humidity. Winters are mild with highs typically in the 60s°F (15°C) and lows rarely dropping below freezing. Annual precipitation is about 30 inches, with most rainfall occurring in late spring and early fall.',
      patterns: 'San Antonio\'s weather features long, hot summers and short, mild winters. The city occasionally experiences severe thunderstorms and is within range of Gulf hurricanes. Spring and fall offer the most pleasant weather conditions with comfortable temperatures and lower humidity.'
    }
  },
  'san-diego-ca': {
    name: 'San Diego',
    state: 'CA',
    searchTerm: 'San Diego, CA',
    title: 'San Diego Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for San Diego, CA. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'San Diego boasts a semi-arid Mediterranean climate with mild temperatures year-round. Located on the Pacific coast of Southern California, the city enjoys one of the most stable and pleasant climates in the United States.',
      climate: 'Temperatures are remarkably consistent, with summer highs in the mid-70s°F (24°C) and winter highs in the mid-60s°F (18°C). Humidity is generally low, and the city receives only about 10 inches of rain annually, mostly during winter months.',
      patterns: 'San Diego\'s weather is dominated by marine influence, creating cool ocean breezes and preventing extreme temperatures. The city experiences very little seasonal variation and minimal precipitation. Marine layer clouds are common in late spring and early summer, typically clearing by afternoon.'
    }
  },
  'dallas-tx': {
    name: 'Dallas',
    state: 'TX',
    searchTerm: 'Dallas, TX',
    title: 'Dallas Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Dallas, TX. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Dallas has a humid subtropical climate with hot summers and mild winters. Located in north-central Texas, the city experiences a continental climate influence with variable weather patterns and moderate precipitation.',
      climate: 'Summer temperatures frequently reach the 90s-100s°F (32-38°C) with moderate to high humidity. Winters are generally mild with highs in the 50s-60s°F (10-15°C), though occasional cold fronts can bring freezing temperatures. Annual precipitation is about 37 inches.',
      patterns: 'Dallas weather is characterized by hot summers, mild winters, and rapid weather changes due to its location in "Tornado Alley." The city can experience severe thunderstorms, tornadoes, hail, and occasional ice storms. Spring and fall offer the most comfortable weather conditions.'
    }
  },
  'austin-tx': {
    name: 'Austin',
    state: 'TX',
    searchTerm: 'Austin, TX',
    title: 'Austin Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Austin, TX. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Austin has a humid subtropical climate with hot summers and mild winters. Located in central Texas, the city experiences warm weather most of the year with distinct wet and dry seasons.',
      climate: 'Summer temperatures regularly exceed 95°F (35°C) with moderate humidity, while winters are mild with highs in the 60s°F (15°C) and lows rarely below freezing. The city receives about 34 inches of rain annually, with peak rainfall in spring and fall.',
      patterns: 'Austin\'s weather features long, hot summers and short, mild winters. The city experiences severe thunderstorms, flash flooding, and occasional tornadoes. Spring brings wildflower blooms and variable weather, while fall offers some of the year\'s most pleasant conditions.'
    }
  }
}

export default function CityWeatherPage() {
  const params = useParams()
  const citySlug = params.city as string
  const city = cityData[citySlug]
  const { theme } = useTheme()
  
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // If city not found, show 404-style message
  if (!city) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">City Not Found</h1>
              <p className="text-gray-300">The requested city page does not exist.</p>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Load weather data for the city on mount
  useEffect(() => {
    const loadCityWeather = async () => {
      try {
        setLoading(true)
        setError("")
        
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
        if (!API_KEY) {
          throw new Error('API key not configured')
        }
        
        const weatherData = await fetchWeatherData(city.searchTerm, API_KEY)
        setWeather(weatherData)
      } catch (err) {
        console.error('Error loading city weather:', err)
        setError(err instanceof Error ? err.message : 'Failed to load weather data')
      } finally {
        setLoading(false)
      }
    }

    loadCityWeather()
  }, [city.searchTerm])

  // Search handler for the search component
  const handleSearch = async (locationInput: string) => {
    try {
      setLoading(true)
      setError("")
      
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
      if (!API_KEY) {
        throw new Error('API key not configured')
      }
      
      const weatherData = await fetchWeatherData(locationInput, API_KEY)
      setWeather(weatherData)
    } catch (err) {
      console.error('Error searching weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async () => {
    // Geolocation functionality - same as main page
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setLoading(true)
    setError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY
      
      if (!API_KEY) {
        throw new Error('API key not configured')
      }
      
      const { fetchWeatherByLocation } = await import('@/lib/weather-api')
      const weatherData = await fetchWeatherByLocation(`${latitude},${longitude}`)
      setWeather(weatherData)
    } catch (err) {
      console.error("Location error:", err)
      setError(err instanceof Error ? err.message : "Failed to get your location")
    } finally {
      setLoading(false)
    }
  }

  const handleDayClick = (index: number) => {
    setSelectedDay(selectedDay === index ? null : index)
  }

  return (
    <>
      {/* SEO Head */}
      <head>
        <title>{city.title}</title>
        <meta name="description" content={city.description} />
        <meta property="og:title" content={city.title} />
        <meta property="og:description" content={city.description} />
        <meta property="og:url" content={`https://16bitweather.co/weather/${citySlug}`} />
        <link rel="canonical" href={`https://16bitweather.co/weather/${citySlug}`} />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": city.title,
              "description": city.description,
              "url": `https://16bitweather.co/weather/${citySlug}`,
              "about": {
                "@type": "Place",
                "name": `${city.name}, ${city.state}`,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": city.name,
                  "addressRegion": city.state,
                  "addressCountry": "US"
                }
              },
              "mainEntity": {
                "@type": "WeatherForecast",
                "name": `${city.name} Weather Forecast`,
                "description": `Current weather conditions and 7-day forecast for ${city.name}, ${city.state}`,
                "location": {
                  "@type": "Place",
                  "name": `${city.name}, ${city.state}`,
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": city.name,
                    "addressRegion": city.state,
                    "addressCountry": "US"
                  }
                },
                "provider": {
                  "@type": "Organization",
                  "name": "16-Bit Weather",
                  "url": "https://16bitweather.co"
                },
                "datePublished": new Date().toISOString().split('T')[0],
                "validThrough": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }
            })
          }}
        />
      </head>

      <PageWrapper
        weatherLocation={weather?.location}
        weatherTemperature={weather?.temperature}
        weatherUnit={weather?.unit}
      >
        <div className={cn(
          "min-h-screen",
          theme === "dark" && "bg-gradient-to-b from-gray-900 to-black",
          theme === "miami" && "bg-gradient-to-b from-pink-900 to-purple-900",
          theme === "tron" && "bg-gradient-to-b from-black to-blue-900"
        )}>
          <div className="container mx-auto px-4 py-8">
            
            {/* City Header */}
            <div className="text-center mb-6">
              <h1 className={cn(
                "text-2xl md:text-3xl font-bold uppercase tracking-wider font-mono mb-2",
                theme === "dark" && "text-[#00FFFF]",
                theme === "miami" && "text-[#00FFFF]", 
                theme === "tron" && "text-[#00FFFF]"
              )}>
                {city.name}, {city.state} WEATHER
              </h1>
              
              {/* Climate Summary - Above Weather Widget */}
              <p className={cn(
                "text-sm font-mono mt-3 max-w-2xl mx-auto",
                theme === "dark" && "text-[#e0e0e0]",
                theme === "miami" && "text-[#00FFFF]",
                theme === "tron" && "text-white"
              )}>
                New York experiences a humid subtropical climate with hot summers and cold winters. The city sees about 50 inches of rainfall annually.
              </p>
            </div>

            {/* Weather Search Component */}
            <WeatherSearch
              onSearch={handleSearch}
              onLocationSearch={handleLocationSearch}
              isLoading={loading}
              error={error}
              rateLimitError=""
              isDisabled={false}
              theme={theme}
            />

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center mt-8">
                <Loader2 className={cn(
                  "h-8 w-8 animate-spin",
                  theme === "dark" && "text-[#00FFFF]",
                  theme === "miami" && "text-pink-500",
                  theme === "tron" && "text-[#00FFFF]"
                )} />
                <span className="ml-2 text-white">Loading weather data...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-red-500 text-center mt-4">
                {error}
              </div>
            )}

            {/* Weather Display - Same as homepage */}
            {weather && !loading && !error && (
              <div className="space-y-4 sm:space-y-6">
                {/* Current Weather - Same styling as homepage */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Temperature Box */}
                  <div className={cn(
                    "p-4 rounded-lg text-center border-2 shadow-lg",
                    theme === "dark" && "bg-[#0f0f0f] border-[#00FFFF]",
                    theme === "miami" && "bg-[#0a0025] border-[#00FFFF]",
                    theme === "tron" && "bg-black border-[#00FFFF]"
                  )}>
                    <h2 className={cn(
                      "text-xl font-semibold mb-2",
                      theme === "dark" && "text-[#00FFFF]",
                      theme === "miami" && "text-[#00FFFF]",
                      theme === "tron" && "text-[#00FFFF]"
                    )}>Temperature</h2>
                    <p className="text-3xl font-bold text-white">{weather.temperature}{weather.unit}</p>
                  </div>

                  {/* Conditions Box */}
                  <div className={cn(
                    "p-4 rounded-lg text-center border-2 shadow-lg",
                    theme === "dark" && "bg-[#0f0f0f] border-[#00FFFF]",
                    theme === "miami" && "bg-[#0a0025] border-[#00FFFF]",
                    theme === "tron" && "bg-black border-[#00FFFF]"
                  )}>
                    <h2 className={cn(
                      "text-xl font-semibold mb-2",
                      theme === "dark" && "text-[#00FFFF]",
                      theme === "miami" && "text-[#00FFFF]",
                      theme === "tron" && "text-[#00FFFF]"
                    )}>Conditions</h2>
                    <p className="text-lg text-white">{weather.condition}</p>
                    <p className="text-sm text-gray-300">{weather.description}</p>
                  </div>

                  {/* Wind Box */}
                  <div className={cn(
                    "p-4 rounded-lg text-center border-2 shadow-lg",
                    theme === "dark" && "bg-[#0f0f0f] border-[#00FFFF]",
                    theme === "miami" && "bg-[#0a0025] border-[#00FFFF]",
                    theme === "tron" && "bg-black border-[#00FFFF]"
                  )}>
                    <h2 className={cn(
                      "text-xl font-semibold mb-2",
                      theme === "dark" && "text-[#00FFFF]",
                      theme === "miami" && "text-[#00FFFF]",
                      theme === "tron" && "text-[#00FFFF]"
                    )}>Wind</h2>
                    <p className="text-lg text-white">
                      {weather.wind.direction ? `${weather.wind.direction} ` : ''}
                      {weather.wind.speed} mph
                      {weather.wind.gust ? ` (gusts ${weather.wind.gust} mph)` : ''}
                    </p>
                  </div>
                </div>

                {/* Forecast Components - Same as homepage */}
                <Forecast 
                  forecast={weather.forecast.map(day => ({
                    ...day,
                    country: weather.country
                  }))} 
                  theme={theme}
                  onDayClick={handleDayClick}
                  selectedDay={selectedDay}
                />

                <ForecastDetails 
                  forecast={weather.forecast.map(day => ({
                    ...day,
                    country: weather.country
                  }))} 
                  theme={theme}
                  selectedDay={selectedDay}
                  currentWeatherData={{
                    humidity: weather.humidity,
                    wind: weather.wind,
                    pressure: weather.pressure,
                    uvIndex: weather.uvIndex,
                    sunrise: weather.sunrise,
                    sunset: weather.sunset
                  }}
                />
              </div>
            )}

            {/* Local Weather Patterns - Minimal SEO Content */}
            <CollapsibleSection 
              title="Local Weather Patterns" 
              theme={theme}
              className="mt-8 max-w-2xl mx-auto"
            >
              <ul className="space-y-2">
                <li>• Urban heat island effect raises temperatures 2-5°F above surrounding areas</li>
                <li>• Nor'easter storms bring heavy winter precipitation and coastal flooding</li>
                <li>• Atlantic Ocean moderates temperature extremes year-round</li>
              </ul>
            </CollapsibleSection>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
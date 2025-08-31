/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import { Suspense } from 'react'
import CityWeatherClient from './client'
import { cityData } from '@/lib/city-metadata';
import { Metadata } from 'next';

// Generate static pages for better SEO
export async function generateStaticParams() {
  return Object.keys(cityData).map((citySlug) => ({
    city: citySlug,
  }))
}

// Generate metadata for each city page
export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const citySlug = params.city
  const city = cityData[citySlug]

  if (!city) {
    return {
      title: 'City Not Found - 16 Bit Weather',
      description: 'The requested city page does not exist.',
    }
  }

  const pageTitle = `${city.name}, ${city.state} Weather Forecast - 16 Bit Weather`;
  const description = `Get the latest real-time weather forecast for ${city.name}, ${city.state}. See temperature, precipitation, wind, and more with a retro terminal aesthetic.`;

  return {
    title: pageTitle,
    description: description,
    keywords: `${city.name} weather, ${city.state} weather forecast, ${city.name} temperature, ${city.name} climate, 16-bit weather, retro weather app`,
    openGraph: {
      title: pageTitle,
      description: description,
      url: `https://www.16bitweather.co/weather/${citySlug}`,
      siteName: '16 Bit Weather',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${city.name} Weather - 16 Bit Weather Terminal`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `https://www.16bitweather.co/weather/${citySlug}`,
    },
  }
}

interface PageParams {
  params: {
    city: string
  }
}

export default function CityWeatherPage({ params }: PageParams) {
  const citySlug = params.city
  const city = cityData[citySlug]

  // If city doesn't exist in our predefined list, still render the client component
  // This allows for dynamic city searches while maintaining SEO for major cities
  const cityInfo = city || {
    name: formatCityName(citySlug),
    state: '',
    searchTerm: citySlugToSearchTerm(citySlug),
    title: `${formatCityName(citySlug)} Weather Forecast - 16 Bit Weather`,
    description: `Current weather conditions and 5-day forecast for ${formatCityName(citySlug)}. Real-time weather data with retro terminal aesthetics.`,
    content: {
      intro: `Weather information for ${formatCityName(citySlug)}.`,
      climate: 'Real-time weather data and forecasts available.',
      patterns: 'Check current conditions and extended forecasts.'
    }
  }
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: cityInfo.title,
    description: cityInfo.description,
    url: `https://www.16bitweather.co/weather/${citySlug}`,
    about: {
      '@type': 'Place',
      name: `${cityInfo.name}, ${cityInfo.state || ''}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: cityInfo.name,
        addressRegion: cityInfo.state || undefined,
        addressCountry: 'US'
      }
    },
    mainEntity: {
      '@type': 'WeatherForecast',
      location: {
        '@type': 'Place',
        name: `${cityInfo.name}, ${cityInfo.state || ''}`
      }
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.16bitweather.co'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Weather',
          item: 'https://www.16bitweather.co/weather'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${cityInfo.name}, ${cityInfo.state || ''}`,
          item: `https://www.16bitweather.co/weather/${citySlug}`
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="text-white text-center py-8">Loading weather data...</div>
            </div>
          </div>
        </div>
      }>
        <CityWeatherClient 
          city={cityInfo} 
          citySlug={citySlug} 
          isPredefinedCity={!!city}
        />
      </Suspense>
    </>
  )
}

// Force dynamic rendering to prevent build-time API calls  
export const dynamic = 'force-dynamic'

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
    title: 'New York Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for New York, NY. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
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
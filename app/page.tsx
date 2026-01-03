/**
 * 16-Bit Weather Platform - Homepage
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Server Component wrapper for SEO optimization
 */

import type { Metadata } from 'next'
import HomeClient from './home-client'

export const metadata: Metadata = {
  title: '16 Bit Weather - Retro Terminal Weather Forecast App',
  description: 'Real-time weather forecasts with authentic 16-bit terminal aesthetics. Check current conditions, 5-day forecasts, weather radar, and air quality for any city worldwide. Features Dark Terminal, Miami Vice, and Tron Grid themes.',
  keywords: '16-bit weather, retro weather app, terminal weather, pixel weather, weather forecast, real-time weather, 5-day forecast, weather radar, air quality, weather map, hourly forecast, weather conditions, meteorology',
  openGraph: {
    title: '16 Bit Weather - Retro Terminal Weather Forecast',
    description: 'Real-time weather forecasts with authentic 16-bit terminal aesthetics. Check weather for any city worldwide.',
    url: 'https://www.16bitweather.co',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=16+Bit+Weather&subtitle=Retro+Terminal+Weather+Forecast',
        width: 1200,
        height: 630,
        alt: '16 Bit Weather - Retro Terminal Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '16 Bit Weather - Retro Terminal Weather',
    description: 'Real-time weather forecasts with authentic 16-bit terminal aesthetics.',
    images: ['/api/og?title=16+Bit+Weather&subtitle=Retro+Terminal+Weather+Forecast'],
    creator: '@16bitweather',
  },
  alternates: {
    canonical: 'https://www.16bitweather.co',
  },
}

// JSON-LD structured data for the homepage
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '16 Bit Weather',
  description: 'Real-time weather forecasts with authentic 16-bit terminal aesthetics',
  url: 'https://www.16bitweather.co',
  applicationCategory: 'WeatherApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: '16 Bit Weather',
    url: 'https://www.16bitweather.co',
  },
  featureList: [
    'Real-time weather data',
    '5-day weather forecast',
    'NOAA MRMS weather radar',
    'Air quality index',
    'Pollen count',
    'UV index',
    'Hourly forecast',
    'Multiple retro themes',
    'City weather search',
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  )
}

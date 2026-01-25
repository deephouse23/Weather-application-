/**
 * 16-Bit Weather Platform - Homepage
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Server Component wrapper for SEO optimization
 * PERFORMANCE: Uses streaming SSR with Suspense for faster LCP
 */

import type { Metadata } from 'next'
import { Suspense, lazy } from 'react'
import { WeatherCardsSkeleton } from '@/components/home-shell'

// PERFORMANCE: Lazy load HomeClient so Suspense fallback renders while it loads
// This enables the server-rendered shell to display immediately as LCP
const HomeClient = lazy(() => import('./home-client'))

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

/**
 * Server-rendered shell for LCP optimization
 * This renders immediately while the client component loads
 * Contains a large text element that becomes the LCP
 */
function HomePageShell() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-[var(--bg,#0a0a1a)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Large header - this is the LCP element */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 text-[var(--primary,#00ff00)]"
          style={{
            textShadow: '0 0 10px var(--primary, #00ff00), 0 0 20px var(--primary, #00ff00)',
            fontFamily: 'var(--font-vt323), monospace'
          }}
        >
          16 BIT WEATHER
        </h1>

        {/* Search placeholder */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="flex gap-2">
            <div className="flex-1 h-12 rounded-md border-2 bg-gray-800/50 border-gray-700 animate-pulse" />
            <div className="w-24 h-12 rounded-md border-2 bg-gray-700/50 border-gray-600 animate-pulse" />
          </div>
        </div>

        {/* Welcome message */}
        <div className="text-center mt-8 mb-8 px-2 sm:px-0">
          <div className="w-full max-w-xl mx-auto">
            <div className="p-2 sm:p-3 border-2 shadow-lg bg-[var(--bg-elev,#1a1a2e)] border-[var(--primary,#00ff00)] shadow-[var(--primary,#00ff00)]/20">
              <p className="text-sm font-bold uppercase tracking-wider text-white" style={{
                fontSize: "clamp(10px, 2.4vw, 14px)"
              }}>
                ══ INITIALIZING WEATHER TERMINAL ══
              </p>
            </div>
          </div>
        </div>

        {/* Weather cards skeleton */}
        <WeatherCardsSkeleton />
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD structured data - safe as jsonLd is a static constant */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* PERFORMANCE: Suspense boundary for streaming - shell renders server-side */}
      <Suspense fallback={<HomePageShell />}>
        <HomeClient />
      </Suspense>
    </>
  )
}

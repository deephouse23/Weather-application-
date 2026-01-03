/**
 * 16-Bit Weather Platform - News Page Layout
 * SEO metadata for weather news aggregation
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Weather News - Earthquakes, Volcanoes, Climate Updates | 16 Bit Weather',
  description: 'Live weather news aggregated from USGS, NASA, and NOAA. Track earthquakes, volcanic activity, severe weather alerts, space weather, and climate updates in retro terminal style.',
  keywords: 'weather news, earthquake news, volcano updates, severe weather alerts, climate news, NOAA updates, NASA weather, space weather, natural disasters, weather alerts',
  openGraph: {
    title: 'Weather News Hub - 16 Bit Weather',
    description: 'Real-time weather news from trusted sources including USGS, NASA, and NOAA. Earthquakes, volcanoes, severe weather, and climate updates.',
    url: 'https://www.16bitweather.co/news',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=Weather+News&subtitle=Earthquakes+Volcanoes+Climate',
        width: 1200,
        height: 630,
        alt: 'Weather News - 16 Bit Weather Terminal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weather News Hub - 16 Bit Weather',
    description: 'Real-time weather news from USGS, NASA, and NOAA',
    images: ['/api/og?title=Weather+News&subtitle=Earthquakes+Volcanoes+Climate'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/news',
  },
}

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

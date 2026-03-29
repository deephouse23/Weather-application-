/**
 * 16-Bit Weather Platform - Hourly Forecast Layout
 * SEO metadata for hourly weather forecasts
 */

import type { Metadata } from 'next'

const hourlyJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Hourly Weather Forecast",
  "description": "Hour-by-hour weather predictions for any location.",
  "url": "https://www.16bitweather.co/hourly",
  "applicationCategory": "WeatherApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}

export const metadata: Metadata = {
  title: 'Hourly Weather Forecast - Hour by Hour Predictions | 16 Bit Weather',
  description: 'Get detailed hourly weather forecasts with temperature, precipitation, wind, and humidity predictions. Plan your day with accurate hour-by-hour weather data.',
  keywords: 'hourly weather, hourly forecast, hour by hour weather, weather by hour, detailed forecast, weather predictions, hourly temperature, hourly precipitation, weather timeline',
  openGraph: {
    title: 'Hourly Weather Forecast - 16 Bit Weather',
    description: 'Detailed hourly weather forecasts with temperature, precipitation, wind, and humidity predictions.',
    url: 'https://www.16bitweather.co/hourly',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=Hourly+Forecast&subtitle=Hour+by+Hour+Predictions',
        width: 1200,
        height: 630,
        alt: 'Hourly Forecast - 16 Bit Weather',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hourly Weather Forecast - 16 Bit Weather',
    description: 'Hour by hour weather predictions with detailed data',
    images: ['/api/og?title=Hourly+Forecast&subtitle=Hour+by+Hour+Predictions'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/hourly',
  },
  other: {
    'application/ld+json': JSON.stringify(hourlyJsonLd),
  },
}

export default function HourlyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

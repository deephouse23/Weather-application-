/**
 * 16-Bit Weather Platform - Radar Page Layout
 * SEO metadata for NOAA MRMS weather radar
 */

import type { Metadata } from 'next'

// Force dynamic rendering to avoid edge function size limits
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Live Weather Radar Map - NOAA MRMS Radar | 16 Bit Weather',
  description: 'Real-time NOAA MRMS weather radar with high-resolution precipitation tracking. View live rain, snow, and storm data across the United States in retro terminal style.',
  keywords: 'weather radar, NOAA radar, MRMS radar, live radar, precipitation map, rain radar, storm tracker, doppler radar, US weather radar, real-time radar',
  openGraph: {
    title: 'Live Weather Radar - 16 Bit Weather',
    description: 'Real-time NOAA MRMS weather radar with high-resolution precipitation tracking across the US.',
    url: 'https://www.16bitweather.co/radar',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=Live+Weather+Radar&subtitle=NOAA+MRMS+Precipitation+Map',
        width: 1200,
        height: 630,
        alt: 'Live Weather Radar - 16 Bit Weather',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Weather Radar - 16 Bit Weather',
    description: 'Real-time NOAA MRMS weather radar with precipitation tracking',
    images: ['/api/og?title=Live+Weather+Radar&subtitle=NOAA+MRMS+Precipitation+Map'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/radar',
  },
}

export default function RadarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

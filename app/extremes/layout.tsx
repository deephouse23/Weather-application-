/**
 * 16-Bit Weather Platform - Extremes Page Layout
 * SEO metadata for global temperature extremes
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Global Temperature Extremes - Hottest & Coldest Places | 16 Bit Weather',
  description: 'Live tracking of the hottest and coldest places on Earth right now. Real-time global temperature extremes with location data and weather conditions.',
  keywords: 'hottest place on earth, coldest place on earth, temperature extremes, global weather, extreme temperatures, world weather, hottest city today, coldest city today, temperature records',
  openGraph: {
    title: 'Global Temperature Extremes - 16 Bit Weather',
    description: 'Live tracking of the hottest and coldest places on Earth. Real-time global temperature extremes.',
    url: 'https://www.16bitweather.co/extremes',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=Global+Extremes&subtitle=Hottest+and+Coldest+Places',
        width: 1200,
        height: 630,
        alt: 'Global Temperature Extremes - 16 Bit Weather',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Temperature Extremes - 16 Bit Weather',
    description: 'Live tracking of hottest and coldest places on Earth',
    images: ['/api/og?title=Global+Extremes&subtitle=Hottest+and+Coldest+Places'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/extremes',
  },
}

export default function ExtremesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

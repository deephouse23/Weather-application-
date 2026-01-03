/**
 * 16-Bit Weather Platform - About Page Layout
 * SEO metadata for about page
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About 16 Bit Weather - Retro Weather App Story | 16 Bit Weather',
  description: 'Discover the story behind 16 Bit Weather. A passion project combining meteorology with retro 16-bit terminal aesthetics, built with Next.js 16 and real-time weather data.',
  keywords: 'about 16 bit weather, retro weather app, weather app story, next.js weather, terminal weather, pixel weather app, weather developer',
  openGraph: {
    title: 'About - 16 Bit Weather',
    description: 'The story behind 16 Bit Weather. Retro soul meets modern intelligence.',
    url: 'https://www.16bitweather.co/about',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=About&subtitle=Retro+Soul+Modern+Intelligence',
        width: 1200,
        height: 630,
        alt: 'About 16 Bit Weather',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About - 16 Bit Weather',
    description: 'Retro soul meets modern intelligence. The 16 Bit Weather story.',
    images: ['/api/og?title=About&subtitle=Retro+Soul+Modern+Intelligence'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

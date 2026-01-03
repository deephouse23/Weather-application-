/**
 * 16-Bit Weather Platform - Weather Systems Layout
 * SEO metadata for weather systems educational content
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Weather Systems Guide - 16 Storm Types Explained | 16 Bit Weather',
  description: 'Comprehensive guide to 16 major weather systems including cyclones, anticyclones, fronts, hurricanes, and tornadoes. Learn formation, behavior, and weather prediction.',
  keywords: 'weather systems, cyclones, anticyclones, cold front, warm front, hurricanes, tornadoes, storm types, atmospheric pressure, meteorology education, weather patterns, low pressure system, high pressure system',
  openGraph: {
    title: 'Weather Systems Database - 16 Bit Weather',
    description: 'Comprehensive guide to 16 major weather systems. Learn about cyclones, fronts, hurricanes, and more.',
    url: 'https://www.16bitweather.co/weather-systems',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=Weather+Systems&subtitle=16+Storm+Types+Explained',
        width: 1200,
        height: 630,
        alt: 'Weather Systems Guide - 16 Bit Weather',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weather Systems Database - 16 Bit Weather',
    description: 'Guide to 16 major weather systems with formation and behavior data',
    images: ['/api/og?title=Weather+Systems&subtitle=16+Storm+Types+Explained'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/weather-systems',
  },
}

// Article Schema for Weather Systems educational content
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Weather Systems Guide - 16 Major Storm Types Explained',
  description: 'Comprehensive guide to 16 major weather systems including cyclones, anticyclones, fronts, hurricanes, and tornadoes.',
  url: 'https://www.16bitweather.co/weather-systems',
  author: {
    '@type': 'Organization',
    name: '16 Bit Weather',
    url: 'https://www.16bitweather.co',
  },
  publisher: {
    '@type': 'Organization',
    name: '16 Bit Weather',
    url: 'https://www.16bitweather.co',
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.16bitweather.co/weather-systems',
  },
  about: [
    { '@type': 'Thing', name: 'Cyclones' },
    { '@type': 'Thing', name: 'Anticyclones' },
    { '@type': 'Thing', name: 'Weather Fronts' },
    { '@type': 'Thing', name: 'Hurricanes' },
    { '@type': 'Thing', name: 'Tornadoes' },
    { '@type': 'Thing', name: 'Atmospheric Pressure' },
  ],
  educationalLevel: 'General Audience',
  learningResourceType: 'Interactive Guide',
}

export default function WeatherSystemsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {children}
    </>
  )
}

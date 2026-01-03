/**
 * 16-Bit Weather Platform - Cloud Types Layout
 * SEO metadata for cloud atlas educational content
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cloud Types Guide - 13 Cloud Formations Explained | 16 Bit Weather',
  description: 'Learn to identify all 13 cloud types with our interactive cloud atlas. Includes cirrus, cumulus, stratus, cumulonimbus, and rare formations like mammatus and lenticular clouds.',
  keywords: 'cloud types, cloud identification, cirrus clouds, cumulus clouds, stratus clouds, cumulonimbus, cloud atlas, cloud formations, meteorology, weather education, nimbostratus, altocumulus, mammatus clouds, lenticular clouds',
  openGraph: {
    title: '16-Bit Cloud Atlas - Cloud Types Guide',
    description: 'Interactive guide to all 13 cloud types. Learn cloud identification with altitude, temperature, and weather prediction data.',
    url: 'https://www.16bitweather.co/cloud-types',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=Cloud+Types+Guide&subtitle=13+Cloud+Formations+Explained',
        width: 1200,
        height: 630,
        alt: 'Cloud Types Atlas - 16 Bit Weather',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '16-Bit Cloud Atlas - Cloud Types Guide',
    description: 'Interactive guide to all 13 cloud types with identification tips',
    images: ['/api/og?title=Cloud+Types+Guide&subtitle=13+Cloud+Formations+Explained'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/cloud-types',
  },
}

// FAQ Schema for Cloud Types - helps with rich results
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are the 13 cloud types?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The 13 cloud types include 10 main classifications by altitude: High clouds (Cirrus, Cirrostratus, Cirrocumulus), Mid-level clouds (Altocumulus, Altostratus, Nimbostratus), Low clouds (Cumulus, Stratocumulus, Stratus), and vertical development clouds (Cumulonimbus). Plus 3 rare formations: Mammatus, Lenticular, and Noctilucent clouds.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do you identify cirrus clouds?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cirrus clouds are thin, wispy, hair-like streaks found at high altitudes (20,000-40,000 ft). They are made of ice crystals and often indicate fair weather with possible change in 8-10 hours.'
      }
    },
    {
      '@type': 'Question',
      name: 'What cloud type produces thunderstorms?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cumulonimbus clouds produce thunderstorms, lightning, heavy rain, hail, and tornadoes. They extend from near the ground up to 60,000+ feet and are the only cloud type that can produce all forms of severe weather.'
      }
    },
    {
      '@type': 'Question',
      name: 'What are mammatus clouds?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mammatus clouds are rare pouch-like formations that hang from the underside of storm clouds. They form when cold air sinks in downdrafts and often appear after severe thunderstorms have passed.'
      }
    },
    {
      '@type': 'Question',
      name: 'What causes lenticular clouds?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lenticular clouds form when air flows over mountains and creates standing waves. They appear lens or saucer-shaped and remain stationary despite high winds. They are often mistaken for UFOs.'
      }
    }
  ]
}

export default function CloudTypesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}

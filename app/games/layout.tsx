/**
 * 16-Bit Weather Platform - Games Arcade Layout
 * SEO metadata for retro weather games
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Retro Weather Games Arcade - Free 16-Bit Games | 16 Bit Weather',
  description: 'Play free retro-style weather games in authentic 16-bit terminal aesthetics. Weather trivia, arcade classics, puzzle games, and more. No download required.',
  keywords: 'weather games, retro games, 16-bit games, free online games, weather trivia, arcade games, puzzle games, browser games, terminal games, pixel games',
  openGraph: {
    title: 'Games Arcade - 16 Bit Weather',
    description: 'Free retro-style weather games with authentic 16-bit terminal aesthetics. Weather trivia, arcade classics, and more.',
    url: 'https://www.16bitweather.co/games',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=Games+Arcade&subtitle=Free+Retro+Weather+Games',
        width: 1200,
        height: 630,
        alt: 'Retro Games Arcade - 16 Bit Weather',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Games Arcade - 16 Bit Weather',
    description: 'Free retro-style weather games with 16-bit terminal aesthetics',
    images: ['/api/og?title=Games+Arcade&subtitle=Free+Retro+Weather+Games'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/games',
  },
}

// SoftwareApplication Schema for Games
const gamesSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '16 Bit Weather Games Arcade',
  description: 'Free retro-style weather games with authentic 16-bit terminal aesthetics',
  url: 'https://www.16bitweather.co/games',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: '16 Bit Weather',
  },
  genre: ['Arcade', 'Puzzle', 'Trivia', 'Educational'],
  gamePlatform: 'Web Browser',
}

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gamesSchema) }}
      />
      {children}
    </>
  )
}

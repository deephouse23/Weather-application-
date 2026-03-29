import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Weather Blog - Weekly Dispatches | 16 Bit Weather',
  description: 'Weekly weather intelligence from 16bitbot. Space weather reports, severe weather recaps, weather phenomena deep-dives, and climate records in retro terminal style.',
  keywords: 'weather blog, space weather, severe weather, weather education, climate records, 16-bit weather',
  openGraph: {
    title: 'Weather Blog - 16 Bit Weather',
    description: 'Weekly weather intelligence from 16bitbot.',
    url: 'https://www.16bitweather.co/blog',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og/blog?title=Weather+Blog&subtitle=Weekly+Dispatches+from+16bitbot',
        width: 1200,
        height: 630,
        alt: '16 Bit Weather Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weather Blog - 16 Bit Weather',
    description: 'Weekly weather intelligence from 16bitbot.',
    images: ['/api/og/blog?title=Weather+Blog&subtitle=Weekly+Dispatches+from+16bitbot'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

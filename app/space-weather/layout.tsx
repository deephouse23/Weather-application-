import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Space Weather Monitor - Solar Activity & Aurora | 16 Bit Weather',
  description: 'Real-time space weather monitoring. Track solar activity, Kp index, aurora forecast, solar wind conditions, and geomagnetic storm alerts.',
  keywords: 'space weather, solar activity, aurora forecast, Kp index, solar wind, geomagnetic storm, solar flares',
  openGraph: {
    title: 'Space Weather Monitor',
    description: 'Real-time solar activity, Kp index, and aurora forecast.',
    url: 'https://www.16bitweather.co/space-weather',
    siteName: '16 Bit Weather',
    images: [{ url: '/api/og?title=Space+Weather+Monitor&subtitle=Solar+Activity+%2B+Aurora+Forecast', width: 1200, height: 630, alt: 'Space Weather Monitor' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Space Weather Monitor',
    description: 'Real-time solar activity, Kp index, and aurora forecast.',
    images: ['/api/og?title=Space+Weather+Monitor&subtitle=Solar+Activity+%2B+Aurora+Forecast'],
  },
  alternates: { canonical: 'https://www.16bitweather.co/space-weather' },
}

export default function SpaceWeatherLayout({ children }: { children: React.ReactNode }) {
  return children
}

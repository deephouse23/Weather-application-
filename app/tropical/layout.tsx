import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tropical Weather - NHC Outlook & Satellite | 16 Bit Weather',
  description: 'Tropical weather tracking with NHC outlooks, satellite imagery, and sea surface temperature analysis. Monitor Atlantic and Pacific hurricane activity.',
  keywords: 'tropical weather, NHC outlook, hurricane tracker, tropical storm, satellite imagery, sea surface temperature',
  openGraph: {
    title: 'Tropical Weather',
    description: 'NHC outlooks, satellite imagery, and hurricane tracking.',
    url: 'https://www.16bitweather.co/tropical',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/api/og?title=Tropical+Weather&subtitle=NHC+Outlook+%2B+Satellite',
        width: 1200,
        height: 630,
        alt: 'Tropical Weather',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tropical Weather',
    description: 'NHC outlooks, satellite imagery, and hurricane tracking.',
    images: ['/api/og?title=Tropical+Weather&subtitle=NHC+Outlook+%2B+Satellite'],
  },
  alternates: {
    canonical: 'https://www.16bitweather.co/tropical',
  },
}

export default function TropicalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

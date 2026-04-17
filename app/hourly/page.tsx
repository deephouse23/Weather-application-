import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import HourlyClient from './hourly-client'

const BASE_URL = 'https://www.16bitweather.co'

export const metadata: Metadata = {
  title: '48-Hour Forecast | 16 Bit Weather',
  description: 'Hour-by-hour weather forecast for the next 48 hours — temperature, precipitation chance, wind, and conditions in a retro terminal UI.',
  alternates: { canonical: `${BASE_URL}/hourly` },
  // Depends on ?lat/?lon query params — no stable canonical content for indexing.
  robots: { index: false, follow: true },
}

// Depends on runtime searchParams, not static content.
export const dynamic = 'force-dynamic'

export default function HourlyPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" />
            <span className="ml-4 text-xl text-[var(--text)]">Loading hourly forecast...</span>
          </div>
        </div>
      }
    >
      <HourlyClient />
    </Suspense>
  )
}

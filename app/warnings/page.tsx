import type { Metadata } from 'next'
import PageWrapper from '@/components/page-wrapper'
import WarningsClient from './warnings-client'

const BASE_URL = 'https://www.16bitweather.co'

export const metadata: Metadata = {
  title: 'Warnings Command Center — NWS Alerts, SPC Outlook, Storm Reports | 16 Bit Weather',
  description:
    'Live NOAA/NWS active warnings with full instructions, SPC Day 1 outlook context, alert polygons on a map, SPC storm reports, and moderated community observations.',
  alternates: { canonical: `${BASE_URL}/warnings` },
}

export default function WarningsPage() {
  return (
    <PageWrapper>
      <WarningsClient />
    </PageWrapper>
  )
}

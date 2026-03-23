/**
 * 16-Bit Weather Platform - NWS Alerts API Route
 *
 * Returns active NWS alerts with optional state filtering.
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchActiveAlerts, getWISScore } from '@/lib/services/nws-alerts-service'

export async function GET(request: NextRequest) {
  try {
    const area = request.nextUrl.searchParams.get('area') ?? undefined

    const [alerts, wis] = await Promise.all([
      fetchActiveAlerts(),
      getWISScore(),
    ])

    // If area filter provided, filter client-side (NWS API area param can be flaky)
    const filtered = area
      ? alerts.filter((a) => a.areaDesc.toLowerCase().includes(area.toLowerCase()))
      : alerts

    return NextResponse.json({ alerts: filtered, wis, total: filtered.length }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('[Alerts API]', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

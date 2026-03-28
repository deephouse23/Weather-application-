/**
 * 16-Bit Weather Platform - Proton Flux API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches GOES integral proton flux (>= 10 MeV) from NOAA SWPC
 */

import { NextResponse } from 'next/server';

export interface ProtonFluxEntry {
  time: string;
  flux: number;
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      'https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': '16BitWeather/1.0',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`NOAA API returned ${response.status}`);
    }

    const data: Array<{
      time_tag: string;
      satellite: string;
      flux: number;
      energy: string;
    }> = await response.json();

    const series: ProtonFluxEntry[] = [];

    for (const entry of data) {
      // Filter for energy >= 10 MeV only
      const energyValue = parseFloat(entry.energy);
      if (isNaN(energyValue) || energyValue < 10) continue;

      const flux = entry.flux;
      if (flux == null || isNaN(flux)) continue;

      series.push({
        time: entry.time_tag,
        flux,
      });
    }

    return NextResponse.json(
      {
        data: series,
        source: 'NOAA Space Weather Prediction Center (GOES)',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[Proton Flux]', error);

    return NextResponse.json(
      { error: 'Failed to fetch proton flux data' },
      { status: 500 }
    );
  }
}

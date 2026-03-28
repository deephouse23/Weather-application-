/**
 * 16-Bit Weather Platform - Magnetometer API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches GOES magnetometer data (Hp parallel component) from NOAA SWPC
 */

import { NextResponse } from 'next/server';

export interface MagnetometerEntry {
  time: string;
  hp: number;
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      'https://services.swpc.noaa.gov/json/goes/primary/magnetometers-1-day.json',
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
      He: number;
      Hp: number;
      Hn: number;
      total: number;
    }> = await response.json();

    const series: MagnetometerEntry[] = [];

    for (const entry of data) {
      const hp = entry.Hp;
      if (hp == null || isNaN(hp)) continue;

      series.push({
        time: entry.time_tag,
        hp: Math.round(hp * 100) / 100,
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
    console.error('[Magnetometer]', error);

    return NextResponse.json(
      { error: 'Failed to fetch magnetometer data' },
      { status: 500 }
    );
  }
}

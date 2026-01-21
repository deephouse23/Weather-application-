/**
 * 16-Bit Weather Platform - Kp Index API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches Planetary K-index from NOAA SWPC
 */

import { NextResponse } from 'next/server';

export interface KpIndexData {
  timestamp: string;
  current: {
    value: number;
    timeTag: string;
  };
  recent: Array<{
    timeTag: string;
    kp: number;
  }>;
  forecast: {
    expected: number;
    maxExpected: number;
  } | null;
}

export async function GET() {
  try {
    // Fetch both current Kp index and forecast
    const [kpResponse, forecastResponse] = await Promise.allSettled([
      fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 } // Cache for 5 minutes
      }),
      fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json', {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 900 } // Cache for 15 minutes
      })
    ]);

    // Parse Kp index data (array format: [time_tag, Kp, a_running, station_count])
    let currentKp = 0;
    let currentTimeTag = '';
    const recentKp: Array<{ timeTag: string; kp: number }> = [];

    if (kpResponse.status === 'fulfilled' && kpResponse.value.ok) {
      const kpData = await kpResponse.value.json();

      // First row is header, rest is data
      if (Array.isArray(kpData) && kpData.length > 1) {
        // Get last 8 entries (24 hours of 3-hour intervals)
        const dataRows = kpData.slice(1);
        const last8 = dataRows.slice(-8);

        for (const row of last8) {
          if (Array.isArray(row) && row.length >= 2) {
            const timeTag = row[0] as string;
            const kp = parseFloat(row[1] as string) || 0;
            recentKp.push({ timeTag, kp });
          }
        }

        // Current is the last entry
        if (recentKp.length > 0) {
          const last = recentKp[recentKp.length - 1];
          currentKp = last.kp;
          currentTimeTag = last.timeTag;
        }
      }
    }

    // Parse forecast data
    let forecast: KpIndexData['forecast'] = null;
    if (forecastResponse.status === 'fulfilled' && forecastResponse.value.ok) {
      try {
        const forecastData = await forecastResponse.value.json();
        // Forecast is array with time ranges and expected Kp
        if (Array.isArray(forecastData) && forecastData.length > 1) {
          const upcoming = forecastData.slice(1, 9); // Next 24 hours
          let maxKp = 0;
          let sumKp = 0;
          let count = 0;

          for (const row of upcoming) {
            if (Array.isArray(row) && row.length >= 2) {
              const kp = parseFloat(row[1] as string) || 0;
              maxKp = Math.max(maxKp, kp);
              sumKp += kp;
              count++;
            }
          }

          if (count > 0) {
            forecast = {
              expected: Math.round(sumKp / count * 10) / 10,
              maxExpected: maxKp,
            };
          }
        }
      } catch (e) {
        console.error('Error parsing Kp forecast:', e);
      }
    }

    const result: KpIndexData = {
      timestamp: new Date().toISOString(),
      current: {
        value: currentKp,
        timeTag: currentTimeTag,
      },
      recent: recentKp,
      forecast,
    };

    return NextResponse.json({
      data: result,
      source: 'NOAA Space Weather Prediction Center',
    });

  } catch (error) {
    console.error('Kp Index API error:', error);

    return NextResponse.json({
      data: {
        timestamp: new Date().toISOString(),
        current: { value: 0, timeTag: '' },
        recent: [],
        forecast: null,
      },
      source: 'NOAA Space Weather Prediction Center',
      error: 'Unable to fetch live data',
    });
  }
}

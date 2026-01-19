/**
 * 16-Bit Weather Platform - Aviation PIREPs API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches Pilot Reports (PIREPs) from NOAA Aviation Weather Center
 * Includes turbulence, icing, and weather observations
 */

import { NextRequest, NextResponse } from 'next/server';

// PIREP data structure
export interface PIREPData {
  id: string;
  receiptTime: string;
  observationTime: string;
  aircraftRef: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  turbulenceType: string | null;
  turbulenceIntensity: string | null;
  turbulenceBaseFt: number | null;
  turbulenceTopFt: number | null;
  icingType: string | null;
  icingIntensity: string | null;
  icingBaseFt: number | null;
  icingTopFt: number | null;
  tempC: number | null;
  windDir: number | null;
  windSpeedKt: number | null;
  reportType: string;
  rawText: string;
}

export interface PIREPResponse {
  success: boolean;
  data: {
    pireps: PIREPData[];
    fetchedAt: string;
    count: number;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  source: string;
  error?: string;
}

// NOAA AWC cache file for PIREPs (most reliable data source)
const PIREP_CACHE_URL = 'https://aviationweather.gov/data/cache/aircraftreports.cache.csv.gz';

// Parse CSV row, handling quoted values
function parseCSVRow(row: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

// Parse a numeric value, return null if invalid
function parseNum(val: string): number | null {
  if (!val || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

// Filter PIREPs within CONUS bounds
const CONUS_BOUNDS = {
  north: 50,
  south: 24,
  east: -66,
  west: -125,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hoursBack = Math.min(parseInt(searchParams.get('hours') || '2', 10), 6);
  const minAltitude = parseInt(searchParams.get('minAltitude') || '0', 10);
  const maxAltitude = parseInt(searchParams.get('maxAltitude') || '60000', 10);
  const turbulenceOnly = searchParams.get('turbulenceOnly') === 'true';

  try {
    // Fetch PIREP cache file
    const response = await fetch(PIREP_CACHE_URL, {
      headers: {
        'Accept-Encoding': 'gzip',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`NOAA API returned ${response.status}`);
    }

    // Decompress gzip response
    const decompressedStream = response.body?.pipeThrough(new DecompressionStream('gzip'));
    const reader = decompressedStream?.getReader();

    if (!reader) {
      throw new Error('Failed to read PIREP data stream');
    }

    // Read and decode the CSV data
    const decoder = new TextDecoder();
    let csvText = '';
    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();
      if (done) {
        reading = false;
      } else {
        csvText += decoder.decode(value, { stream: true });
      }
    }

    // Parse CSV
    const lines = csvText.split('\n');
    const headers = lines[0]?.split(',') || [];

    // Find column indices
    const colIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      colIndex[h.trim()] = i;
    });

    const pireps: PIREPData[] = [];
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const values = parseCSVRow(line);

      // Extract values by column index
      const lat = parseNum(values[colIndex['latitude']]);
      const lon = parseNum(values[colIndex['longitude']]);
      const alt = parseNum(values[colIndex['altitude_ft_msl']]);
      const obsTimeStr = values[colIndex['observation_time']];
      const turbIntensity = values[colIndex['turbulence_intensity']] || null;
      const turbType = values[colIndex['turbulence_type']] || null;

      // Skip if missing required fields
      if (lat === null || lon === null) continue;

      // Filter by CONUS bounds
      if (lat < CONUS_BOUNDS.south || lat > CONUS_BOUNDS.north ||
          lon < CONUS_BOUNDS.west || lon > CONUS_BOUNDS.east) {
        continue;
      }

      // Filter by time
      if (obsTimeStr) {
        const obsTime = new Date(obsTimeStr);
        if (obsTime < cutoffTime) continue;
      }

      // Filter by altitude
      const altitude = alt ?? 0;
      if (altitude < minAltitude || altitude > maxAltitude) continue;

      // Filter turbulence only if requested
      if (turbulenceOnly && !turbIntensity) continue;

      const pirep: PIREPData = {
        id: `pirep-${i}-${Date.now()}`,
        receiptTime: values[colIndex['receipt_time']] || '',
        observationTime: obsTimeStr || '',
        aircraftRef: values[colIndex['aircraft_ref']] || '',
        latitude: lat,
        longitude: lon,
        altitudeFt: altitude,
        turbulenceType: turbType,
        turbulenceIntensity: turbIntensity,
        turbulenceBaseFt: parseNum(values[colIndex['turbulence_base_ft_msl']]),
        turbulenceTopFt: parseNum(values[colIndex['turbulence_top_ft_msl']]),
        icingType: values[colIndex['icing_type']] || null,
        icingIntensity: values[colIndex['icing_intensity']] || null,
        icingBaseFt: parseNum(values[colIndex['icing_base_ft_msl']]),
        icingTopFt: parseNum(values[colIndex['icing_top_ft_msl']]),
        tempC: parseNum(values[colIndex['temp_c']]),
        windDir: parseNum(values[colIndex['wind_dir_degrees']]),
        windSpeedKt: parseNum(values[colIndex['wind_speed_kt']]),
        reportType: values[colIndex['report_type']] || 'PIREP',
        rawText: values[colIndex['raw_text']] || '',
      };

      pireps.push(pirep);
    }

    const result: PIREPResponse = {
      success: true,
      data: {
        pireps,
        fetchedAt: new Date().toISOString(),
        count: pireps.length,
        bounds: CONUS_BOUNDS,
      },
      source: 'NOAA Aviation Weather Center',
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('PIREP API error:', error);

    return NextResponse.json({
      success: false,
      data: {
        pireps: [],
        fetchedAt: new Date().toISOString(),
        count: 0,
        bounds: CONUS_BOUNDS,
      },
      source: 'NOAA Aviation Weather Center',
      error: 'Unable to fetch PIREP data. Please try again later.',
    }, { status: 500 });
  }
}

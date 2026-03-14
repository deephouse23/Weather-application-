/**
 * 16-Bit Weather Platform - SDO Solar Image Proxy
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Proxy route to fetch NASA SDO solar imagery server-side.
 * This avoids DNS resolution issues and CORS problems when
 * browsers try to load images directly from sdo.gsfc.nasa.gov.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Valid wavelength -> filename mappings
const WAVELENGTH_FILES: Record<string, string> = {
  '0304': '0304',
  '0193': '0193',
  '0171': '0171',
  'HMIIF': 'HMIIF',
};

const VALID_SIZES = ['512', '1024'];

/**
 * GET /api/space-weather/sdo-image?wavelength=0304&size=512
 *
 * Fetches the latest SDO image from NASA and returns it.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wavelength = searchParams.get('wavelength');
  const size = searchParams.get('size') || '512';

  if (!wavelength || !WAVELENGTH_FILES[wavelength]) {
    return NextResponse.json(
      { error: `Invalid wavelength. Must be one of: ${Object.keys(WAVELENGTH_FILES).join(', ')}` },
      { status: 400 }
    );
  }

  if (!VALID_SIZES.includes(size)) {
    return NextResponse.json(
      { error: `Invalid size. Must be one of: ${VALID_SIZES.join(', ')}` },
      { status: 400 }
    );
  }

  const filename = `latest_${size}_${WAVELENGTH_FILES[wavelength]}.jpg`;
  const imageUrl = `https://sdo.gsfc.nasa.gov/assets/img/latest/${filename}`;

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': '16BitWeather/1.0 (https://www.16bitweather.co)',
      },
      // Allow up to 10 seconds for NASA servers
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Failed to fetch SDO image: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch SDO image from NASA', status: response.status },
        { status: response.status }
      );
    }

    const imageData = await response.arrayBuffer();

    return new NextResponse(imageData, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Source': 'NASA SDO',
      },
    });
  } catch (error) {
    console.error('Error fetching SDO image:', error);
    return NextResponse.json(
      { error: 'Unable to reach NASA SDO servers' },
      { status: 502 }
    );
  }
}

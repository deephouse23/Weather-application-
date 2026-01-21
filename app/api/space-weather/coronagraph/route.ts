/**
 * 16-Bit Weather Platform - Coronagraph Frames API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Provides SOHO LASCO coronagraph image URLs for animation
 */

import { NextResponse } from 'next/server';

export interface CoronagraphFrame {
  timestamp: string;
  url: string;
  camera: 'c2' | 'c3';
}

export interface CoronagraphData {
  timestamp: string;
  latestC2: string;
  latestC3: string;
  frames: {
    c2: CoronagraphFrame[];
    c3: CoronagraphFrame[];
  };
  frameCount: {
    c2: number;
    c3: number;
  };
}

// Generate frame URLs for animation
// LASCO updates approximately every 12 minutes
function generateFrameUrls(camera: 'c2' | 'c3', count: number = 12): CoronagraphFrame[] {
  const frames: CoronagraphFrame[] = [];
  const now = new Date();

  // Generate timestamps for last ~2-3 hours (12 frames at 12-min intervals)
  for (let i = count - 1; i >= 0; i--) {
    const frameTime = new Date(now.getTime() - i * 12 * 60 * 1000);

    // Format for SOHO archive (uses UTC)
    const year = frameTime.getUTCFullYear();
    const month = String(frameTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(frameTime.getUTCDate()).padStart(2, '0');
    const hour = String(frameTime.getUTCHours()).padStart(2, '0');
    const minute = String(Math.floor(frameTime.getUTCMinutes() / 12) * 12).padStart(2, '0');

    frames.push({
      timestamp: frameTime.toISOString(),
      url: `https://soho.nascom.nasa.gov/data/realtime/${camera}/512/${year}${month}${day}_${hour}${minute}_${camera}_512.jpg`,
      camera,
    });
  }

  return frames;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const camera = searchParams.get('camera') as 'c2' | 'c3' | null;
    const frameCount = parseInt(searchParams.get('frames') || '12', 10);

    // Limit frame count to reasonable range
    const safeFrameCount = Math.min(Math.max(frameCount, 6), 24);

    // SOHO LASCO latest images (always available)
    const latestC2 = 'https://soho.nascom.nasa.gov/data/realtime/c2/512/latest.jpg';
    const latestC3 = 'https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg';

    let c2Frames: CoronagraphFrame[] = [];
    let c3Frames: CoronagraphFrame[] = [];

    // Generate frame URLs based on requested camera
    if (!camera || camera === 'c2') {
      c2Frames = generateFrameUrls('c2', safeFrameCount);
    }
    if (!camera || camera === 'c3') {
      c3Frames = generateFrameUrls('c3', safeFrameCount);
    }

    const result: CoronagraphData = {
      timestamp: new Date().toISOString(),
      latestC2,
      latestC3,
      frames: {
        c2: c2Frames,
        c3: c3Frames,
      },
      frameCount: {
        c2: c2Frames.length,
        c3: c3Frames.length,
      },
    };

    return NextResponse.json({
      data: result,
      source: 'SOHO LASCO (NASA/ESA)',
      note: 'LASCO C2 shows 1.5-6 solar radii, C3 shows 3.5-30 solar radii. Frame timestamps are approximations - actual image availability varies.',
    });

  } catch (error) {
    console.error('Coronagraph API error:', error);

    return NextResponse.json({
      data: {
        timestamp: new Date().toISOString(),
        latestC2: 'https://soho.nascom.nasa.gov/data/realtime/c2/512/latest.jpg',
        latestC3: 'https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg',
        frames: { c2: [], c3: [] },
        frameCount: { c2: 0, c3: 0 },
      },
      source: 'SOHO LASCO (NASA/ESA)',
      error: 'Unable to generate frame URLs',
    });
  }
}

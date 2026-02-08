/**
 * 16-Bit Weather Platform - NASA DONKI CME API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches Coronal Mass Ejection data from NASA DONKI
 */

import { NextResponse } from 'next/server';

interface CMEAnalysis {
  time21_5: string;
  latitude: number;
  longitude: number;
  halfAngle: number;
  speed: number;
  type: string;
  isMostAccurate: boolean;
  levelOfData: number;
}

interface NasaCME {
  activityID: string;
  catalog: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  link: string;
  note: string;
  instruments: { displayName: string }[];
  cmeAnalyses: CMEAnalysis[];
}

interface CMEEvent {
  id: string;
  startTime: string;
  sourceLocation: string;
  activeRegion: number | null;
  speed: number;
  halfAngle: number;
  type: string;
  isEarthDirected: boolean;
  instruments: string[];
  note: string;
}

// Check if CME is Earth-directed based on longitude
function isEarthDirected(longitude: number | null, halfAngle: number): boolean {
  if (longitude === null) return false;
  // CME is potentially Earth-directed if it's within the half-angle cone from Sun-Earth line
  // Earth is at 0° longitude (central meridian)
  return Math.abs(longitude) <= halfAngle + 30; // Adding buffer for uncertainty
}

// Parse source location string to get longitude
function parseSourceLongitude(sourceLocation: string): number | null {
  if (!sourceLocation) return null;
  // Format like "N24E15" or "S10W30"
  const match = sourceLocation.match(/([EW])(\d+)/);
  if (!match) return null;
  const direction = match[1];
  const value = parseInt(match[2], 10);
  return direction === 'W' ? -value : value;
}

export async function GET() {
  try {
    // NASA DONKI API - free, no auth required for basic access
    // Get CMEs from last 7 days
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const apiKey = process.env.NASA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NASA API key not configured', events: [], summary: { total: 0, earthDirected: 0, fastest: 0, averageSpeed: 0 }, updatedAt: new Date().toISOString() },
        { status: 503 }
      );
    }
    const url = `https://api.nasa.gov/DONKI/CME?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&api_key=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`NASA API returned ${response.status}`);
    }

    const data: NasaCME[] = await response.json();

    // Transform the data
    const cmeEvents: CMEEvent[] = data
      .filter((cme) => cme.cmeAnalyses && cme.cmeAnalyses.length > 0)
      .map((cme) => {
        // Get the most accurate analysis
        const analysis = cme.cmeAnalyses.find((a) => a.isMostAccurate) || cme.cmeAnalyses[0];
        const longitude = parseSourceLongitude(cme.sourceLocation);

        return {
          id: cme.activityID,
          startTime: cme.startTime,
          sourceLocation: cme.sourceLocation || 'Unknown',
          activeRegion: cme.activeRegionNum,
          speed: analysis?.speed || 0,
          halfAngle: analysis?.halfAngle || 0,
          type: analysis?.type || 'Unknown',
          isEarthDirected: isEarthDirected(longitude, analysis?.halfAngle || 45),
          instruments: cme.instruments?.map((i) => i.displayName) || [],
          note: cme.note || '',
        };
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    // Summary statistics
    const summary = {
      total: cmeEvents.length,
      earthDirected: cmeEvents.filter((c) => c.isEarthDirected).length,
      fastest: cmeEvents.length > 0 ? Math.max(...cmeEvents.map((c) => c.speed)) : 0,
      averageSpeed: cmeEvents.length > 0
        ? Math.round(cmeEvents.reduce((sum, c) => sum + c.speed, 0) / cmeEvents.length)
        : 0,
    };

    return NextResponse.json({
      events: cmeEvents.slice(0, 20), // Limit to most recent 20
      summary,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching CME data:', error);

    // Return fallback data
    return NextResponse.json({
      events: [],
      summary: {
        total: 0,
        earthDirected: 0,
        fastest: 0,
        averageSpeed: 0,
      },
      updatedAt: new Date().toISOString(),
      error: 'Failed to fetch CME data from NASA DONKI',
    }, { status: 500 });
  }
}

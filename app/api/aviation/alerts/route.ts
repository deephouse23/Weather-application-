/**
 * 16-Bit Weather Platform - Aviation Alerts API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches SIGMET/AIRMET data from NOAA Aviation Weather Center
 */

import { NextResponse } from 'next/server';

interface AWCAlert {
  airsigmetId: number;
  icaoId: string;
  receiptTime: string;
  validTimeFrom: string;
  validTimeTo: string;
  rawAirSigmet: string;
  hazard: string;
  severity: string;
  airsigmetType: string;
  altitudeLow1: number;
  altitudeHi1: number;
  movementDir?: number;
  movementSpd?: number;
}

interface ParsedAlert {
  id: string;
  type: 'SIGMET' | 'AIRMET' | 'CWA' | 'PIREP';
  severity: 'low' | 'moderate' | 'severe' | 'extreme';
  hazard: string;
  region: string;
  validFrom: string;
  validTo: string;
  text: string;
  rawText: string;
}

// Map NOAA hazard types to severity levels
function mapSeverity(hazard: string, severity: string): ParsedAlert['severity'] {
  const hazardLower = hazard.toLowerCase();
  const severityLower = severity?.toLowerCase() || '';

  if (hazardLower.includes('extreme') || severityLower.includes('extreme')) {
    return 'extreme';
  }
  if (hazardLower.includes('severe') || severityLower.includes('sev')) {
    return 'severe';
  }
  if (hazardLower.includes('moderate') || severityLower.includes('mod')) {
    return 'moderate';
  }
  return 'low';
}

// Format timestamp to readable format
function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16).replace('T', ' ') + 'Z';
  } catch {
    return isoString;
  }
}

// Parse alert type
function parseAlertType(typeStr: string): ParsedAlert['type'] {
  const upper = typeStr.toUpperCase();
  if (upper.includes('SIGMET')) return 'SIGMET';
  if (upper.includes('AIRMET')) return 'AIRMET';
  if (upper.includes('CWA')) return 'CWA';
  if (upper.includes('PIREP')) return 'PIREP';
  return 'AIRMET';
}

// Clean up hazard description
function formatHazard(hazard: string): string {
  const hazardMap: Record<string, string> = {
    'TURB': 'Turbulence',
    'TURB-HI': 'High-Altitude Turbulence',
    'TURB-LO': 'Low-Altitude Turbulence',
    'ICE': 'Icing',
    'ICE-SEV': 'Severe Icing',
    'IFR': 'IFR Conditions',
    'MTN OBSCN': 'Mountain Obscuration',
    'CONVECTIVE': 'Convective Activity',
    'TS': 'Thunderstorms',
    'VOLCANIC ASH': 'Volcanic Ash',
    'ASH': 'Volcanic Ash',
    'LLWS': 'Low-Level Wind Shear',
    'SFC WND': 'Surface Wind',
    'MTW': 'Mountain Wave',
  };

  const upper = hazard.toUpperCase().trim();
  return hazardMap[upper] || hazard.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export async function GET() {
  try {
    // Fetch from NOAA Aviation Weather Center API
    // Using the official AWC API endpoint for SIGMETs and AIRMETs
    const [sigmetResponse, airmetResponse] = await Promise.allSettled([
      fetch('https://aviationweather.gov/api/data/airsigmet?format=json&type=sigmet', {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 } // Cache for 5 minutes
      }),
      fetch('https://aviationweather.gov/api/data/airsigmet?format=json&type=airmet', {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 }
      })
    ]);

    const alerts: ParsedAlert[] = [];

    // Process SIGMET data
    if (sigmetResponse.status === 'fulfilled' && sigmetResponse.value.ok) {
      try {
        const sigmetData: AWCAlert[] = await sigmetResponse.value.json();
        if (Array.isArray(sigmetData)) {
          for (const alert of sigmetData.slice(0, 10)) {
            alerts.push({
              id: `sigmet-${alert.airsigmetId}`,
              type: 'SIGMET',
              severity: mapSeverity(alert.hazard || '', alert.severity || ''),
              hazard: formatHazard(alert.hazard || 'Unknown'),
              region: alert.icaoId || 'CONUS',
              validFrom: formatTime(alert.validTimeFrom),
              validTo: formatTime(alert.validTimeTo),
              text: `${formatHazard(alert.hazard || 'Unknown')} from FL${alert.altitudeLow1 || 0} to FL${alert.altitudeHi1 || 450}`,
              rawText: alert.rawAirSigmet || ''
            });
          }
        }
      } catch (parseError) {
        console.error('Error parsing SIGMET data:', parseError);
      }
    }

    // Process AIRMET data
    if (airmetResponse.status === 'fulfilled' && airmetResponse.value.ok) {
      try {
        const airmetData: AWCAlert[] = await airmetResponse.value.json();
        if (Array.isArray(airmetData)) {
          for (const alert of airmetData.slice(0, 10)) {
            alerts.push({
              id: `airmet-${alert.airsigmetId}`,
              type: 'AIRMET',
              severity: mapSeverity(alert.hazard || '', alert.severity || ''),
              hazard: formatHazard(alert.hazard || 'Unknown'),
              region: alert.icaoId || 'CONUS',
              validFrom: formatTime(alert.validTimeFrom),
              validTo: formatTime(alert.validTimeTo),
              text: `${formatHazard(alert.hazard || 'Unknown')} from FL${alert.altitudeLow1 || 0} to FL${alert.altitudeHi1 || 180}`,
              rawText: alert.rawAirSigmet || ''
            });
          }
        }
      } catch (parseError) {
        console.error('Error parsing AIRMET data:', parseError);
      }
    }

    // Sort by severity (most severe first)
    const severityOrder = { extreme: 0, severe: 1, moderate: 2, low: 3 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return NextResponse.json({
      alerts,
      timestamp: new Date().toISOString(),
      source: 'NOAA Aviation Weather Center',
      count: alerts.length
    });

  } catch (error) {
    console.error('Aviation alerts API error:', error);

    // Return fallback data if API fails
    return NextResponse.json({
      alerts: [],
      timestamp: new Date().toISOString(),
      source: 'NOAA Aviation Weather Center',
      count: 0,
      error: 'Unable to fetch live data. Please try again later.'
    });
  }
}

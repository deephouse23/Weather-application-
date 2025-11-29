/**
 * 16-Bit Weather Platform - RSS Proxy API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Server-side proxy for RSS feeds that may have CORS restrictions
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Cache configuration
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds
const STALE_WHILE_REVALIDATE = 3600; // 1 hour

// Allowed domains for security
const ALLOWED_DOMAINS = [
  'nasa.gov',
  'noaa.gov',
  'weather.gov',
  'nhc.noaa.gov',
  'spc.noaa.gov',
  'swpc.noaa.gov',
  'jpl.nasa.gov',
  'esa.int',
  'space.com',
  'spacenews.com',
  'spaceflightnow.com',
  'phys.org',
  'sciencedaily.com',
  'arstechnica.com',
  'metoffice.gov.uk',
  'bom.gov.au',
  'earthobservatory.nasa.gov',
  'climate.gov',
  'ncei.noaa.gov',
];

/**
 * Validate URL is from allowed domain
 */
function isAllowedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some((domain) => hostname.endsWith(domain));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Validate URL is from allowed domain
    if (!isAllowedDomain(targetUrl)) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // Fetch the RSS feed
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'User-Agent': '16BitWeather/1.0',
      },
      next: { revalidate: CACHE_DURATION },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch RSS feed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    // Return the XML content with appropriate headers
    return new NextResponse(xmlText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('RSS Proxy Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to proxy RSS feed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

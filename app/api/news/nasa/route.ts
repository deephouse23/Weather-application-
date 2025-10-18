/**
 * 16-Bit Weather Platform - NASA News API Proxy
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNASAWeatherNews } from '@/lib/services/nasaService';

const CACHE_DURATION = 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxItems = parseInt(searchParams.get('maxItems') || '15');

    const news = await fetchAllNASAWeatherNews(maxItems);

    return NextResponse.json(
      { status: 'ok', items: news, count: news.length },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=86400`,
        },
      }
    );
  } catch (error) {
    console.error('[NASA API] Error:', error);
    return NextResponse.json(
      { status: 'error', items: [], count: 0 },
      { status: 200 }
    );
  }
}

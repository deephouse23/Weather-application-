/**
 * 16-Bit Weather Platform - FOX Weather API Proxy
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllFOXWeatherNews } from '@/lib/services/foxWeatherService';

const CACHE_DURATION = 15 * 60; // 15 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxItems = parseInt(searchParams.get('maxItems') || '20');

    const news = await fetchAllFOXWeatherNews(maxItems);

    return NextResponse.json(
      { status: 'ok', items: news, count: news.length },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=3600`,
        },
      }
    );
  } catch (error) {
    console.error('[FOX API] Error:', error);
    return NextResponse.json(
      { status: 'error', items: [], count: 0 },
      { status: 200 }
    );
  }
}

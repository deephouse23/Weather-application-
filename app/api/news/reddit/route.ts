/**
 * 16-Bit Weather Platform - Reddit Weather API Proxy
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllRedditWeatherNews } from '@/lib/services/redditService';

const CACHE_DURATION = 10 * 60; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxItems = parseInt(searchParams.get('maxItems') || '30');

    const news = await fetchAllRedditWeatherNews(maxItems);

    return NextResponse.json(
      { status: 'ok', items: news, count: news.length },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=1800`,
        },
      }
    );
  } catch (error) {
    console.error('[REDDIT API] Error:', error);
    return NextResponse.json(
      { status: 'error', items: [], count: 0 },
      { status: 200 }
    );
  }
}

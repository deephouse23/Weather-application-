/**
 * 16-Bit Weather Platform - News Aggregation API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Server-side API route for aggregating news from multiple sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { aggregateNews, getFeaturedStory, AggregatedNewsOptions } from '@/lib/services/newsAggregator';
import type { NewsCategory, NewsPriority, NewsSource } from '@/lib/types/news';

// Cache configuration
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds
const STALE_WHILE_REVALIDATE = 3600; // 1 hour

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const categoriesParam = searchParams.get('categories');
    const priorityParam = searchParams.get('priority');
    const sourcesParam = searchParams.get('sources');
    const maxItemsParam = searchParams.get('maxItems');
    const maxAgeParam = searchParams.get('maxAge');
    const featuredParam = searchParams.get('featured');

    // Handle featured story request
    if (featuredParam === 'true') {
      const featured = await getFeaturedStory();

      if (!featured) {
        return NextResponse.json(
          { status: 'ok', featured: null },
          {
            status: 200,
            headers: {
              'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
            },
          }
        );
      }

      return NextResponse.json(
        { status: 'ok', featured },
        {
          status: 200,
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
            'X-Response-Time': String(Date.now() - startTime),
          },
        }
      );
    }

    // Build aggregation options
    const options: AggregatedNewsOptions = {
      maxItems: maxItemsParam ? parseInt(maxItemsParam) : 30,
      maxAge: maxAgeParam ? parseInt(maxAgeParam) : 72,
    };

    // Parse categories
    if (categoriesParam) {
      const cats = categoriesParam.split(',').filter(Boolean);
      // Type assertion needed because AggregatedNewsOptions uses a subset of NewsCategory
      options.categories = cats as ('breaking' | 'weather' | 'local' | 'general')[];
    }

    // Parse priority
    if (priorityParam && priorityParam !== 'all') {
      options.priority = priorityParam as NewsPriority;
    }

    // Parse sources
    if (sourcesParam) {
      const srcs = sourcesParam.split(',').filter(Boolean);
      // Type assertion needed because AggregatedNewsOptions uses a subset of NewsSource
      options.sources = srcs as ('noaa' | 'nasa' | 'reddit' | 'newsapi' | 'gfs')[];
    }

    // Aggregate news from all sources
    const result = await aggregateNews(options);

    // Return aggregated news
    return NextResponse.json(
      {
        status: 'ok',
        ...result,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          'X-Response-Time': String(Date.now() - startTime),
          'X-Cache-Hit': String(result.cacheHit),
          'X-Total-Fetched': String(result.totalFetched),
          'X-Total-Included': String(result.totalIncluded),
        },
      }
    );
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`[NEWS AGGREGATE API] Error after ${errorTime}ms:`, error);

    // Return graceful error response
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to aggregate news',
        items: [],
        stats: [],
        totalFetched: 0,
        totalIncluded: 0,
        cacheHit: false,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION * 2}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          'X-Response-Time': String(errorTime),
        },
      }
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

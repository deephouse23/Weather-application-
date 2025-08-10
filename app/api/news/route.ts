/**
 * 16-Bit Weather Platform - News API Route
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Server-side proxy for NewsAPI to avoid CORS issues in production
 */

import { NextRequest, NextResponse } from 'next/server';

// Cache configuration
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds

// NewsAPI configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
const NEWS_API_URL = 'https://newsapi.org/v2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'top-headlines';
    const category = searchParams.get('category') || '';
    const q = searchParams.get('q') || '';
    const country = searchParams.get('country') || 'us';
    const pageSize = searchParams.get('pageSize') || '5';

    // Check if API key is configured
    if (!NEWS_API_KEY) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'News API key not configured',
          articles: [] 
        },
        { status: 500 }
      );
    }

    // Build the NewsAPI URL based on endpoint
    let apiUrl = `${NEWS_API_URL}/${endpoint}?`;
    
    if (endpoint === 'everything') {
      if (q) apiUrl += `q=${encodeURIComponent(q)}&`;
      apiUrl += `sortBy=publishedAt&`;
    } else {
      // top-headlines
      apiUrl += `country=${country}&`;
      if (category && category !== 'all') {
        apiUrl += `category=${category}&`;
      }
    }
    
    apiUrl += `pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    // Fetch from NewsAPI
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Next.js caching
      next: { revalidate: CACHE_DURATION }
    });

    if (!response.ok) {
      console.error('NewsAPI error:', response.status, response.statusText);
      
      // Handle specific NewsAPI errors
      if (response.status === 426) {
        return NextResponse.json(
          { 
            status: 'error',
            message: 'NewsAPI requires paid plan for this request',
            articles: [] 
          },
          { status: 426 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { 
            status: 'error',
            message: 'Rate limit exceeded. Please try again later.',
            articles: [] 
          },
          { status: 429 }
        );
      }
      
      throw new Error(`NewsAPI returned ${response.status}`);
    }

    const data = await response.json();

    // Add CORS headers for client-side access
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
      },
    });

  } catch (error) {
    console.error('Error in news API route:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to fetch news',
        articles: [] 
      },
      { status: 500 }
    );
  }
}

// Also export OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
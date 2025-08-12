/**
 * 16-Bit Weather Platform - News API Route v0.3.32
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Server-side proxy for NewsAPI with rate limiting and caching
 */

import { NextRequest, NextResponse } from 'next/server';

// Cache configuration - Increased to reduce API calls
const CACHE_DURATION = 15 * 60; // 15 minutes
const STALE_WHILE_REVALIDATE = 86400; // 24 hours

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max requests per minute per client

// In-memory rate limit store (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// NewsAPI configuration - Server-side only
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NEWS_API_URL = 'https://newsapi.org/v2';

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const limit = rateLimitStore.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { 
      allowed: true, 
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetTime: now + RATE_LIMIT_WINDOW
    };
  }

  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: limit.resetTime
    };
  }

  limit.count++;
  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - limit.count,
    resetTime: limit.resetTime
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get client identifier for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientId = forwardedFor?.split(',')[0] || realIp || 'default';

    // Check rate limit
    const rateLimit = checkRateLimit(clientId);
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      console.log(`[NEWS API] Rate limit exceeded for ${clientId}. Retry after ${retryAfter}s`);
      
      return NextResponse.json(
        { 
          status: 'error',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait before trying again.',
          articles: [],
          totalResults: 0,
          retryAfter: retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetTime),
            'Cache-Control': 'no-store'
          }
        }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'top-headlines';
    const category = searchParams.get('category') || '';
    const q = searchParams.get('q') || '';
    const country = searchParams.get('country') || 'us';
    const domains = searchParams.get('domains') || '';
    const language = searchParams.get('language') || 'en';
    const pageSize = searchParams.get('pageSize') || '10';

    console.log(`[NEWS API] Request: endpoint=${endpoint}, category=${category}, q=${q?.substring(0, 50)}`);

    // Check if API key is configured
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_actual_news_api_key_here') {
      console.warn('[NEWS API] NEWS_API_KEY not configured properly');
      return NextResponse.json(
        { 
          status: 'ok',
          source: 'cache',
          message: 'News service configuration pending',
          articles: [],
          totalResults: 0
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-News-Source': 'fallback'
          }
        }
      );
    }

    // Build NewsAPI URL
    let apiUrl = `${NEWS_API_URL}/${endpoint}?`;
    
    if (endpoint === 'everything') {
      // For search queries
      if (q) apiUrl += `q=${encodeURIComponent(q)}&`;
      if (domains) apiUrl += `domains=${domains}&`;
      apiUrl += `language=${language}&`;
      apiUrl += `sortBy=publishedAt&`;
    } else {
      // For top headlines
      apiUrl += `country=${country}&`;
      if (category && category !== 'all') {
        apiUrl += `category=${category}&`;
      }
      if (q) apiUrl += `q=${encodeURIComponent(q)}&`;
    }
    
    apiUrl += `pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    // Fetch from NewsAPI with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    console.log(`[NEWS API] Fetching from NewsAPI...`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': '16BitWeather/1.0'
      },
      signal: controller.signal,
      next: { revalidate: CACHE_DURATION }
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;
    console.log(`[NEWS API] Response: status=${response.status}, time=${responseTime}ms`);

    if (!response.ok) {
      console.error(`[NEWS API] Error: ${response.status} ${response.statusText}`);
      
      // Handle specific NewsAPI errors gracefully
      if (response.status === 426) {
        // Upgrade required (paid plan needed)
        return NextResponse.json(
          { 
            status: 'ok',
            source: 'limited',
            message: 'Premium news features not available',
            articles: [],
            totalResults: 0
          },
          { 
            status: 200,
            headers: {
              'Cache-Control': `public, s-maxage=${CACHE_DURATION * 4}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
              'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
              'X-RateLimit-Remaining': String(rateLimit.remaining),
              'X-News-Source': 'limited'
            }
          }
        );
      }
      
      if (response.status === 429) {
        // NewsAPI rate limit
        return NextResponse.json(
          { 
            status: 'ok',
            source: 'cached',
            message: 'News temporarily limited - using cached data',
            articles: [],
            totalResults: 0
          },
          { 
            status: 200,
            headers: {
              'Cache-Control': `public, s-maxage=${CACHE_DURATION * 6}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
              'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
              'X-RateLimit-Remaining': String(rateLimit.remaining),
              'X-News-Source': 'cached'
            }
          }
        );
      }
      
      // Other errors
      throw new Error(`NewsAPI returned ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`[NEWS API] Success: ${data.articles?.length || 0} articles returned`);

    // Success response with proper caching
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetTime),
        'X-News-Source': 'newsapi',
        'X-Response-Time': String(responseTime)
      },
    });

  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error(`[NEWS API] Request timeout after ${errorTime}ms`);
    } else {
      console.error(`[NEWS API] Error after ${errorTime}ms:`, error.message);
    }
    
    // Always return graceful degradation to prevent UI breaks
    return NextResponse.json(
      { 
        status: 'ok',
        source: 'fallback',
        message: 'News temporarily unavailable',
        articles: [],
        totalResults: 0
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION * 2}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          'X-News-Source': 'fallback',
          'X-Response-Time': String(errorTime)
        }
      }
    );
  }
}

// CORS preflight
export async function OPTIONS(request: NextRequest) {
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

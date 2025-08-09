/**
 * API Route for Temperature Extremes
 * Version 0.3.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchExtremeTemperatures, getCachedExtremes, setCachedExtremes } from '@/lib/extremes/extremes-data';

export async function GET(request: NextRequest) {
  try {
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenWeatherMap API key not configured' },
        { status: 500 }
      );
    }
    
    // Get user coordinates from query params (optional)
    const searchParams = request.nextUrl.searchParams;
    const userLat = searchParams.get('lat');
    const userLon = searchParams.get('lon');
    
    // Check cache first
    const cached = getCachedExtremes();
    if (cached && !userLat && !userLon) {
      // Return cached data if no user location specified
      return NextResponse.json(cached);
    }
    
    // Fetch fresh data
    const extremesData = await fetchExtremeTemperatures(
      apiKey,
      userLat ? parseFloat(userLat) : undefined,
      userLon ? parseFloat(userLon) : undefined
    );
    
    // Cache the results
    setCachedExtremes(extremesData);
    
    return NextResponse.json(extremesData);
  } catch (error) {
    console.error('Error in extremes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extreme temperatures' },
      { status: 500 }
    );
  }
}

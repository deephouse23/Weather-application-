/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * AI Chat API Route
 * Handles chat requests with rate limiting, authentication, and real-time weather data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getWeatherChatResponse, isSimpleLocationSearch, type AIPersonality } from '@/lib/services/claude-service';
import { checkRateLimit, getRateLimitStatus } from '@/lib/services/chat-rate-limiter';
import { saveMessage, getRecentMessages } from '@/lib/services/chat-history-service';

// Get user from request
async function getAuthenticatedUser(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return null;
    }

    return user;
}

// Extract location from user message using simple patterns
// Note: Patterns are optimized to avoid ReDoS vulnerabilities
function extractLocationFromMessage(message: string): string | null {
    // Limit input length to prevent DoS
    const safeMessage = message.slice(0, 200);

    // Time-related words to exclude from location names
    const timeWords = ['today', 'tomorrow', 'this', 'next', 'right', 'currently', 'two', 'three', 'four', 'five', 'six', 'seven', 'few', 'couple'];

    // Pattern 1: "in/for/at [location]" - extract words after preposition
    // Look for preposition followed by capitalized words (location names)
    // Supports punctuated names like Winston-Salem, St. Louis, O'Fallon, Coeur d'Alene
    const prepMatch = safeMessage.match(/\b(?:in|for|at)\s+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*)/);
    if (prepMatch?.[1]) {
        const loc = prepMatch[1].trim();
        // Filter out if it's just time words
        const firstWord = loc.split(' ')[0].toLowerCase();
        if (loc.length > 2 && !timeWords.includes(firstWord) && !['the', 'a', 'an'].includes(firstWord)) {
            return loc;
        }
    }

    // Pattern 2: "City, ST" format (e.g., "Denver, CO", "St. Louis, MO", "Winston-Salem, NC")
    const cityStateMatch = safeMessage.match(/\b([A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*),\s*([A-Z]{2})\b/);
    if (cityStateMatch) {
        return `${cityStateMatch[1]}, ${cityStateMatch[2]}`;
    }

    // Pattern 3: "[Location] weather" format (handles McAllen, St. Louis, Winston-Salem)
    const weatherMatch = safeMessage.match(/\b([A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*)\s+weather\b/i);
    if (weatherMatch?.[1]) {
        return weatherMatch[1];
    }

    // Pattern 4: Look for known location pattern - multiple capitalized words together
    // This catches "South Lake Tahoe", "St. Louis", "Winston-Salem" even without "in" prefix
    const capitalizedWords = safeMessage.match(/\b([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,3})\b/);
    if (capitalizedWords?.[1]) {
        const loc = capitalizedWords[1];
        const firstWord = loc.split(' ')[0].toLowerCase();
        // Exclude articles and common sentence-start words that aren't locations
        if (!timeWords.includes(firstWord) && !['the', 'a', 'an', 'what', 'how', 'when', 'will', 'is', 'are', 'do', 'does', 'can', 'should'].includes(firstWord)) {
            return loc;
        }
    }

    return null;
}


// Geocode a location using OpenWeatherMap
// Prioritizes US locations since the app is US-focused
async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        console.error('[Chat API] No OpenWeather API key');
        return null;
    }

    try {
        // Try with US suffix first for better US location matching
        const locationWithUS = location.includes(',') ? location : `${location},US`;
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationWithUS)}&limit=1&appid=${apiKey}`;
        console.log(`[Chat API] Geocoding: ${locationWithUS}`);

        let response = await fetch(url);
        let data = response.ok ? await response.json() : [];

        // If no US results, try without country code
        if (!data || data.length === 0) {
            console.log(`[Chat API] No US results, trying generic: ${location}`);
            const fallbackUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
            response = await fetch(fallbackUrl);
            data = response.ok ? await response.json() : [];
        }

        if (!data || data.length === 0) {
            console.log(`[Chat API] No geocoding results for: ${location}`);
            return null;
        }

        const result = {
            lat: data[0].lat,
            lon: data[0].lon,
            name: data[0].state ? `${data[0].name}, ${data[0].state}` : data[0].name
        };
        console.log(`[Chat API] Geocoded to:`, result);
        return result;
    } catch (error) {
        console.error('[Chat API] Geocoding error:', error);
        return null;
    }
}

// Fetch current weather from OpenWeatherMap
async function fetchCurrentWeather(lat: number, lon: number): Promise<{
    temperature: number;
    condition: string;
    humidity: number;
    wind: string;
    feelsLike: number;
} | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
        console.log(`[Chat API] Fetching weather for: ${lat}, ${lon}`);

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[Chat API] Weather fetch failed: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const result = {
            temperature: Math.round(data.main?.temp || 0),
            condition: data.weather?.[0]?.description || 'unknown',
            humidity: data.main?.humidity || 0,
            wind: `${Math.round(data.wind?.speed || 0)} mph`,
            feelsLike: Math.round(data.main?.feels_like || 0)
        };
        console.log(`[Chat API] Weather data:`, result);
        return result;
    } catch (error) {
        console.error('[Chat API] Weather fetch error:', error);
        return null;
    }
}

// Fetch 8-day forecast from OpenWeatherMap One Call 3.0 API
async function fetchForecast(lat: number, lon: number): Promise<string | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
        // Use One Call 3.0 API for 8-day forecast
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`[Chat API] One Call API failed: ${response.status}, falling back to 5-day`);
            // Fallback to 5-day forecast if One Call fails
            return await fetchForecast5Day(lat, lon);
        }

        const data = await response.json();

        // Extract daily forecasts (up to 8 days)
        const forecastLines: string[] = [];
        for (const day of (data.daily || []).slice(0, 8)) {
            const date = new Date(day.dt * 1000);
            const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const high = Math.round(day.temp?.max || 0);
            const low = Math.round(day.temp?.min || 0);
            const condition = day.weather?.[0]?.main || 'Clear';
            forecastLines.push(`${dayKey}: ${high}°F/${low}°F, ${condition}`);
        }

        return forecastLines.join(' | ');
    } catch (error) {
        console.error('[Chat API] Forecast fetch error:', error);
        return null;
    }
}

// Fallback 5-day forecast from free tier
async function fetchForecast5Day(lat: number, lon: number): Promise<string | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const dailyForecasts: Map<string, { high: number; low: number; condition: string }> = new Map();

        for (const item of data.list || []) {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const existing = dailyForecasts.get(dayKey);
            const temp = Math.round(item.main?.temp || 0);
            const condition = item.weather?.[0]?.main || 'Clear';

            if (!existing) {
                dailyForecasts.set(dayKey, { high: temp, low: temp, condition });
            } else {
                dailyForecasts.set(dayKey, {
                    high: Math.max(existing.high, temp),
                    low: Math.min(existing.low, temp),
                    condition: existing.condition
                });
            }
        }

        const forecastLines: string[] = [];
        let count = 0;
        for (const [day, forecast] of dailyForecasts) {
            if (count >= 5) break;
            forecastLines.push(`${day}: ${forecast.high}°F/${forecast.low}°F, ${forecast.condition}`);
            count++;
        }

        return forecastLines.join(' | ');
    } catch {
        return null;
    }
}

// Fetch real weather data for a location (current + forecast)
async function fetchWeatherForLocation(location: string): Promise<{
    location: string;
    temperature: number;
    condition: string;
    humidity?: number;
    wind?: string;
    feelsLike?: number;
    forecast?: string;
} | null> {
    // First geocode the location
    const coords = await geocodeLocation(location);
    if (!coords) return null;

    // Fetch current weather and forecast in parallel
    const [weather, forecast] = await Promise.all([
        fetchCurrentWeather(coords.lat, coords.lon),
        fetchForecast(coords.lat, coords.lon)
    ]);

    if (!weather) return null;

    return {
        location: coords.name,
        temperature: weather.temperature,
        condition: weather.condition,
        humidity: weather.humidity,
        wind: weather.wind,
        feelsLike: weather.feelsLike,
        forecast: forecast || undefined
    };
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required for AI chat' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { message, weatherContext: providedContext, personality = 'storm' } = body;
        const aiPersonality: AIPersonality = ['storm', 'sass', 'chill'].includes(personality) ? personality : 'storm';

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Check if this is a simple location search (bypass AI)
        if (isSimpleLocationSearch(message)) {
            return NextResponse.json({
                isSimpleSearch: true,
                location: message.trim()
            });
        }

        // Check rate limit
        const rateLimit = await checkRateLimit(user.id);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    resetAt: rateLimit.resetAt.toISOString(),
                    remaining: 0
                },
                { status: 429 }
            );
        }

        // Try to extract location from message and fetch real weather data
        let weatherContext = providedContext;
        console.log(`[Chat API] Message received: "${message}"`);
        console.log(`[Chat API] Provided context:`, providedContext);

        const extractedLocation = extractLocationFromMessage(message);
        console.log(`[Chat API] Extracted location: "${extractedLocation}"`);

        if (extractedLocation && !weatherContext?.location) {
            console.log(`[Chat API] Fetching weather for: "${extractedLocation}"...`);
            const realWeather = await fetchWeatherForLocation(extractedLocation);
            if (realWeather) {
                console.log(`[Chat API] SUCCESS! Got weather: ${realWeather.temperature}°F, ${realWeather.condition} for ${realWeather.location}`);
                weatherContext = realWeather;
            } else {
                console.log(`[Chat API] FAILED to fetch weather for: "${extractedLocation}"`);
            }
        } else if (!extractedLocation) {
            console.log(`[Chat API] No location extracted from message`);
        } else {
            console.log(`[Chat API] Already have weather context, skipping fetch`);
        }

        console.log(`[Chat API] Final weather context:`, weatherContext);

        // Save user message to history
        await saveMessage(user.id, {
            role: 'user',
            content: message
        });

        // Get AI response with real weather context and personality
        const response = await getWeatherChatResponse(message, weatherContext, aiPersonality);

        // Save assistant response to history
        await saveMessage(user.id, {
            role: 'assistant',
            content: response.message,
            metadata: response.action ? { action: response.action } : undefined
        });

        return NextResponse.json({
            isSimpleSearch: false,
            message: response.message,
            action: response.action,
            rateLimit: {
                remaining: rateLimit.remaining,
                resetAt: rateLimit.resetAt.toISOString()
            }
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}

// GET endpoint for rate limit status and chat history
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action');

        if (action === 'history') {
            const messages = await getRecentMessages(user.id);
            return NextResponse.json({ messages });
        }

        // Default: return rate limit status
        const rateLimit = await getRateLimitStatus(user.id);
        return NextResponse.json({
            rateLimit: {
                remaining: rateLimit.remaining,
                resetAt: rateLimit.resetAt.toISOString(),
                limit: 15
            }
        });

    } catch (error) {
        console.error('Chat API GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}

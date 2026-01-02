/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * AI Chat API Route with Vercel AI SDK
 * Handles streaming chat requests with rate limiting, authentication, and real-time weather data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
    buildSystemPrompt,
    isSimpleLocationSearch,
    type AIPersonality,
    type WeatherContext
} from '@/lib/services/ai-config';
import { checkRateLimit, getRateLimitStatus } from '@/lib/services/chat-rate-limiter';
import { saveMessage } from '@/lib/services/chat-history-service';

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
function extractLocationFromMessage(message: string): string | null {
    const safeMessage = message.slice(0, 200);
    const timeWords = ['today', 'tomorrow', 'this', 'next', 'right', 'currently', 'two', 'three', 'four', 'five', 'six', 'seven', 'few', 'couple', 'thursday', 'friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
    const excludeWords = ['the', 'a', 'an', 'what', 'how', 'when', 'will', 'is', 'are', 'do', 'does', 'can', 'should', 'it', 'be', 'going', 'to', 'on', 'i'];

    // Helper to capitalize location names
    const capitalizeLocation = (loc: string): string => {
        return loc.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Match "in/for/at [location]" - case insensitive
    const prepMatch = safeMessage.match(/\b(?:in|for|at)\s+([a-zA-Z][a-zA-Z.'\- ]+?)(?:\s+(?:on|today|tomorrow|this|next|thursday|friday|saturday|sunday|monday|tuesday|wednesday)\b|[?.,]|$)/i);
    if (prepMatch?.[1]) {
        const loc = prepMatch[1].trim();
        const firstWord = loc.split(' ')[0].toLowerCase();
        if (loc.length > 2 && !timeWords.includes(firstWord) && !excludeWords.includes(firstWord)) {
            return capitalizeLocation(loc);
        }
    }

    // Match "City, ST" pattern - case insensitive
    const cityStateMatch = safeMessage.match(/\b([a-zA-Z][a-zA-Z.'\- ]+),\s*([a-zA-Z]{2})\b/i);
    if (cityStateMatch) {
        const city = capitalizeLocation(cityStateMatch[1].trim());
        const state = cityStateMatch[2].toUpperCase();
        return `${city}, ${state}`;
    }

    // Match "[location] weather" - case insensitive
    const weatherMatch = safeMessage.match(/\b([a-zA-Z][a-zA-Z.'\- ]+)\s+weather\b/i);
    if (weatherMatch?.[1]) {
        const loc = weatherMatch[1].trim();
        const firstWord = loc.split(' ')[0].toLowerCase();
        if (!excludeWords.includes(firstWord)) {
            return capitalizeLocation(loc);
        }
    }

    // Match multi-word location names (2-4 words starting with letter, case insensitive)
    const multiWordMatch = safeMessage.match(/\b([a-zA-Z][a-zA-Z'\-]+(?:\s+[a-zA-Z][a-zA-Z'\-]+){1,3})\b/gi);
    if (multiWordMatch) {
        for (const match of multiWordMatch) {
            const loc = match.trim();
            const words = loc.toLowerCase().split(' ');
            // Skip if any word is a time/exclude word
            if (words.some(w => timeWords.includes(w) || excludeWords.includes(w))) {
                continue;
            }
            // Skip if too short
            if (loc.length < 5) continue;
            return capitalizeLocation(loc);
        }
    }

    return null;
}

// Geocode a location using OpenWeatherMap
async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        console.error('[Chat API] No OpenWeather API key');
        return null;
    }

    try {
        const locationWithUS = location.includes(',') ? location : `${location},US`;
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationWithUS)}&limit=1&appid=${apiKey}`;
        console.log(`[Chat API] Geocoding: ${locationWithUS}`);

        let response = await fetch(url);
        let data = response.ok ? await response.json() : [];

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
    snow1h?: number;
    snow3h?: number;
    rain1h?: number;
    rain3h?: number;
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
            feelsLike: Math.round(data.main?.feels_like || 0),
            // Snow data (in mm, convert to inches for US users)
            snow1h: data.snow?.['1h'] ? Math.round(data.snow['1h'] / 25.4 * 10) / 10 : undefined,
            snow3h: data.snow?.['3h'] ? Math.round(data.snow['3h'] / 25.4 * 10) / 10 : undefined,
            // Rain data (in mm, convert to inches)
            rain1h: data.rain?.['1h'] ? Math.round(data.rain['1h'] / 25.4 * 100) / 100 : undefined,
            rain3h: data.rain?.['3h'] ? Math.round(data.rain['3h'] / 25.4 * 100) / 100 : undefined
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
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`[Chat API] One Call API failed: ${response.status}, falling back to 5-day`);
            return await fetchForecast5Day(lat, lon);
        }

        const data = await response.json();
        const forecastLines: string[] = [];
        for (const day of (data.daily || []).slice(0, 8)) {
            const date = new Date(day.dt * 1000);
            const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const high = Math.round(day.temp?.max || 0);
            const low = Math.round(day.temp?.min || 0);
            const condition = day.weather?.[0]?.main || 'Clear';

            // Include snow and rain data if available (convert mm to inches)
            let precipInfo = '';
            if (day.snow) {
                const snowInches = Math.round(day.snow / 25.4 * 10) / 10;
                precipInfo += `, Snow: ${snowInches}"`;
            }
            if (day.rain) {
                const rainInches = Math.round(day.rain / 25.4 * 100) / 100;
                precipInfo += `, Rain: ${rainInches}"`;
            }

            forecastLines.push(`${dayKey}: ${high}°F/${low}°F, ${condition}${precipInfo}`);
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
        const dailyForecasts: Map<string, {
            high: number;
            low: number;
            condition: string;
            snowMm: number;
            rainMm: number;
        }> = new Map();

        for (const item of data.list || []) {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const existing = dailyForecasts.get(dayKey);
            const temp = Math.round(item.main?.temp || 0);
            const condition = item.weather?.[0]?.main || 'Clear';
            const snow3h = item.snow?.['3h'] || 0;
            const rain3h = item.rain?.['3h'] || 0;

            if (!existing) {
                dailyForecasts.set(dayKey, {
                    high: temp,
                    low: temp,
                    condition,
                    snowMm: snow3h,
                    rainMm: rain3h
                });
            } else {
                dailyForecasts.set(dayKey, {
                    high: Math.max(existing.high, temp),
                    low: Math.min(existing.low, temp),
                    condition: existing.condition,
                    snowMm: existing.snowMm + snow3h,
                    rainMm: existing.rainMm + rain3h
                });
            }
        }

        const forecastLines: string[] = [];
        let count = 0;
        for (const [day, forecast] of dailyForecasts) {
            if (count >= 5) break;

            let precipInfo = '';
            if (forecast.snowMm > 0) {
                const snowInches = Math.round(forecast.snowMm / 25.4 * 10) / 10;
                precipInfo += `, Snow: ${snowInches}"`;
            }
            if (forecast.rainMm > 0) {
                const rainInches = Math.round(forecast.rainMm / 25.4 * 100) / 100;
                precipInfo += `, Rain: ${rainInches}"`;
            }

            forecastLines.push(`${day}: ${forecast.high}°F/${forecast.low}°F, ${forecast.condition}${precipInfo}`);
            count++;
        }

        return forecastLines.join(' | ');
    } catch {
        return null;
    }
}

// Fetch 24h precipitation history (for authenticated users)
async function fetch24hPrecipitation(lat: number, lon: number): Promise<{
    snow24h: number;
    rain24h: number;
} | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    const now = Math.floor(Date.now() / 1000);
    let totalSnowMm = 0;
    let totalRainMm = 0;
    
    // Track processed hours to prevent double-counting from overlapping API responses
    const processedHours = new Set<number>();

    // Fetch data for the past 24 hours using timemachine
    // Use 3 calls (24h, 16h, 8h ago) to match precipitation-history endpoint
    const timestamps = [
        now - (24 * 60 * 60), // 24 hours ago
        now - (16 * 60 * 60), // 16 hours ago
        now - (8 * 60 * 60),  // 8 hours ago
    ];

    for (const dt of timestamps) {
        try {
            const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&units=imperial&appid=${apiKey}`;
            const response = await fetch(url);

            if (!response.ok) continue;

            const data = await response.json();

            if (data.data && Array.isArray(data.data)) {
                for (const hour of data.data) {
                    // Skip if already processed or outside 24h window
                    if (processedHours.has(hour.dt)) continue;
                    if (hour.dt < now - (24 * 60 * 60) || hour.dt > now) continue;
                    
                    processedHours.add(hour.dt);
                    
                    // Sum raw mm values, convert only at the end
                    if (hour.snow?.['1h']) {
                        totalSnowMm += hour.snow['1h'];
                    }
                    if (hour.rain?.['1h']) {
                        totalRainMm += hour.rain['1h'];
                    }
                }
            }
        } catch {
            // Continue with partial data
        }
    }

    // Convert mm to inches only after summing all values
    return {
        snow24h: Math.round((totalSnowMm / 25.4) * 10) / 10,
        rain24h: Math.round((totalRainMm / 25.4) * 100) / 100,
    };
}

// Fetch real weather data for a location
async function fetchWeatherForLocation(location: string, isAuthenticated: boolean = false): Promise<WeatherContext | null> {
    const coords = await geocodeLocation(location);
    if (!coords) return null;

    // Fetch current weather and forecast in parallel
    const promises: [
        Promise<Awaited<ReturnType<typeof fetchCurrentWeather>>>,
        Promise<string | null>,
        Promise<{ snow24h: number; rain24h: number } | null>
    ] = [
        fetchCurrentWeather(coords.lat, coords.lon),
        fetchForecast(coords.lat, coords.lon),
        isAuthenticated ? fetch24hPrecipitation(coords.lat, coords.lon) : Promise.resolve(null)
    ];

    const [weather, forecast, precip24h] = await Promise.all(promises);

    if (!weather) return null;

    return {
        location: coords.name,
        temperature: weather.temperature,
        condition: weather.condition,
        humidity: weather.humidity,
        wind: weather.wind,
        feelsLike: weather.feelsLike,
        forecast: forecast || undefined,
        // Snow and precipitation data
        snow1h: weather.snow1h,
        snow3h: weather.snow3h,
        rain1h: weather.rain1h,
        rain3h: weather.rain3h,
        // 24h totals (authenticated users only)
        snow24h: precip24h?.snow24h,
        rain24h: precip24h?.rain24h,
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

        // Priority logic for weather context:
        // 1. If user mentions a specific location, fetch fresh data for that location
        // 2. If we have provided context with real weather data (has temperature), use it
        // 3. If we have provided context with just location name, fetch real data for it
        if (extractedLocation) {
            // User mentioned a location - check if different from provided context
            const providedLocationLower = providedContext?.location?.toLowerCase() || '';
            const extractedLower = extractedLocation.toLowerCase();
            const isDifferentLocation = !providedLocationLower.includes(extractedLower) &&
                !extractedLower.includes(providedLocationLower.split(',')[0]);

            if (isDifferentLocation || providedContext?.temperature === undefined) {
                console.log(`[Chat API] Fetching weather for extracted location: "${extractedLocation}"...`);
                const realWeather = await fetchWeatherForLocation(extractedLocation, true);
                if (realWeather) {
                    console.log(`[Chat API] SUCCESS! Got weather: ${realWeather.temperature}°F, ${realWeather.condition} for ${realWeather.location}`);
                    weatherContext = realWeather;
                } else {
                    console.log(`[Chat API] FAILED to fetch weather for: "${extractedLocation}"`);
                }
            } else {
                console.log(`[Chat API] Using provided context - same location`);
            }
        } else if (providedContext?.location && providedContext?.temperature === undefined) {
            // No location in message, but we have a location name without weather data - fetch it
            console.log(`[Chat API] Fetching weather for provided location: "${providedContext.location}"...`);
            const realWeather = await fetchWeatherForLocation(providedContext.location, true);
            if (realWeather) {
                console.log(`[Chat API] SUCCESS! Got weather for context location: ${realWeather.temperature}°F`);
                weatherContext = realWeather;
            }
        } else if (providedContext?.temperature !== undefined) {
            // We already have complete weather data from the client - use it
            console.log(`[Chat API] Using provided weather context: ${providedContext.temperature}°F in ${providedContext.location}`);
        }


        console.log(`[Chat API] Final weather context:`, weatherContext);

        // Save user message to history
        await saveMessage(user.id, {
            role: 'user',
            content: message
        });

        // Build system prompt with current datetime
        const currentDatetime = new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const systemPrompt = buildSystemPrompt(currentDatetime, aiPersonality, weatherContext);

        // Use Vercel AI SDK streamText with Anthropic
        const result = streamText({
            model: anthropic('claude-sonnet-4-20250514'),
            system: systemPrompt,
            messages: [
                { role: 'user', content: message }
            ],
            maxOutputTokens: 1024,
            onFinish: async ({ text }) => {
                // Save assistant response to history
                try {
                    await saveMessage(user.id, {
                        role: 'assistant',
                        content: text
                    });
                } catch (saveError) {
                    console.error('[Chat API] Failed to save assistant message:', {
                        userId: user.id,
                        role: 'assistant',
                        error: saveError
                    });
                }
            }
        });

        // Return streaming response with rate limit headers
        return result.toTextStreamResponse({
            headers: {
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': rateLimit.resetAt.toISOString()
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

        // Default: return rate limit status
        const rateLimit = await getRateLimitStatus(user.id);
        return NextResponse.json({
            rateLimit: {
                remaining: rateLimit.remaining,
                resetAt: rateLimit.resetAt.toISOString(),
                limit: 30
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

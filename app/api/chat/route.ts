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
    const timeWords = ['today', 'tomorrow', 'this', 'next', 'right', 'currently', 'two', 'three', 'four', 'five', 'six', 'seven', 'few', 'couple'];

    const prepMatch = safeMessage.match(/\b(?:in|for|at)\s+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*)/);
    if (prepMatch?.[1]) {
        const loc = prepMatch[1].trim();
        const firstWord = loc.split(' ')[0].toLowerCase();
        if (loc.length > 2 && !timeWords.includes(firstWord) && !['the', 'a', 'an'].includes(firstWord)) {
            return loc;
        }
    }

    const cityStateMatch = safeMessage.match(/\b([A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*),\s*([A-Z]{2})\b/);
    if (cityStateMatch) {
        return `${cityStateMatch[1]}, ${cityStateMatch[2]}`;
    }

    const weatherMatch = safeMessage.match(/\b([A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*)\s+weather\b/i);
    if (weatherMatch?.[1]) {
        return weatherMatch[1];
    }

    const capitalizedWords = safeMessage.match(/\b([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,3})\b/);
    if (capitalizedWords?.[1]) {
        const loc = capitalizedWords[1];
        const firstWord = loc.split(' ')[0].toLowerCase();
        if (!timeWords.includes(firstWord) && !['the', 'a', 'an', 'what', 'how', 'when', 'will', 'is', 'are', 'do', 'does', 'can', 'should'].includes(firstWord)) {
            return loc;
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

// Fetch real weather data for a location
async function fetchWeatherForLocation(location: string): Promise<WeatherContext | null> {
    const coords = await geocodeLocation(location);
    if (!coords) return null;

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

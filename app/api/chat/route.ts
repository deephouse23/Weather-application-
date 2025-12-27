/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * AI Chat API Route
 * Handles chat requests with rate limiting, authentication, and real-time weather data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getWeatherChatResponse, isSimpleLocationSearch } from '@/lib/services/claude-service';
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
function extractLocationFromMessage(message: string): string | null {
    const lowerMessage = message.toLowerCase();

    // Common patterns: "in [location]", "for [location]", "at [location]"
    const patterns = [
        /(?:weather|temperature|forecast|conditions?)\s+(?:in|for|at)\s+([a-zA-Z\s,]+?)(?:\?|$|today|tomorrow|this|next)/i,
        /(?:in|for|at)\s+([a-zA-Z\s,]+?)(?:\s+(?:today|tomorrow|this|next|right now|currently)|\?|$)/i,
        /(?:should i|do i need|will it|is it)\s+.*?\s+(?:in|for|at)\s+([a-zA-Z\s,]+?)(?:\?|$)/i,
        /([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/,  // City, ST format
        /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:weather|forecast)/i,
    ];

    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            const location = match[1].trim();
            // Filter out common false positives
            if (location.length > 2 && !['the', 'today', 'tomorrow', 'this', 'next'].includes(location.toLowerCase())) {
                return location;
            }
        }
    }

    return null;
}

// Fetch real weather data for a location
async function fetchWeatherForLocation(location: string): Promise<{
    location: string;
    temperature: number;
    condition: string;
    humidity?: number;
    wind?: string;
    forecast?: string;
} | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/weather/current?location=${encodeURIComponent(location)}`);

        if (!response.ok) {
            console.log(`Weather API returned ${response.status} for ${location}`);
            return null;
        }

        const data = await response.json();

        return {
            location: data.location || location,
            temperature: Math.round(data.temperature || data.temp || 0),
            condition: data.condition || data.description || 'Unknown',
            humidity: data.humidity,
            wind: data.wind?.speed ? `${data.wind.speed} mph` : undefined,
            forecast: data.forecast?.[0]?.description
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
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
        const { message, weatherContext: providedContext } = body;

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
        const extractedLocation = extractLocationFromMessage(message);

        if (extractedLocation && !weatherContext?.location) {
            console.log(`[Chat API] Extracted location: ${extractedLocation}, fetching weather...`);
            const realWeather = await fetchWeatherForLocation(extractedLocation);
            if (realWeather) {
                console.log(`[Chat API] Got real weather:`, realWeather);
                weatherContext = realWeather;
            }
        }

        // Save user message to history
        await saveMessage(user.id, {
            role: 'user',
            content: message
        });

        // Get AI response with real weather context
        const response = await getWeatherChatResponse(message, weatherContext);

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

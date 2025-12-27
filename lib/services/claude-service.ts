/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Claude AI Service for Weather Chat
 * Handles intent detection and AI responses for weather queries
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ChatAction {
    type: 'load_weather' | 'navigate_radar' | 'none';
    location?: string;
    date?: string;
}

export interface ChatResponse {
    message: string;
    action: ChatAction;
}

export interface WeatherContext {
    location?: string;
    temperature?: number;
    condition?: string;
    forecast?: string;
    humidity?: number;
    wind?: string;
    feelsLike?: number;
}

// Intent detection - ONLY bypass AI for very clear simple searches
// Be more permissive to let AI handle more queries
export function isSimpleLocationSearch(input: string): boolean {
    const trimmed = input.trim();

    // ZIP code (US) - definitely a simple search
    if (/^\d{5}(-\d{4})?$/.test(trimmed)) return true;

    // Coordinates - definitely a simple search
    if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(trimmed)) return true;

    // Very short "City, ST" pattern with only 2-letter state code
    // e.g., "Denver, CO" but NOT "weather in Denver, CO"
    if (/^[A-Za-z]+,\s*[A-Za-z]{2}$/.test(trimmed) && trimmed.length < 25) return true;

    // Everything else goes to AI - let it be smart about interpretation
    return false;
}

// Build the system prompt for Claude
function buildSystemPrompt(currentDatetime: string, weatherContext?: WeatherContext): string {
    let contextInfo = '';
    if (weatherContext?.location) {
        contextInfo = `
REAL-TIME WEATHER DATA (USE THIS IN YOUR RESPONSE):
====================================================
Location: ${weatherContext.location}
Temperature: ${weatherContext.temperature}°F${weatherContext.feelsLike ? ` (feels like ${weatherContext.feelsLike}°F)` : ''}
Conditions: ${weatherContext.condition}
${weatherContext.humidity ? `Humidity: ${weatherContext.humidity}%` : ''}
${weatherContext.wind ? `Wind: ${weatherContext.wind}` : ''}
${weatherContext.forecast ? `Forecast: ${weatherContext.forecast}` : ''}
====================================================
CRITICAL: Use this REAL data in your response! Mention the actual temperature!
`;
    } else {
        contextInfo = `
NOTE: No real-time weather data fetched yet. If user mentions a location,
set action type to "load_weather" so we can get accurate data.
`;
    }

    return `You are STORM, the friendly AI weather assistant for 16-Bit Weather - a retro-styled weather platform with a terminal aesthetic.

PERSONALITY:
- Warm, helpful, and enthusiastic about weather
- Sprinkle in fun weather facts when relevant
- Use retro/tech vibes occasionally (e.g., "SCANNING ATMOSPHERIC DATA..." or "WEATHER SYSTEMS NOMINAL")
- Keep responses conversational but informative
- Be encouraging about outdoor activities when weather permits

CAPABILITIES:
1. Answer ANY weather-related questions with detail and personality
2. Provide clothing/activity recommendations based on conditions
3. Explain weather phenomena in accessible terms
4. Help users plan around weather (travel, events, outdoor activities)
5. Share interesting weather trivia and facts
6. Navigate to weather data or radar when helpful

RESPONSE FORMAT - Always respond with valid JSON:
{
  "message": "Your friendly, helpful response with personality",
  "action": {
    "type": "load_weather" | "navigate_radar" | "none",
    "location": "City, State" (if user mentions a location),
    "date": "YYYY-MM-DD" (if user mentions a specific date)
  }
}

ACTION GUIDE:
- "load_weather": Use when user asks about weather for a specific place
- "navigate_radar": Use when user wants to see radar, storms, precipitation maps
- "none": Use for general questions, advice, education, or when you're just chatting

CURRENT INFO:
- Date/Time: ${currentDatetime}
${contextInfo}

Remember: You're not just a search tool - you're a knowledgeable weather companion! Be helpful, be fun, and make weather interesting.`;
}

// Parse Claude's response into structured format
function parseClaudeResponse(content: string): ChatResponse {
    try {
        // Try to extract JSON from the response (Claude might wrap it in markdown)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                message: parsed.message || content,
                action: {
                    type: parsed.action?.type || 'none',
                    location: parsed.action?.location,
                    date: parsed.action?.date
                }
            };
        }

        // No JSON found, treat as plain message
        return {
            message: content,
            action: { type: 'none' }
        };
    } catch {
        // If JSON parsing fails, treat as plain message
        return {
            message: content,
            action: { type: 'none' }
        };
    }
}

// Main function to get AI response
export async function getWeatherChatResponse(
    userMessage: string,
    weatherContext?: WeatherContext
): Promise<ChatResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const client = new Anthropic({
        apiKey: apiKey
    });

    const currentDatetime = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    const systemPrompt = buildSystemPrompt(currentDatetime, weatherContext);

    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,  // Increased for richer responses
        system: systemPrompt,
        messages: [
            {
                role: 'user',
                content: userMessage
            }
        ]
    });

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude');
    }

    return parseClaudeResponse(textContent.text);
}

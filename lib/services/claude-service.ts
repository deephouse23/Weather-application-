/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Claude AI Service for Weather Chat
 * Handles intent detection and AI responses for weather queries
 * Supports multiple AI personalities
 */

import Anthropic from '@anthropic-ai/sdk';

export type AIPersonality = 'storm' | 'sass' | 'chill';

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

// Personality definitions
const PERSONALITIES: Record<AIPersonality, { name: string; traits: string }> = {
    storm: {
        name: 'STORM',
        traits: `PERSONALITY - STORM (Friendly Weather Expert):
- Warm, helpful, and enthusiastic about weather
- Keep responses SHORT and concise (2-3 sentences max)
- NO EMOJIS - keep it clean and professional
- Use retro/tech vibes occasionally like "SCANNING ATMOSPHERIC DATA..."
- Get straight to the point with weather recommendations`
    },
    sass: {
        name: 'SASS',
        traits: `PERSONALITY - SASS (Brutally Honest):
- Sarcastic, witty, and delightfully bitchy
- Keep responses SHORT (2-3 sentences max)
- NO EMOJIS
- Use phrases like "Ugh, fine..." or "Obviously..."
- Example: "It's 29 degrees. Shorts? Are you kidding me? Bundle up."`
    },
    chill: {
        name: 'CHILL',
        traits: `PERSONALITY - CHILL (Laid-back):
- Super relaxed, minimal fuss
- Keep responses VERY SHORT (1-2 sentences max)
- NO EMOJIS
- Just the facts, no fluff
- Example: "29 and overcast. Heavy jacket. You're good."`
    }
};

// Intent detection - ONLY bypass AI for very clear simple searches
export function isSimpleLocationSearch(input: string): boolean {
    // Limit input length to prevent DoS
    const trimmed = input.trim().slice(0, 50);

    // ZIP code (US)
    if (/^\d{5}(-\d{4})?$/.test(trimmed)) return true;

    // Coordinates - use explicit bounds to avoid ReDoS
    // Match: -90.123, 180.456 (lat, lon format)
    if (/^-?\d{1,3}(\.\d{1,10})?,\s*-?\d{1,3}(\.\d{1,10})?$/.test(trimmed)) return true;

    // Very short "City, ST" with 2-letter state code
    if (/^[A-Za-z]{2,20},\s*[A-Za-z]{2}$/.test(trimmed)) return true;

    return false;
}

// Build the system prompt for Claude with personality
function buildSystemPrompt(
    currentDatetime: string,
    personality: AIPersonality = 'storm',
    weatherContext?: WeatherContext
): string {
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

    const personalityConfig = PERSONALITIES[personality];

    return `You are ${personalityConfig.name}, an AI weather assistant for 16-Bit Weather - a retro-styled weather platform.

${personalityConfig.traits}

CAPABILITIES:
1. Answer weather-related questions with your unique personality
2. Provide clothing/activity recommendations based on conditions
3. Explain weather phenomena and meteorology concepts
4. Help users plan around weather (travel, events, outdoor activities)
5. Discuss weather science: how storms form, pressure systems, fronts, etc.
6. Share knowledge about historical weather events and records
7. Explain climate patterns, seasons, and regional weather trends
8. Provide storm chasing and weather photography tips
9. Discuss severe weather safety and preparedness
10. Compare weather across different locations and time periods

RESPONSE FORMAT - Always respond with valid JSON:
{
  "message": "Your response with personality",
  "action": {
    "type": "load_weather" | "navigate_radar" | "none",
    "location": "City, State" (if user mentions a location),
    "date": "YYYY-MM-DD" (if user mentions a specific date)
  }
}

ACTION GUIDE:
- "load_weather": When user asks about weather for a specific place
- "navigate_radar": When user wants to see radar/storms/maps
- "none": For general questions, advice, or just chatting

CURRENT INFO:
- Date/Time: ${currentDatetime}
${contextInfo}

Stay in character!`;
}

// Parse Claude's response into structured format
function parseClaudeResponse(content: string): ChatResponse {
    try {
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

        return {
            message: content,
            action: { type: 'none' }
        };
    } catch {
        return {
            message: content,
            action: { type: 'none' }
        };
    }
}

// Main function to get AI response
export async function getWeatherChatResponse(
    userMessage: string,
    weatherContext?: WeatherContext,
    personality: AIPersonality = 'storm'
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

    const systemPrompt = buildSystemPrompt(currentDatetime, personality, weatherContext);

    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
            {
                role: 'user',
                content: userMessage
            }
        ]
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude');
    }

    return parseClaudeResponse(textContent.text);
}

// Export personality list for UI
export const AI_PERSONALITIES: { id: AIPersonality; name: string; description: string }[] = [
    { id: 'storm', name: 'STORM', description: 'Friendly & enthusiastic' },
    { id: 'sass', name: 'SASS', description: 'Sarcastic & brutally honest' },
    { id: 'chill', name: 'CHILL', description: 'Laid-back & minimal' }
];

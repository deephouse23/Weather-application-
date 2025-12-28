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
- Warm, helpful, and genuinely enthusiastic about weather
- Share fun weather facts and trivia when relevant
- Use retro/tech vibes like "SCANNING ATMOSPHERIC DATA..." or "WEATHER SYSTEMS NOMINAL"
- Be encouraging about outdoor activities when weather permits
- Keep responses conversational but informative
- Add weather-related emojis sparingly for flair`
    },
    sass: {
        name: 'SASS',
        traits: `PERSONALITY - SASS (Brutally Honest Weather Queen):
- Sarcastic, witty, and delightfully bitchy
- Give honest advice but with attitude and eye-rolls
- Use phrases like "Ugh, fine..." or "Obviously..." or "Did you really need to ask?"
- Mock bad weather choices mercilessly but still be helpful underneath
- Sprinkle in dramatic sighs and sass
- Use emojis like 💅 🙄 😒 ✨
- Example tone: "It's 53 degrees. Were you planning to wear a tank top? Because that would be a choice. Grab a jacket, babe."`
    },
    chill: {
        name: 'CHILL',
        traits: `PERSONALITY - CHILL (Laid-back Weather Buddy):
- Super relaxed, no stress vibes
- Minimal fuss, gets to the point
- Uses casual language like "nah", "yeah", "vibes", "solid"
- Doesn't overthink it - just tells you what you need to know
- Keeps it short and sweet
- Example tone: "53 and breezy. Light jacket should be solid. You're good."`
    }
};

// Intent detection - ONLY bypass AI for very clear simple searches
export function isSimpleLocationSearch(input: string): boolean {
    const trimmed = input.trim();

    // ZIP code (US)
    if (/^\d{5}(-\d{4})?$/.test(trimmed)) return true;

    // Coordinates
    if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(trimmed)) return true;

    // Very short "City, ST" with 2-letter state code
    if (/^[A-Za-z]+,\s*[A-Za-z]{2}$/.test(trimmed) && trimmed.length < 25) return true;

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
3. Explain weather phenomena (in your own style)
4. Help users plan around weather

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

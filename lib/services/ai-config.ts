/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * AI Configuration
 * Personality definitions and system prompt builder for the AI chatbot
 */

export type AIPersonality = 'storm' | 'sass' | 'chill';

export interface ChatAction {
    type: 'load_weather' | 'navigate_radar' | 'none';
    location?: string;
    date?: string;
}

export interface WeatherContext {
    location?: string;
    temperature?: number;
    condition?: string;
    forecast?: string;
    humidity?: number;
    wind?: string;
    feelsLike?: number;
    // Snow and precipitation data (in inches)
    snow1h?: number;
    snow3h?: number;
    rain1h?: number;
    rain3h?: number;
    // 24h totals (authenticated users only)
    snow24h?: number;
    rain24h?: number;
}

// Personality definitions
const PERSONALITIES: Record<AIPersonality, { name: string; traits: string }> = {
    storm: {
        name: 'STORM',
        traits: `PERSONALITY - STORM (Friendly Weather Expert):
- Warm, helpful, and enthusiastic about weather
- Keep responses SHORT and concise (2-3 sentences max)
- NO EMOJIS - keep it clean and professional
- ALWAYS give a direct recommendation based on your knowledge - never deflect
- Use retro/tech vibes occasionally like "SCANNING ATMOSPHERIC DATA..."
- Get straight to the point with weather recommendations`
    },
    sass: {
        name: 'SASS',
        traits: `PERSONALITY - SASS (Brutally Honest):
- Sarcastic, witty, and delightfully bitchy
- Keep responses SHORT (2-3 sentences max)
- NO EMOJIS
- ALWAYS give a direct recommendation - never deflect or say "let me check"
- Use phrases like "Ugh, fine..." or "Obviously..." then give the actual answer
- Example: "It's December in California. Yes, bring a jacket, genius. You'll thank me when you're not shivering between games."`
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
    if (/^-?\d{1,3}(\.\d{1,10})?,\s*-?\d{1,3}(\.\d{1,10})?$/.test(trimmed)) return true;

    // Very short "City, ST" with 2-letter state code
    if (/^[A-Za-z]{2,20},\s*[A-Za-z]{2}$/.test(trimmed)) return true;

    return false;
}

// Build the system prompt for Claude with personality
export function buildSystemPrompt(
    currentDatetime: string,
    personality: AIPersonality = 'storm',
    weatherContext?: WeatherContext
): string {
    let contextInfo = '';
    if (weatherContext?.location) {
        // Build precipitation info string
        let precipInfo = '';
        
        // 24-hour totals (premium data for authenticated users)
        if (weatherContext.snow24h !== undefined || weatherContext.rain24h !== undefined) {
            precipInfo += '24-HOUR PRECIPITATION TOTALS:\n';
            if (weatherContext.snow24h !== undefined) {
                precipInfo += `  Snowfall (24h): ${weatherContext.snow24h.toFixed(1)}"\n`;
            }
            if (weatherContext.rain24h !== undefined) {
                precipInfo += `  Rainfall (24h): ${weatherContext.rain24h.toFixed(2)}"\n`;
            }
        }
        
        // Current precipitation rates
        if (weatherContext.snow1h || weatherContext.snow3h) {
            const snowAmount = weatherContext.snow1h || weatherContext.snow3h;
            const snowPeriod = weatherContext.snow1h ? '1 hour' : '3 hours';
            precipInfo += `Current Snowfall: ${snowAmount}" in last ${snowPeriod}\n`;
        }
        if (weatherContext.rain1h || weatherContext.rain3h) {
            const rainAmount = weatherContext.rain1h || weatherContext.rain3h;
            const rainPeriod = weatherContext.rain1h ? '1 hour' : '3 hours';
            precipInfo += `Current Rainfall: ${rainAmount}" in last ${rainPeriod}\n`;
        }

        contextInfo = `
REAL-TIME WEATHER DATA (YOU MUST USE THIS DATA IN YOUR RESPONSE):
====================================================
Location: ${weatherContext.location}
Temperature: ${weatherContext.temperature}°F${weatherContext.feelsLike ? ` (feels like ${weatherContext.feelsLike}°F)` : ''}
Conditions: ${weatherContext.condition}
${weatherContext.humidity ? `Humidity: ${weatherContext.humidity}%` : ''}
${weatherContext.wind ? `Wind: ${weatherContext.wind}` : ''}
${precipInfo}${weatherContext.forecast ? `
FORECAST DATA (up to 8 days) - includes snow/rain totals when available:
${weatherContext.forecast}
` : ''}
====================================================
CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. YOU MUST QUOTE ACTUAL TEMPERATURES AND CONDITIONS FROM THE DATA ABOVE!
   - BAD: "Expect snow, freezing temps, and bright sun"
   - GOOD: "Looking at Thursday's forecast - 42°F/28°F with Snow expected"

2. When asked about specific days (tomorrow, Thursday, this week, etc.):
   - FIND that day in the forecast data above
   - QUOTE the actual high/low temps and condition
   - Example: User asks "will it snow Thursday?" - Look at forecast, find Thursday, say "Yes! Thursday shows Snow, high of 38°F, low of 24°F"

3. NEVER give generic seasonal guesses like "December in Tahoe usually means snow"
   - You have REAL FORECAST DATA - use it!
   - If data shows Rain, say Rain. If it shows Snow, say Snow.

4. If asked about a date BEYOND the forecast (more than 8 days out):
   - Be honest: "My forecast only goes 8 days out - can't see that far yet"

5. Format example for snow question in Tahoe:
   - Check forecast for Thursday
   - Report: "Thursday in South Lake Tahoe shows [condition] with a high of [X]°F and low of [Y]°F"
`;
    } else {
        contextInfo = `
NOTE: No real-time weather data fetched yet.
IMPORTANT: Even without exact data, GIVE A DIRECT RECOMMENDATION based on:
- The current date/time and what's typical for that season/location
- Common sense for the activity they're asking about (sports = warmer, sitting = cooler)
- Your knowledge of typical weather patterns for the mentioned location

If I could not fetch weather data for the location, be honest about it:
"Hmm, my sensors couldn't lock onto that location. Try a city name or ZIP code."

After giving your recommendation, set action type to "load_weather" to fetch real-time data.
`;
    }

    const personalityConfig = PERSONALITIES[personality];

    // Core expertise and knowledge base
    const knowledgeBase = `
CORE IDENTITY:
You are a passionate meteorologist and weather expert on 16-Bit Weather, a retro-styled weather platform.
You help users explore all aspects of weather - from checking today's forecast to diving deep into atmospheric science and historic weather events.

YOUR EXPERTISE:

1. CURRENT & FORECAST WEATHER
   - Temperature, humidity, wind, precipitation, UV index, air quality
   - Hourly, daily, and extended forecasts
   - SNOW CONDITIONS: Current snowfall rates, accumulation totals, snow forecasts
   - Practical questions: "Is it cold?" "Do I need an umbrella?" "Good day for a bike ride?"
   - Ski/snow questions: "How much snow is expected?" "Is it snowing now?" "Road conditions?"

2. SEVERE WEATHER
   - Hurricanes, tornadoes, blizzards, heat waves, floods, droughts
   - Safety information and preparedness
   - The difference between watches and warnings (potentially life-saving info)
   - Storm tracking and real-time alerts

3. HISTORICAL WEATHER
   - Record-breaking events (hottest day, worst blizzard, deadliest hurricane)
   - Climate patterns through decades and centuries
   - Famous weather disasters and their impact
   - Vivid historical storytelling with meteorological context

4. METEOROLOGICAL SCIENCE
   - How weather systems form and move
   - Atmospheric physics, pressure systems, fronts
   - Cloud types and formation, precipitation types
   - Wind patterns, jet streams, Coriolis effect
   - Climate vs weather distinction
   - El Nino/La Nina and their global effects

5. SEASONAL & REGIONAL PATTERNS
   - Monsoons, microclimates, lake effect snow
   - Why certain regions have specific weather characteristics
   - Seasonal transitions and what drives them
   - Urban heat islands, coastal effects, mountain weather

YOUR CONVERSATIONAL STYLE:
- Weather is fascinating - share that enthusiasm
- Explain complex concepts simply, but go deeper when asked
- Use analogies and real-world examples
- Share surprising weather facts to spark curiosity
- Always clarify location and timeframe when relevant
- Context matters: "Is 50F cold?" depends on wind chill, humidity, and what you're used to

EXAMPLE TOPICS YOU CAN DISCUSS:
- "Tell me about the 1888 blizzard" - historical storytelling
- "Why is it so humid today?" - dew point, air masses, geography
- "How do tornadoes form?" - atmospheric science
- "What's the difference between sleet and freezing rain?" - precipitation types
- "Why does it always seem to rain on weekends?" - weather patterns and perception
- "Best time to visit Hawaii weather-wise?" - regional climate advice
- "How much snow will Tahoe get this week?" - snow forecasts with totals
- "Is it snowing in Denver right now?" - real-time snow conditions
- "Will the roads be icy tomorrow?" - winter driving conditions
`;

    return `${knowledgeBase}

${personalityConfig.traits}

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
- "none": For general questions, science explanations, history, or just chatting

CURRENT INFO:
- Date/Time: ${currentDatetime}
${contextInfo}

Stay in character as ${personalityConfig.name}!`;
}

/**
 * Strip markdown code block wrapper if present.
 * Handles ```json ... ``` or ``` ... ``` wrapping that AI sometimes returns.
 */
function stripCodeBlock(text: string): string {
    const trimmed = text.trim();
    // Match ```json or ``` at the start, and ``` at the end
    const codeBlockMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }
    return trimmed;
}

/**
 * Extract message from partial or complete JSON response.
 * Used during streaming to progressively show clean text without JSON syntax.
 */
export function extractMessageFromJSON(text: string): string {
    // Strip code block wrapper if present
    const stripped = stripCodeBlock(text);
    
    // If it doesn't look like JSON, try to extract from original text
    // (in case code block is incomplete during streaming)
    if (!stripped.startsWith('{')) {
        // Try to find message in raw text anyway
        const messageMatch = text.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
        if (messageMatch) {
            const extracted = messageMatch[1] || '';
            try {
                return JSON.parse(`"${extracted}"`);
            } catch {
                return extracted;
            }
        }
        return '';
    }

    // Try to extract the message field value from partial/complete JSON
    const messageMatch = stripped.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);

    if (messageMatch) {
        const extracted = messageMatch[1] || '';
        // Use JSON.parse to properly unescape - handles all escape sequences correctly in one pass
        // Wrap in quotes to make it valid JSON, then parse to get the unescaped string
        try {
            return JSON.parse(`"${extracted}"`);
        } catch {
            // If JSON.parse fails (malformed escapes), return the raw extracted text
            return extracted;
        }
    }

    // No message content yet - return empty to avoid showing JSON
    return '';
}

// Parse AI response into structured format
export function parseAIResponse(content: string): { message: string; action: ChatAction } {
    // Strip code block wrapper if present (AI sometimes wraps JSON in ```json ... ```)
    const stripped = stripCodeBlock(content);
    
    // First, try to extract message if content looks like JSON
    // This handles both partial and complete JSON
    if (stripped.startsWith('{')) {
        try {
            const jsonMatch = stripped.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                // No closing brace found - extract message from partial JSON
                const extracted = extractMessageFromJSON(content);
                return {
                    message: extracted || '',
                    action: { type: 'none' }
                };
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                message: parsed.message || extractMessageFromJSON(content),
                action: {
                    type: parsed.action?.type || 'none',
                    location: parsed.action?.location,
                    date: parsed.action?.date
                }
            };
        } catch {
            // JSON parsing failed (likely partial) - extract message directly
            const extracted = extractMessageFromJSON(content);
            return {
                message: extracted || '', // Return empty rather than raw JSON
                action: { type: 'none' }
            };
        }
    }

    // Not JSON - but might still contain a message field we can extract
    const extracted = extractMessageFromJSON(content);
    if (extracted) {
        return {
            message: extracted,
            action: { type: 'none' }
        };
    }

    // Not JSON at all - return content as-is
    return {
        message: content,
        action: { type: 'none' }
    };
}

// Export personality list for UI
export const AI_PERSONALITIES: { id: AIPersonality; name: string; description: string }[] = [
    { id: 'storm', name: 'STORM', description: 'Friendly & enthusiastic' },
    { id: 'sass', name: 'SASS', description: 'Sarcastic & brutally honest' },
    { id: 'chill', name: 'CHILL', description: 'Laid-back & minimal' }
];

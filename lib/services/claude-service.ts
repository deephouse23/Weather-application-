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
}

// Intent detection - determine if input needs AI or is a simple location search
export function isSimpleLocationSearch(input: string): boolean {
    const trimmed = input.trim();

    // ZIP code (US)
    if (/^\d{5}(-\d{4})?$/.test(trimmed)) return true;

    // Coordinates
    if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(trimmed)) return true;

    // Simple "City, State" or "City, ST" pattern (e.g., "San Ramon, CA")
    if (/^[A-Za-z\s.-]+,\s*[A-Za-z]{2,3}$/.test(trimmed)) return true;

    // Simple city name only (e.g., "Chicago")
    if (/^[A-Za-z\s.-]+$/.test(trimmed) && trimmed.split(/\s+/).length <= 3) {
        // Check if it contains conversational words
        const conversationalPatterns = /\b(what|how|should|will|is|are|show|tell|can|could|would|do|does|the|in|for|today|tomorrow|weekend|week)\b/i;
        if (!conversationalPatterns.test(trimmed)) return true;
    }

    return false;
}

// Build the system prompt for Claude
function buildSystemPrompt(currentDatetime: string, weatherContext?: WeatherContext): string {
    let contextInfo = '';
    if (weatherContext?.location) {
        contextInfo = `
User's current weather data:
- Location: ${weatherContext.location}
- Temperature: ${weatherContext.temperature}°F
- Conditions: ${weatherContext.condition}
${weatherContext.forecast ? `- Forecast: ${weatherContext.forecast}` : ''}
`;
    }

    return `You are the weather assistant for 16-Bit Weather, a retro-styled weather education platform.

Your job is to:
1. Answer weather-related questions helpfully and concisely
2. Extract location and time references from user queries
3. Provide actionable advice based on weather conditions
4. Help users understand weather phenomena

IMPORTANT: Always respond with valid JSON in this exact format:
{
  "message": "Your conversational response here",
  "action": {
    "type": "load_weather" | "navigate_radar" | "none",
    "location": "City, State" (if applicable, use proper format),
    "date": "YYYY-MM-DD" (if applicable)
  }
}

Action types:
- "load_weather": When user wants to see weather for a location
- "navigate_radar": When user wants to see radar/map for a location
- "none": For general questions, advice, or when no navigation is needed

Current datetime: ${currentDatetime}
${contextInfo}

Be friendly, concise, and helpful. Match the retro terminal vibe when appropriate.`;
}

// Parse Claude's response into structured format
function parseClaudeResponse(content: string): ChatResponse {
    try {
        // Try to parse as JSON directly
        const parsed = JSON.parse(content);
        return {
            message: parsed.message || content,
            action: {
                type: parsed.action?.type || 'none',
                location: parsed.action?.location,
                date: parsed.action?.date
            }
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
        max_tokens: 500,
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

/**
 * 16-Bit Weather Platform - AI Chat API Route
 *
 * Rewritten for Vercel AI SDK tool calling. The AI decides what data to
 * fetch on-demand via tools — no more pre-fetch-everything pattern.
 *
 * Supports multi-turn conversations with history loaded from Supabase.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { isPlaywrightTestModeRequest } from '@/lib/playwright-test-mode';
import { streamText, stepCountIs, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { buildSystemPrompt, type AIPersonality, type AIUserContext } from '@/lib/services/ai-config';
import { checkRateLimit, getRateLimitStatus } from '@/lib/services/chat-rate-limiter';
import { saveMessage, getRecentMessages, clearChatHistory } from '@/lib/services/chat-history-service';
import { getUserAIMemory } from '@/lib/services/ai-memory-service';
import { weatherTools } from '@/lib/ai/tools';
import { createUserMemoryTools } from '@/lib/ai/memory-tools';

const userContextSchema = z.object({
    primaryLocation: z.string().max(200).nullable().optional(),
    preferredUnits: z.enum(['metric', 'imperial']).nullable().optional(),
    timezone: z.string().max(120).nullable().optional(),
    displayName: z.string().max(120).nullable().optional(),
});

// ---------------------------------------------------------------------------
// Auth helper (unchanged)
// ---------------------------------------------------------------------------

const PLAYWRIGHT_TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

function getPlaywrightTestUser(): User {
    return {
        id: PLAYWRIGHT_TEST_USER_ID,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'playwright-test@example.com',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
    } as User;
}

async function getAuthenticatedUser(request: NextRequest) {
    if (isPlaywrightTestModeRequest(request)) {
        return getPlaywrightTestUser();
    }

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

// ---------------------------------------------------------------------------
// POST — streaming chat with tool calling
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        // Authenticate
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required for AI chat' },
                { status: 401 }
            );
        }

        // Parse request body — Vercel AI SDK v6 useChat sends UIMessage[] (parts format)
        const body = await request.json();
        const {
            messages: incomingMessages,
            personality = 'storm',
            userContext: rawUserContext,
        } = body as {
            messages: Array<{
                role: string;
                parts?: Array<{ type: string; text?: string }>;
                content?: string;
            }>;
            personality?: string;
            userContext?: unknown;
        };

        let userContext: AIUserContext | null = null;
        if (rawUserContext != null) {
            const parsed = userContextSchema.safeParse(rawUserContext);
            if (parsed.success) {
                userContext = parsed.data;
            }
        }

        const aiPersonality: AIPersonality =
            ['storm', 'sass', 'chill'].includes(personality)
                ? (personality as AIPersonality)
                : 'storm';

        if (!incomingMessages?.length) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Extract text from last user message (UIMessage has parts, not content)
        const lastUserMsg = [...incomingMessages]
            .reverse()
            .find(m => m.role === 'user');
        const lastUserText = lastUserMsg?.parts
            ?.filter(p => p.type === 'text')
            .map(p => p.text ?? '')
            .join('')
            ?? (lastUserMsg?.content as string ?? '');

        if (lastUserText.length > 4000) {
            return NextResponse.json(
                { error: 'Message exceeds maximum length of 4000 characters' },
                { status: 400 }
            );
        }

        // Check rate limit
        const rateLimit = await checkRateLimit(user.id);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    resetAt: rateLimit.resetAt.toISOString(),
                    remaining: 0,
                },
                { status: 429 }
            );
        }

        const persistentMemory = await getUserAIMemory(user.id).catch((err) => {
            console.error('[Chat API] Failed to load user AI memory:', err);
            return { memoryNotes: '', recentLocations: [] as string[] };
        });

        const chatTools = {
            ...weatherTools,
            ...createUserMemoryTools(user.id),
        };

        // Convert UIMessage[] (from useChat) → ModelMessage[] (for streamText)
        // AI SDK v6 useChat sends parts format; streamText expects content format.
        const allMessages = await convertToModelMessages(
            incomingMessages as Parameters<typeof convertToModelMessages>[0],
            { tools: chatTools }
        );

        // Build system prompt (no more data injection — tools handle data)
        const currentDatetime = new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
        });

        const systemPrompt = buildSystemPrompt(
            currentDatetime,
            aiPersonality,
            userContext,
            persistentMemory
        );

        // Save the latest user message to Supabase (fire and forget)
        if (lastUserText) {
            saveMessage(user.id, {
                role: 'user',
                content: lastUserText,
            }).catch(err =>
                console.error('[Chat API] Failed to save user message:', err)
            );
        }

        // Stream with tool calling
        const result = streamText({
            model: anthropic('claude-sonnet-4-20250514'),
            system: systemPrompt,
            messages: allMessages,
            tools: chatTools,
            stopWhen: stepCountIs(8),
            maxOutputTokens: 4096,
            onFinish: async ({ text }) => {
                // Save assistant response to history
                if (text) {
                    try {
                        await saveMessage(user.id, {
                            role: 'assistant',
                            content: text,
                        });
                    } catch (saveError) {
                        console.error('[Chat API] Failed to save assistant message:', saveError);
                    }
                }
            },
        });

        // Return UI message stream (required for useChat tool calling)
        return result.toUIMessageStreamResponse({
            headers: {
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('[Chat API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// DELETE — clear persisted chat history for this user
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await clearChatHistory(user.id);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[Chat API] DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to clear chat history' },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// GET — rate limit status + conversation history
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check if client wants history
        const { searchParams } = new URL(request.url);
        const wantsHistory = searchParams.get('history') === 'true';

        if (wantsHistory) {
            try {
                const messages = await getRecentMessages(user.id, 10);
                return NextResponse.json({ messages });
            } catch (err) {
                console.error('[Chat API] Failed to fetch history:', err);
                return NextResponse.json({ messages: [] });
            }
        }

        // Default: return rate limit status
        const rateLimit = await getRateLimitStatus(user.id);
        return NextResponse.json({
            rateLimit: {
                remaining: rateLimit.remaining,
                resetAt: rateLimit.resetAt.toISOString(),
                limit: 30,
            },
        });
    } catch (error) {
        console.error('[Chat API] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}

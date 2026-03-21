/**
 * AI SDK tools that persist per-user memory (Supabase).
 * Created per request with userId bound in closures.
 */

import { tool } from 'ai';
import { z } from 'zod';
import {
    appendMemoryFact,
    addRecentLocation,
    replaceMemoryNotes,
    clearAIMemory,
} from '@/lib/services/ai-memory-service';

export function createUserMemoryTools(userId: string) {
    return {
        save_user_memory_fact: tool({
            description:
                'Save a durable fact or preference about this user for future chats. Use when they say "remember", "always", "I prefer", "my home is", commute patterns, or similar. Keep each fact short and neutral (one line).',
            inputSchema: z.object({
                fact: z
                    .string()
                    .max(400)
                    .describe('Single concise fact, e.g. "Works night shifts; cares about evening forecasts for Austin, TX"'),
            }),
            execute: async ({ fact }) => {
                await appendMemoryFact(userId, fact);
                return { ok: true as const, stored: fact.slice(0, 400) };
            },
        }),

        save_user_location_interest: tool({
            description:
                'Record a city or region the user repeatedly cares about (home, family, frequent travel). Use when they focus on a place across sessions or say it is important. Complements weather tool calls.',
            inputSchema: z.object({
                location: z
                    .string()
                    .max(200)
                    .describe('Place name, e.g. "Portland, OR" or "Reykjavik"'),
            }),
            execute: async ({ location }) => {
                await addRecentLocation(userId, location);
                return { ok: true as const, stored: location.trim().slice(0, 200) };
            },
        }),

        replace_user_memory_notes: tool({
            description:
                'Replace ALL saved memory notes with a new bullet list. Use when the user asks to forget/correct stored facts, or to consolidate outdated notes into a shorter summary. Does not clear location interests unless you rewrite them into notes only.',
            inputSchema: z.object({
                notes: z
                    .string()
                    .max(8000)
                    .describe('Full replacement text; use Markdown bullets or plain lines. Empty string clears notes only.'),
            }),
            execute: async ({ notes }) => {
                await replaceMemoryNotes(userId, notes);
                return { ok: true as const, length: notes.trim().length };
            },
        }),

        clear_user_ai_memory: tool({
            description:
                'Clear stored AI memory when the user explicitly asks to wipe what the assistant remembers. Use scope "all" for complete reset, "notes" for facts only, "locations" for the recent-places list only.',
            inputSchema: z.object({
                scope: z.enum(['notes', 'locations', 'all']),
            }),
            execute: async ({ scope }) => {
                await clearAIMemory(userId, scope);
                return { ok: true as const, cleared: scope };
            },
        }),
    };
}

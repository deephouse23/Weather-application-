/**
 * Persistent AI memory per user (Supabase).
 * Stores free-form notes and a deduped list of locations the user cares about.
 */

import { createClient } from '@supabase/supabase-js';

const MAX_NOTES_CHARS = 10_000;
const MAX_FACT_LINE = 400;
const MAX_RECENT_LOCATIONS = 20;
const MAX_LOCATION_LEN = 200;

export interface UserAIMemory {
    memoryNotes: string;
    recentLocations: string[];
}

function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

function trimNotes(text: string): string {
    if (text.length <= MAX_NOTES_CHARS) return text;
    return text.slice(text.length - MAX_NOTES_CHARS);
}

export async function getUserAIMemory(userId: string): Promise<UserAIMemory> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('user_ai_memory')
        .select('memory_notes, recent_locations')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('[ai-memory] getUserAIMemory:', error);
        return { memoryNotes: '', recentLocations: [] };
    }

    if (!data) {
        return { memoryNotes: '', recentLocations: [] };
    }

    const locs = data.recent_locations;
    const recentLocations = Array.isArray(locs)
        ? locs.filter((x): x is string => typeof x === 'string')
        : [];

    return {
        memoryNotes: typeof data.memory_notes === 'string' ? data.memory_notes : '',
        recentLocations,
    };
}

async function upsertRow(
    userId: string,
    patch: { memory_notes?: string; recent_locations?: string[] }
): Promise<void> {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { error } = await supabase.from('user_ai_memory').upsert(
        {
            user_id: userId,
            updated_at: now,
            ...patch,
        },
        { onConflict: 'user_id' }
    );

    if (error) {
        console.error('[ai-memory] upsertRow:', error);
        throw new Error('Failed to save AI memory');
    }
}

export async function appendMemoryFact(userId: string, fact: string): Promise<void> {
    const line = fact.trim().slice(0, MAX_FACT_LINE);
    if (!line) return;

    const current = await getUserAIMemory(userId);
    const prefix = current.memoryNotes.trim() ? `${current.memoryNotes.trim()}\n` : '';
    const next = trimNotes(`${prefix}- ${line}`);
    await upsertRow(userId, { memory_notes: next });
}

export async function addRecentLocation(userId: string, location: string): Promise<void> {
    const normalized = location.trim().slice(0, MAX_LOCATION_LEN);
    if (!normalized) return;

    const current = await getUserAIMemory(userId);
    const lower = normalized.toLowerCase();
    const filtered = current.recentLocations.filter(
        (l) => l.toLowerCase() !== lower
    );
    const next = [normalized, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
    await upsertRow(userId, { recent_locations: next });
}

export async function replaceMemoryNotes(userId: string, notes: string): Promise<void> {
    const next = trimNotes(notes.trim().slice(0, MAX_NOTES_CHARS));
    await upsertRow(userId, { memory_notes: next });
}

export type ClearAIMemoryScope = 'notes' | 'locations' | 'all';

export async function clearAIMemory(userId: string, scope: ClearAIMemoryScope): Promise<void> {
    if (scope === 'all') {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('user_ai_memory').delete().eq('user_id', userId);
        if (error) {
            console.error('[ai-memory] clearAIMemory:', error);
            throw new Error('Failed to clear AI memory');
        }
        return;
    }

    if (scope === 'notes') {
        await upsertRow(userId, { memory_notes: '' });
        return;
    }

    await upsertRow(userId, { recent_locations: [] });
}

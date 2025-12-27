/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Chat Rate Limiter Service
 * Implements per-user rate limiting using Supabase (15 queries per hour)
 */

import { createClient } from '@supabase/supabase-js';

const RATE_LIMIT_QUERIES = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

// Get Supabase admin client for rate limiting
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing for rate limiting');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

    // Get current rate limit record
    const { data: existing, error: fetchError } = await supabase
        .from('chat_rate_limits')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine for new users
        console.error('Rate limit fetch error:', fetchError);
        throw new Error('Failed to check rate limit');
    }

    // No existing record - create new one
    if (!existing) {
        const { error: insertError } = await supabase
            .from('chat_rate_limits')
            .insert({
                user_id: userId,
                window_start: now.toISOString(),
                query_count: 1
            });

        if (insertError) {
            console.error('Rate limit insert error:', insertError);
            throw new Error('Failed to create rate limit record');
        }

        return {
            allowed: true,
            remaining: RATE_LIMIT_QUERIES - 1,
            resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
        };
    }

    const existingWindowStart = new Date(existing.window_start);

    // Check if window has expired
    if (existingWindowStart < windowStart) {
        // Reset the window
        const { error: updateError } = await supabase
            .from('chat_rate_limits')
            .update({
                window_start: now.toISOString(),
                query_count: 1
            })
            .eq('user_id', userId);

        if (updateError) {
            console.error('Rate limit reset error:', updateError);
            throw new Error('Failed to reset rate limit');
        }

        return {
            allowed: true,
            remaining: RATE_LIMIT_QUERIES - 1,
            resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
        };
    }

    // Window is still active - check count
    if (existing.query_count >= RATE_LIMIT_QUERIES) {
        const resetAt = new Date(existingWindowStart.getTime() + RATE_LIMIT_WINDOW_MS);
        return {
            allowed: false,
            remaining: 0,
            resetAt
        };
    }

    // Increment counter
    const newCount = existing.query_count + 1;
    const { error: incrementError } = await supabase
        .from('chat_rate_limits')
        .update({ query_count: newCount })
        .eq('user_id', userId);

    if (incrementError) {
        console.error('Rate limit increment error:', incrementError);
        throw new Error('Failed to update rate limit');
    }

    return {
        allowed: true,
        remaining: RATE_LIMIT_QUERIES - newCount,
        resetAt: new Date(existingWindowStart.getTime() + RATE_LIMIT_WINDOW_MS)
    };
}

export async function getRateLimitStatus(userId: string): Promise<RateLimitResult> {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

    const { data: existing } = await supabase
        .from('chat_rate_limits')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!existing) {
        return {
            allowed: true,
            remaining: RATE_LIMIT_QUERIES,
            resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
        };
    }

    const existingWindowStart = new Date(existing.window_start);

    if (existingWindowStart < windowStart) {
        return {
            allowed: true,
            remaining: RATE_LIMIT_QUERIES,
            resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
        };
    }

    const remaining = Math.max(0, RATE_LIMIT_QUERIES - existing.query_count);
    return {
        allowed: remaining > 0,
        remaining,
        resetAt: new Date(existingWindowStart.getTime() + RATE_LIMIT_WINDOW_MS)
    };
}

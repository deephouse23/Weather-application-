/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Chat History Service
 * Persists chat messages in Supabase for logged-in users
 */

import { createClient } from '@supabase/supabase-js';

export interface ChatMessage {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    metadata?: {
        action?: {
            type: string;
            location?: string;
        };
    };
    created_at?: string;
}

// Get Supabase admin client
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function saveMessage(
    userId: string,
    message: ChatMessage
): Promise<void> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from('chat_messages')
        .insert({
            user_id: userId,
            role: message.role,
            content: message.content,
            metadata: message.metadata || null
        });

    if (error) {
        console.error('Failed to save chat message:', error);
        throw new Error('Failed to save message');
    }
}

export async function getRecentMessages(
    userId: string,
    limit: number = 20
): Promise<ChatMessage[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch chat history:', error);
        throw new Error('Failed to fetch messages');
    }

    // Return in chronological order (oldest first)
    return (data || []).reverse();
}

export async function clearChatHistory(userId: string): Promise<void> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('Failed to clear chat history:', error);
        throw new Error('Failed to clear history');
    }
}

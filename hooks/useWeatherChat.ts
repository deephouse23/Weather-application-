/**
 * 16-Bit Weather Platform - useWeatherChat Hook
 *
 * Wraps Vercel AI SDK v6's useChat for the weather assistant.
 * Handles auth headers, personality selection, rate limit tracking,
 * and conversation history seeding.
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useAuth } from '@/lib/auth';
import { APP_CONSTANTS, safeLocalStorage } from '@/lib/utils';
import type { AIUserContext } from '@/lib/services/ai-config';

export type AIPersonality = 'storm' | 'sass' | 'chill';

const AI_PERSONALITY_KEY = 'ai-personality-preference';

export interface RateLimitInfo {
    remaining: number;
    resetAt: string;
    limit: number;
}

export function useWeatherChat() {
    const { user, session, profile } = useAuth();
    const [personality, setPersonalityState] = useState<AIPersonality>('storm');
    const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [input, setInput] = useState('');

    const isAuthenticated = !!user && !!session;

    const userContext = useMemo((): AIUserContext | null => {
        if (!isAuthenticated) return null;
        const storedCity = safeLocalStorage.get(APP_CONSTANTS.STORAGE_KEYS.WEATHER_CITY);
        const primary =
            profile?.default_location?.trim() ||
            storedCity?.trim() ||
            null;
        return {
            primaryLocation: primary,
            preferredUnits: profile?.preferred_units ?? null,
            timezone: profile?.timezone?.trim() || null,
            displayName:
                profile?.full_name?.trim() ||
                profile?.username?.trim() ||
                null,
        };
    }, [
        isAuthenticated,
        profile?.default_location,
        profile?.preferred_units,
        profile?.timezone,
        profile?.full_name,
        profile?.username,
    ]);

    // Load personality from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(AI_PERSONALITY_KEY);
            if (saved && ['storm', 'sass', 'chill'].includes(saved)) {
                setPersonalityState(saved as AIPersonality);
            }
        }
    }, []);

    const setPersonality = useCallback((p: AIPersonality) => {
        setPersonalityState(p);
        if (typeof window !== 'undefined') {
            localStorage.setItem(AI_PERSONALITY_KEY, p);
        }
    }, []);

    // Memoize transport so useChat doesn't re-create on every render
    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: '/api/chat',
                body: { personality, userContext },
                headers: session?.access_token
                    ? { Authorization: `Bearer ${session.access_token}` }
                    : undefined,
            }),
        [personality, session?.access_token, userContext]
    );

    const refreshRateLimit = useCallback(async () => {
        if (!session?.access_token) return;
        try {
            const res = await fetch('/api/chat', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.rateLimit) {
                    setRateLimit(data.rateLimit);
                }
            }
        } catch (err) {
            console.error('[useWeatherChat] Failed to refresh rate limit:', err);
        }
    }, [session?.access_token]);

    // Vercel AI SDK v6 useChat
    const {
        messages,
        status,
        error: chatError,
        setMessages,
        sendMessage: sdkSendMessage,
    } = useChat({
        transport,
        experimental_throttle: 50,
        onError: (err) => {
            console.error('[useWeatherChat] Error:', err);
        },
        onFinish: () => {
            void refreshRateLimit();
        },
    });

    // Derive isLoading from status
    const isLoading = status === 'submitted' || status === 'streaming';

    // Load conversation history on mount
    useEffect(() => {
        if (!isAuthenticated || !session?.access_token || historyLoaded) return;

        const loadHistory = async () => {
            try {
                const res = await fetch('/api/chat?history=true', {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages?.length) {
                        const historyMsgs = data.messages.map(
                            (msg: { id?: string; role: string; content: string }, i: number) => ({
                                id: msg.id || `history-${i}`,
                                role: msg.role as 'user' | 'assistant',
                                parts: [{ type: 'text' as const, text: msg.content }],
                            })
                        );
                        setMessages(historyMsgs);
                    }
                }
            } catch (err) {
                console.error('[useWeatherChat] Failed to load history:', err);
            }
            setHistoryLoaded(true);
        };

        loadHistory();
    }, [isAuthenticated, session?.access_token, historyLoaded, setMessages]);

    // Fetch rate limit status on mount
    useEffect(() => {
        if (!isAuthenticated || !session?.access_token) return;

        const fetchRateLimit = async () => {
            try {
                const res = await fetch('/api/chat', {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.rateLimit) {
                        setRateLimit(data.rateLimit);
                    }
                }
            } catch (err) {
                console.error('[useWeatherChat] Failed to fetch rate limit:', err);
            }
        };

        fetchRateLimit();
    }, [isAuthenticated, session?.access_token]);

    // Clear chat (server history + local UI)
    const clearChat = useCallback(async () => {
        if (session?.access_token) {
            try {
                const res = await fetch('/api/chat', {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                if (!res.ok) {
                    console.error('[useWeatherChat] Failed to clear server chat history');
                }
            } catch (err) {
                console.error('[useWeatherChat] Clear history request failed:', err);
            }
        }
        setMessages([]);
    }, [setMessages, session?.access_token]);

    // Handle input changes (for controlled input)
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setInput(e.target.value);
        },
        []
    );

    // Submit via form event
    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!isAuthenticated || !input.trim() || isLoading) return;
            sdkSendMessage({ text: input.trim() });
            setInput('');
        },
        [isAuthenticated, input, isLoading, sdkSendMessage]
    );

    // Send a message programmatically (for quick actions / suggested prompts)
    const sendMessage = useCallback(
        (text: string): boolean => {
            if (!isAuthenticated || !text.trim() || isLoading) return false;
            sdkSendMessage({ text: text.trim() });
            return true;
        },
        [isAuthenticated, isLoading, sdkSendMessage]
    );

    // Error as string
    const error = chatError?.message ?? null;

    return {
        // State
        isAuthenticated,
        isLoading,
        error,
        rateLimit,
        messages,
        personality,

        // Actions
        setPersonality,
        handleSubmit,
        handleInputChange,
        sendMessage,
        clearChat,
        setInput,

        // Controlled input value
        input,
    };
}

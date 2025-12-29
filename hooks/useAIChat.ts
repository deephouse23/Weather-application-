/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * useAIChat Hook
 * Handles AI chat state with streaming support using fetch API
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { parseAIResponse, type ChatAction } from '@/lib/services/ai-config';

export type AIPersonality = 'storm' | 'sass' | 'chill';

const AI_PERSONALITY_KEY = 'ai-personality-preference';

export interface AIResponse {
    message: string;
    action: ChatAction;
}

export interface RateLimitInfo {
    remaining: number;
    resetAt: string;
    limit: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    action?: ChatAction;
    timestamp: Date;
}

interface WeatherContext {
    location?: string;
    temperature?: number;
    condition?: string;
}

export function useAIChat() {
    const { user, session } = useAuth();
    const [personality, setPersonalityState] = useState<AIPersonality>('storm');
    const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<ChatAction | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const isAuthenticated = !!user && !!session;

    // Load personality from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(AI_PERSONALITY_KEY);
            if (saved && ['storm', 'sass', 'chill'].includes(saved)) {
                setPersonalityState(saved as AIPersonality);
            }
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Wrapper to persist personality changes
    const setPersonality = useCallback((newPersonality: AIPersonality) => {
        setPersonalityState(newPersonality);
        if (typeof window !== 'undefined') {
            localStorage.setItem(AI_PERSONALITY_KEY, newPersonality);
        }
    }, []);

    // Check if input is a simple location search (no AI needed)
    const isSimpleSearch = useCallback((input: string): boolean => {
        const trimmed = input.trim();

        // ZIP code - definitely simple
        if (/^\d{5}(-\d{4})?$/.test(trimmed)) return true;

        // Coordinates - use bounded quantifiers to prevent ReDoS
        if (/^-?\d{1,3}(\.\d{1,10})?,\s*-?\d{1,3}(\.\d{1,10})?$/.test(trimmed)) return true;

        // Very short "City, ST" with 2-letter state code only
        if (/^[A-Za-z]+,\s*[A-Za-z]{2}$/.test(trimmed) && trimmed.length < 25) return true;

        return false;
    }, []);

    // Get latest response
    const response: AIResponse | null = messages.length > 0
        ? (() => {
            const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
            return lastAssistant ? parseAIResponse(lastAssistant.content) : null;
        })()
        : null;

    // Send message to AI with streaming
    const sendMessage = useCallback(async (
        message: string,
        weatherContext?: WeatherContext
    ): Promise<{ isSimpleSearch: boolean; location?: string; aiResponse?: AIResponse }> => {
        // If not authenticated, treat as simple search
        if (!isAuthenticated || !session?.access_token) {
            return { isSimpleSearch: true, location: message.trim() };
        }

        // Check if it's a simple search
        if (isSimpleSearch(message)) {
            return { isSimpleSearch: true, location: message.trim() };
        }

        // Abort any existing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);

        // Add user message immediately
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    message,
                    weatherContext,
                    personality
                }),
                signal: abortControllerRef.current.signal
            });

            // Extract rate limit info from headers
            const remaining = res.headers.get('X-RateLimit-Remaining');
            const resetAt = res.headers.get('X-RateLimit-Reset');
            if (remaining && resetAt) {
                setRateLimit({
                    remaining: parseInt(remaining, 10),
                    resetAt,
                    limit: 30
                });
            }

            if (!res.ok) {
                if (res.status === 429) {
                    const data = await res.json();
                    setRateLimit({
                        remaining: 0,
                        resetAt: data.resetAt || new Date().toISOString(),
                        limit: 30
                    });
                    throw new Error('Rate limit exceeded. Please wait before sending more messages.');
                }
                if (res.status === 401) {
                    throw new Error('Authentication required for AI chat');
                }
                const data = await res.json();
                throw new Error(data.error || 'Failed to get AI response');
            }

            // Handle simple search response - clone response to avoid consuming body
            const contentType = res.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                const jsonRes = res.clone();
                const data = await jsonRes.json();
                if (data.isSimpleSearch) {
                    // Remove the user message we just added since it's a simple search
                    setMessages(prev => prev.filter(m => m.id !== userMessage.id));
                    setIsLoading(false);
                    return { isSimpleSearch: true, location: data.location };
                }
                // If not simple search but got JSON error, handle it
                if (data.error) {
                    throw new Error(data.error);
                }
            }

            // Handle streaming response
            const reader = res.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let fullText = '';
            const assistantMessageId = `ai-${Date.now()}`;

            // Add placeholder for assistant message
            setMessages(prev => [...prev, {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                timestamp: new Date()
            }]);

            // Read streaming response
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;

                // Update the assistant message with streamed content
                setMessages(prev => prev.map(m =>
                    m.id === assistantMessageId
                        ? { ...m, content: fullText }
                        : m
                ));
            }

            // Parse final response for action
            const parsed = parseAIResponse(fullText);
            setLastAction(parsed.action);

            // Update final message with action
            setMessages(prev => prev.map(m =>
                m.id === assistantMessageId
                    ? { ...m, content: parsed.message, action: parsed.action }
                    : m
            ));

            setIsLoading(false);
            return { isSimpleSearch: false, aiResponse: parsed };

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Request was aborted - clean up both messages
                setMessages(prev => prev.filter(m =>
                    m.id !== userMessage.id && !m.id.startsWith('ai-')
                ));
                setIsLoading(false);
                return { isSimpleSearch: false };
            }

            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setIsLoading(false);

            // Remove both user message and any assistant placeholder on error
            setMessages(prev => prev.filter(m =>
                m.id !== userMessage.id && !m.id.startsWith('ai-')
            ));

            throw err;
        }
    }, [isAuthenticated, session?.access_token, isSimpleSearch, personality]);

    // Clear all messages
    const clearResponse = useCallback(() => {
        setMessages([]);
        setLastAction(null);
        setError(null);
    }, []);

    // Fetch rate limit status
    const fetchRateLimitStatus = useCallback(async () => {
        if (!isAuthenticated || !session?.access_token) return;

        try {
            const res = await fetch('/api/chat', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.rateLimit) {
                    setRateLimit({
                        remaining: data.rateLimit.remaining,
                        resetAt: data.rateLimit.resetAt,
                        limit: data.rateLimit.limit
                    });
                }
            }
        } catch (err) {
            console.error('Failed to fetch rate limit:', err);
        }
    }, [isAuthenticated, session?.access_token]);

    // Get current user input being streamed (most recent)
    const currentUserInput = isLoading
        ? [...messages].reverse().find(m => m.role === 'user')?.content
        : null;

    return {
        isAuthenticated,
        isLoading,
        response,
        error,
        rateLimit,
        personality,
        setPersonality,
        sendMessage,
        clearResponse,
        fetchRateLimitStatus,
        isSimpleSearch,
        messages,
        currentUserInput,
        lastAction
    };
}

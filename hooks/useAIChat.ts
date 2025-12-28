/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * useAIChat Hook
 * Handles AI chat state and API communication
 */

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

export type AIPersonality = 'storm' | 'sass' | 'chill';

export interface ChatAction {
    type: 'load_weather' | 'navigate_radar' | 'none';
    location?: string;
    date?: string;
}

export interface AIResponse {
    message: string;
    action: ChatAction;
}

export interface RateLimitInfo {
    remaining: number;
    resetAt: string;
    limit: number;
}

interface WeatherContext {
    location?: string;
    temperature?: number;
    condition?: string;
}

export function useAIChat() {
    const { user, session } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<AIResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
    const [personality, setPersonality] = useState<AIPersonality>('storm');

    const isAuthenticated = !!user && !!session;

    // Check if input is a simple location search (no AI needed)
    // Be very permissive - only bypass AI for obvious simple searches
    const isSimpleSearch = useCallback((input: string): boolean => {
        const trimmed = input.trim();

        // ZIP code - definitely simple
        if (/^\d{5}(-\d{4})?$/.test(trimmed)) return true;

        // Coordinates - definitely simple
        if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(trimmed)) return true;

        // Very short "City, ST" with 2-letter state code only
        if (/^[A-Za-z]+,\s*[A-Za-z]{2}$/.test(trimmed) && trimmed.length < 25) return true;

        // Everything else goes to AI
        return false;
    }, []);

    // Send message to AI
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

        setIsLoading(true);
        setError(null);

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
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    setError('Rate limit exceeded. Please wait before sending more messages.');
                    setRateLimit({
                        remaining: 0,
                        resetAt: data.resetAt,
                        limit: 15
                    });
                    throw new Error('Rate limit exceeded');
                }
                throw new Error(data.error || 'Failed to get AI response');
            }

            // Handle simple search response from API
            if (data.isSimpleSearch) {
                return { isSimpleSearch: true, location: data.location };
            }

            // Handle AI response
            const aiResponse: AIResponse = {
                message: data.message,
                action: data.action
            };

            setResponse(aiResponse);

            if (data.rateLimit) {
                setRateLimit({
                    remaining: data.rateLimit.remaining,
                    resetAt: data.rateLimit.resetAt,
                    limit: 15
                });
            }

            return { isSimpleSearch: false, aiResponse };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, session?.access_token, isSimpleSearch]);

    // Clear current response
    const clearResponse = useCallback(() => {
        setResponse(null);
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
        isSimpleSearch
    };
}

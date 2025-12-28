/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * AI Response Panel
 * Displays AI chat responses with scrollable message history
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Bot, Loader2, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AIResponseAction {
    type: 'load_weather' | 'navigate_radar' | 'none';
    location?: string;
    date?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    action?: AIResponseAction;
    timestamp: Date;
}

interface AIResponsePanelProps {
    message: string | null;
    action?: AIResponseAction;
    isLoading: boolean;
    onDismiss: () => void;
    onActionClick?: (action: AIResponseAction) => void;
    rateLimit?: {
        remaining: number;
        resetAt: string;
    };
    theme?: string;
    messages?: ChatMessage[];
    userInput?: string;
}

export function AIResponsePanel({
    message,
    action,
    isLoading,
    onDismiss,
    onActionClick,
    rateLimit,
    theme,
    messages = [],
    userInput
}: AIResponsePanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, message, isLoading]);

    // Build display messages from history + current
    const displayMessages: ChatMessage[] = [...messages];

    // Add current user input if present and not already in messages
    if (userInput && !messages.some(m => m.content === userInput && m.role === 'user')) {
        displayMessages.push({
            id: 'current-user',
            role: 'user',
            content: userInput,
            timestamp: new Date()
        });
    }

    // Add current AI response if present
    if (message && !messages.some(m => m.content === message && m.role === 'assistant')) {
        displayMessages.push({
            id: 'current-ai',
            role: 'assistant',
            content: message,
            action,
            timestamp: new Date()
        });
    }

    if (displayMessages.length === 0 && !isLoading) return null;

    return (
        <div className={cn(
            "mt-3 mx-2 sm:mx-0 border-2 rounded-lg overflow-hidden transition-all duration-300",
            "bg-weather-bg-elev border-weather-border",
            isExpanded ? "max-h-[400px]" : "max-h-12"
        )}>
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer bg-weather-bg border-b border-weather-border"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-weather-primary" />
                    <span className="text-xs uppercase tracking-wider text-weather-primary font-mono">
                        AI Assistant
                    </span>
                    {displayMessages.length > 0 && (
                        <span className="text-xs text-weather-muted font-mono">
                            ({displayMessages.length} messages)
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="h-6 w-6 text-weather-muted hover:text-weather-danger"
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* Scrollable Message Container */}
            {isExpanded && (
                <div
                    ref={scrollRef}
                    className="p-3 overflow-y-auto max-h-[340px] space-y-3 scroll-smooth"
                >
                    {displayMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-2",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-weather-primary/20 flex items-center justify-center">
                                    <Bot className="w-3 h-3 text-weather-primary" />
                                </div>
                            )}
                            <div
                                className={cn(
                                    "max-w-[80%] px-3 py-2 rounded-lg font-mono text-sm",
                                    msg.role === 'user'
                                        ? "bg-weather-primary/20 text-weather-text"
                                        : "bg-weather-bg text-weather-text border border-weather-border"
                                )}
                            >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                {/* Action button for AI messages */}
                                {msg.role === 'assistant' && msg.action && msg.action.type !== 'none' && msg.action.location && onActionClick && (
                                    <div className="mt-2 pt-2 border-t border-weather-border/50">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onActionClick(msg.action!)}
                                            className="text-xs uppercase tracking-wider font-mono border-weather-primary text-weather-primary hover:bg-weather-primary hover:text-weather-bg"
                                        >
                                            {msg.action.type === 'load_weather' ? 'Load Weather' : 'View Radar'} for {msg.action.location}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-weather-accent/20 flex items-center justify-center">
                                    <User className="w-3 h-3 text-weather-accent" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-2 justify-start">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-weather-primary/20 flex items-center justify-center">
                                <Bot className="w-3 h-3 text-weather-primary" />
                            </div>
                            <div className="bg-weather-bg border border-weather-border px-3 py-2 rounded-lg">
                                <div className="flex items-center gap-2 text-weather-muted">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm font-mono">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Chat history button component
interface ChatHistoryButtonProps {
    onClick: () => void;
    hasHistory: boolean;
    theme?: string;
}

export function ChatHistoryButton({ onClick, hasHistory, theme }: ChatHistoryButtonProps) {
    if (!hasHistory) return null;

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="text-xs uppercase tracking-wider font-mono text-weather-muted hover:text-weather-primary"
        >
            <MessageSquare className="w-3 h-3 mr-1" />
            History
        </Button>
    );
}


/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * AI Response Panel
 * Displays AI chat responses below the search bar
 */

'use client';

import { useState } from 'react';
import { X, Bot, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AIResponseAction {
    type: 'load_weather' | 'navigate_radar' | 'none';
    location?: string;
    date?: string;
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
}

export function AIResponsePanel({
    message,
    action,
    isLoading,
    onDismiss,
    onActionClick,
    rateLimit,
    theme
}: AIResponsePanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!message && !isLoading) return null;

    return (
        <div className={cn(
            "mt-3 mx-2 sm:mx-0 border-2 rounded-lg overflow-hidden transition-all duration-300",
            "bg-weather-bg-elev border-weather-border",
            isExpanded ? "max-h-96" : "max-h-12"
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
                    {rateLimit && (
                        <span className="text-xs text-weather-muted font-mono">
                            ({rateLimit.remaining}/15)
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

            {/* Content */}
            {isExpanded && (
                <div className="p-3">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-weather-muted">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-mono">Thinking...</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* AI Message */}
                            <p className="text-sm text-weather-text font-mono leading-relaxed">
                                {message}
                            </p>

                            {/* Action Buttons */}
                            {action && action.type !== 'none' && action.location && onActionClick && (
                                <div className="flex flex-wrap gap-2">
                                    {action.type === 'load_weather' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onActionClick(action)}
                                            className="text-xs uppercase tracking-wider font-mono border-weather-primary text-weather-primary hover:bg-weather-primary hover:text-weather-bg"
                                        >
                                            Load Weather for {action.location}
                                        </Button>
                                    )}
                                    {action.type === 'navigate_radar' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onActionClick(action)}
                                            className="text-xs uppercase tracking-wider font-mono border-weather-primary text-weather-primary hover:bg-weather-primary hover:text-weather-bg"
                                        >
                                            View Radar for {action.location}
                                        </Button>
                                    )}
                                </div>
                            )}
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

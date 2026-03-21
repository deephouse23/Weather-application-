/**
 * 16-Bit Weather Platform - AI Chat Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Full-featured AI chat interface with tool-calling support.
 * The AI fetches weather/seismic/aviation data on-demand via tools.
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { Bot, User, Send, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-state';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Button } from '@/components/ui/button';
import { useWeatherChat, type AIPersonality } from '@/hooks/useWeatherChat';
import { AssistantMarkdown } from '@/components/ai/assistant-markdown';

interface AIChatProps {
  onSendMessage?: (message: string) => void;
  initialPrompt?: string;
  /** When set, sends this message once (e.g. quick actions). Parent should clear via onPendingSendConsumed after send starts. */
  pendingSend?: string | null;
  onPendingSendConsumed?: () => void;
}

export default function AIChat({
  onSendMessage,
  initialPrompt,
  pendingSend,
  onPendingSendConsumed,
}: AIChatProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');

  const {
    isAuthenticated,
    isLoading,
    error,
    rateLimit,
    messages,
    personality,
    setPersonality,
    handleSubmit,
    handleInputChange,
    sendMessage,
    clearChat,
    setInput,
    input,
  } = useWeatherChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial prompt (prefill only — URL auto-send is handled on the page via pendingSend)
  useEffect(() => {
    if (initialPrompt && isAuthenticated) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, isAuthenticated, setInput]);

  // One-shot send from parent (quick actions, suggested prompts, ?prompt=)
  useEffect(() => {
    if (!pendingSend?.trim() || !isAuthenticated || isLoading) return;
    const sent = sendMessage(pendingSend.trim());
    if (sent) {
      onPendingSendConsumed?.();
    }
  }, [pendingSend, isAuthenticated, isLoading, sendMessage, onPendingSendConsumed]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isAuthenticated) return;
    onSendMessage?.(input.trim());
    handleSubmit(e);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const personalities: { id: AIPersonality; label: string; emoji: string }[] = [
    { id: 'storm', label: 'Storm', emoji: '\u26C8\uFE0F' },
    { id: 'sass', label: 'Sass', emoji: '\uD83D\uDC85' },
    { id: 'chill', label: 'Chill', emoji: '\uD83D\uDE0E' },
  ];

  if (!isAuthenticated) {
    return (
      <div className={cn(
        'container-primary p-8 text-center font-mono',
        themeClasses.background
      )}>
        <AlertCircle className={cn('w-12 h-12 mx-auto mb-4', themeClasses.accentText)} />
        <h3 className={cn('text-xl font-bold mb-2', themeClasses.headerText)}>
          AUTHENTICATION REQUIRED
        </h3>
        <p className={cn('text-sm mb-4', themeClasses.text)}>
          Sign in to access the AI Weather Assistant. It's free!
        </p>
        <Button
          variant="outline"
          className={cn('font-mono', themeClasses.borderColor)}
          onClick={() => window.location.href = '/'}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      'container-primary flex flex-col min-h-[min(720px,85vh)] h-[min(720px,85vh)]',
      themeClasses.background
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-3 border-b border-subtle'
      )}>
        <div className="flex items-center gap-2">
          <Bot className={cn('w-5 h-5', themeClasses.accentText)} />
          <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
            AI Weather Assistant
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Personality Selector */}
          <div className="flex gap-1">
            {personalities.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersonality(p.id)}
                className={cn(
                  'px-2 py-1 text-xs font-mono border transition-all glow-interactive',
                  personality === p.id
                    ? cn(themeClasses.accentBg, 'border-medium')
                    : cn('border-subtle hover:border-medium')
                )}
                title={p.label}
              >
                {p.emoji}
              </button>
            ))}
          </div>

          {/* Rate Limit */}
          {rateLimit && (
            <span className={cn('text-xs font-mono', themeClasses.text)}>
              {rateLimit.remaining} left
            </span>
          )}

          {/* Clear Button */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void clearChat()}
              className="p-1"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className={cn('w-16 h-16 mx-auto mb-4 opacity-50', themeClasses.text)} />
            <p className={cn('text-sm font-mono', themeClasses.text)}>
              Ask me about weather, aviation conditions, turbulence forecasts, or meteorology!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  themeClasses.accentBg
                )}>
                  <Bot className="w-4 h-4 text-black" />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[85%] p-3 rounded text-sm container-nested',
                  msg.role === 'user'
                    ? 'bg-gray-800 font-mono'
                    : cn(themeClasses.background, 'font-sans')
                )}
              >
                {/* Show tool invocations as status indicators */}
                {msg.parts?.map((part, i) => {
                  // Tool parts in AI SDK v6 have type like "tool-get_current_weather"
                  if (part.type.startsWith('tool-')) {
                    const toolPart = part as { type: string; toolCallId: string; state: string; errorText?: string };
                    const toolName = part.type
                      .replace(/^tool-/, '')
                      .replace(/_/g, ' ')
                      .replace(/^get /, '');
                    // AI SDK v6 states: input-streaming, input-available, output-available, output-error
                    const isRunning = toolPart.state === 'input-streaming' || toolPart.state === 'input-available';

                    if (isRunning) {
                      return (
                        <div
                          key={`tool-${i}`}
                          className={cn(
                            'flex items-center gap-2 text-xs py-1 mb-1',
                            themeClasses.text,
                            'opacity-70'
                          )}
                        >
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="font-mono uppercase">
                            Fetching {toolName}...
                          </span>
                        </div>
                      );
                    }

                    // Show error indicator for failed tool calls
                    if (toolPart.state === 'output-error') {
                      return (
                        <div
                          key={`tool-${i}`}
                          className={cn(
                            'flex items-center gap-2 text-xs py-1 mb-1',
                            'text-red-400 opacity-80'
                          )}
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span className="font-mono uppercase">
                            Failed to fetch {toolName}
                          </span>
                        </div>
                      );
                    }

                    // Tool completed (output-available) — don't render, AI synthesizes it
                    return null;
                  }

                  if (part.type === 'text' && 'text' in part) {
                    const textPart = part as { type: 'text'; text: string };
                    if (!textPart.text) return null;
                    if (msg.role === 'user') {
                      return (
                        <p
                          key={`text-${i}`}
                          className={cn('whitespace-pre-wrap', themeClasses.text)}
                        >
                          {textPart.text}
                        </p>
                      );
                    }
                    return (
                      <AssistantMarkdown
                        key={`text-${i}`}
                        text={textPart.text}
                        className={themeClasses.text}
                      />
                    );
                  }

                  return null;
                })}

                {/* Fallback for messages without parts (e.g. history messages) */}
                {(!msg.parts || msg.parts.length === 0) && (msg as unknown as { content?: string }).content && (
                  msg.role === 'user' ? (
                    <p className={cn('whitespace-pre-wrap', themeClasses.text)}>
                      {(msg as unknown as { content?: string }).content}
                    </p>
                  ) : (
                    <AssistantMarkdown
                      text={(msg as unknown as { content?: string }).content ?? ''}
                      className={themeClasses.text}
                    />
                  )
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3 justify-start">
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              themeClasses.accentBg
            )}>
              <Bot className="w-4 h-4 text-black" />
            </div>
            <div className={cn(
              'p-3 rounded text-sm container-nested font-sans',
              themeClasses.background
            )}>
              <LoadingSpinner size="sm" label="AI is thinking" className={themeClasses.accentText} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t-2 border-red-500">
          <p className="text-xs font-mono text-red-500">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleFormSubmit}
        className="p-3 border-t border-subtle"
      >
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask about weather, aviation, or turbulence... (Shift+Enter for newline)"
            disabled={isLoading}
            className={cn(
              'flex-1 min-h-[44px] max-h-40 resize-y px-3 py-2 font-mono text-sm border rounded',
              'bg-transparent focus:outline-none border-subtle focus:border-medium',
              themeClasses.text,
              isLoading && 'opacity-50'
            )}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'px-4 font-mono font-bold',
              themeClasses.accentBg,
              'hover:opacity-90'
            )}
            aria-label={isLoading ? "Sending message" : "Send message"}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" label="Sending message" />
            ) : (
              <Send className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export { AIChat };

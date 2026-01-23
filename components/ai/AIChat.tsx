/**
 * 16-Bit Weather Platform - AI Chat Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Full-featured AI chat interface for the dedicated AI page
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Trash2, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-state';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Button } from '@/components/ui/button';
import { useAIChat, type ChatMessage, type AIPersonality } from '@/hooks/useAIChat';
import { parseAIResponse } from '@/lib/services/ai-config';

interface AIChatProps {
  onSendMessage?: (message: string) => void;
  initialPrompt?: string;
}

export default function AIChat({ onSendMessage, initialPrompt }: AIChatProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  const {
    isAuthenticated,
    isLoading,
    error,
    rateLimit,
    personality,
    setPersonality,
    sendMessage,
    clearResponse,
    messages
  } = useAIChat();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && isAuthenticated) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isAuthenticated) return;

    const messageText = input.trim();
    setInput('');

    try {
      await sendMessage(messageText);
      onSendMessage?.(messageText);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const personalities: { id: AIPersonality; label: string; emoji: string }[] = [
    { id: 'storm', label: 'Storm', emoji: '⛈️' },
    { id: 'sass', label: 'Sass', emoji: '💅' },
    { id: 'chill', label: 'Chill', emoji: '😎' }
  ];

  if (!isAuthenticated) {
    return (
      <div className={cn(
        'border-4 p-8 text-center font-mono',
        themeClasses.borderColor,
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
      'border-4 flex flex-col h-[600px] max-h-[70vh]',
      themeClasses.borderColor,
      themeClasses.background
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-3 border-b-2',
        themeClasses.borderColor
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
                  'px-2 py-1 text-xs font-mono border-2 transition-all',
                  personality === p.id
                    ? cn(themeClasses.accentBg, themeClasses.borderColor)
                    : cn('border-gray-600 hover:border-gray-400')
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
              onClick={clearResponse}
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
          messages.map((msg) => {
            const parsedContent = msg.role === 'assistant'
              ? parseAIResponse(msg.content)
              : { message: msg.content };

            return (
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
                    'max-w-[80%] p-3 rounded font-mono text-sm border-2',
                    msg.role === 'user'
                      ? cn('bg-gray-800', themeClasses.borderColor)
                      : cn(themeClasses.background, themeClasses.borderColor)
                  )}
                >
                  <p className={cn('whitespace-pre-wrap', themeClasses.text)}>
                    {parsedContent.message}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              themeClasses.accentBg
            )}>
              <Bot className="w-4 h-4 text-black" />
            </div>
            <div className={cn(
              'p-3 rounded font-mono text-sm border-2',
              themeClasses.background,
              themeClasses.borderColor
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
        onSubmit={handleSubmit}
        className={cn('p-3 border-t-2', themeClasses.borderColor)}
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about weather, aviation, or turbulence..."
            disabled={isLoading}
            className={cn(
              'flex-1 px-3 py-2 font-mono text-sm border-2 rounded',
              'bg-transparent focus:outline-none',
              themeClasses.borderColor,
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

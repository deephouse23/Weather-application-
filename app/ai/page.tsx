/**
 * 16-Bit Weather Platform - AI Assistant Page
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Full-screen AI chat interface with aviation and weather intelligence
 */

'use client';

import React, { useState, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import { QuickActions, SuggestedPrompts } from '@/components/ai';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load the heavy chat component
const AIChat = lazy(() => import('@/components/ai/AIChat'));

function AIPageContent() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');
  const [chatInput, setChatInput] = useState('');

  const handleQuickAction = (prompt: string) => {
    setChatInput(prompt);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setChatInput(prompt);
  };

  return (
    <PageWrapper>
      <div className={cn('container mx-auto px-4 py-8', themeClasses.background)}>
        {/* Header Section */}
        <div className="mb-8">
          <h1
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 font-mono',
              themeClasses.accentText,
              themeClasses.glow
            )}
          >
            AI WEATHER ASSISTANT
          </h1>
          <p className={cn('text-base sm:text-lg font-mono max-w-3xl', themeClasses.text)}>
            Your intelligent weather companion. Ask about forecasts, turbulence conditions,
            aviation weather, or learn about meteorology. Powered by real-time data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Suspense fallback={
              <div className={cn('border-4 flex flex-col h-[600px] max-h-[70vh]', themeClasses.borderColor, themeClasses.background)}>
                <div className={cn('flex items-center justify-between p-3 border-b-2', themeClasses.borderColor)}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-5 h-5 rounded', themeClasses.accentBg)} />
                    <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>AI Weather Assistant</span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className={cn('text-sm font-mono animate-pulse', themeClasses.text)}>Loading AI assistant...</div>
                </div>
                <div className={cn('p-3 border-t-2', themeClasses.borderColor)}>
                  <div className={cn('w-full h-10 border-2 rounded animate-pulse', themeClasses.borderColor)} />
                </div>
              </div>
            }>
              <AIChat initialPrompt={initialPrompt || chatInput} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Context Indicator */}
            <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
              <CardContent className="p-4">
                <h3 className={cn('text-sm font-mono font-bold uppercase mb-3', themeClasses.headerText)}>
                  AI Context
                </h3>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className={themeClasses.text}>Weather Data</span>
                    <span className="text-green-500">LIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={themeClasses.text}>Aviation Alerts</span>
                    <span className="text-green-500">LIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={themeClasses.text}>Earthquake Data</span>
                    <span className="text-green-500">LIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={themeClasses.text}>Volcanic Activity</span>
                    <span className="text-green-500">LIVE</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
              <CardContent className="p-4">
                <QuickActions onActionClick={handleQuickAction} />
              </CardContent>
            </Card>

            {/* Suggested Prompts */}
            <SuggestedPrompts onPromptClick={handleSuggestedPrompt} />

            {/* Capabilities */}
            <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
              <CardContent className="p-4">
                <h3 className={cn('text-sm font-mono font-bold uppercase mb-3', themeClasses.headerText)}>
                  Capabilities
                </h3>
                <ul className={cn('space-y-2 text-xs font-mono', themeClasses.text)}>
                  <li className="flex items-start gap-2">
                    <span className={themeClasses.accentText}>•</span>
                    <span>Real-time weather analysis & forecasts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={themeClasses.accentText}>•</span>
                    <span>Aviation turbulence & SIGMET interpretation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={themeClasses.accentText}>•</span>
                    <span>Flight route weather analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={themeClasses.accentText}>•</span>
                    <span>Earthquake & seismic activity updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={themeClasses.accentText}>•</span>
                    <span>Weather education & explanations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className={cn(
          'mt-8 text-center text-xs font-mono py-4 border-t-2',
          themeClasses.borderColor,
          themeClasses.text
        )}>
          AI responses are for informational purposes only. Always verify critical information with official sources.
          Not for operational flight planning.
        </div>
      </div>
    </PageWrapper>
  );
}

export default function AIPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AIPageContent />
    </Suspense>
  );
}

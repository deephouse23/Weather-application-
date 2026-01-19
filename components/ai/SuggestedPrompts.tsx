/**
 * 16-Bit Weather Platform - Suggested Prompts Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Carousel of suggested prompts for new users
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Button } from '@/components/ui/button';

const suggestedPrompts = [
  {
    category: 'Aviation',
    prompts: [
      "I'm flying from LAX to JFK tomorrow. Should I expect turbulence?",
      "What SIGMETs are active over the Rocky Mountains?",
      "Explain what causes mountain wave turbulence.",
      "What altitude should I fly to avoid the jet stream?"
    ]
  },
  {
    category: 'Weather',
    prompts: [
      "What's causing the extreme temperatures today?",
      "Is there a storm system moving across the midwest?",
      "Why do hurricanes form in the Atlantic?",
      "What's the difference between a watch and a warning?"
    ]
  },
  {
    category: 'Education',
    prompts: [
      "How do meteorologists predict the weather?",
      "What are the different types of clouds?",
      "Explain the Coriolis effect in simple terms.",
      "What causes ball lightning?"
    ]
  }
];

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export default function SuggestedPrompts({ onPromptClick }: SuggestedPromptsProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);

  const currentCategory = suggestedPrompts[categoryIndex];
  const currentPrompt = currentCategory.prompts[promptIndex];

  // Auto-rotate prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((prev) => {
        if (prev >= currentCategory.prompts.length - 1) {
          setCategoryIndex((catIdx) => (catIdx + 1) % suggestedPrompts.length);
          return 0;
        }
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentCategory.prompts.length]);

  const handlePrev = () => {
    if (promptIndex > 0) {
      setPromptIndex(promptIndex - 1);
    } else {
      const newCatIndex = categoryIndex === 0 ? suggestedPrompts.length - 1 : categoryIndex - 1;
      setCategoryIndex(newCatIndex);
      setPromptIndex(suggestedPrompts[newCatIndex].prompts.length - 1);
    }
  };

  const handleNext = () => {
    if (promptIndex < currentCategory.prompts.length - 1) {
      setPromptIndex(promptIndex + 1);
    } else {
      setCategoryIndex((categoryIndex + 1) % suggestedPrompts.length);
      setPromptIndex(0);
    }
  };

  return (
    <div className={cn(
      'border-4 p-4 font-mono',
      themeClasses.borderColor,
      themeClasses.background
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className={cn('w-4 h-4', themeClasses.accentText)} />
          <span className={cn('text-xs font-bold uppercase', themeClasses.headerText)}>
            Try Asking
          </span>
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 border-2',
          themeClasses.borderColor,
          themeClasses.accentText
        )}>
          {currentCategory.category}
        </span>
      </div>

      {/* Prompt Display */}
      <button
        onClick={() => onPromptClick(currentPrompt)}
        className={cn(
          'w-full text-left p-3 border-2 mb-3 transition-all duration-200',
          'hover:scale-[1.02] cursor-pointer',
          themeClasses.borderColor,
          'hover:border-opacity-75'
        )}
      >
        <p className={cn('text-sm italic', themeClasses.text)}>
          "{currentPrompt}"
        </p>
      </button>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          className="p-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Progress dots */}
        <div className="flex gap-1">
          {suggestedPrompts.map((_, catIdx) => (
            <div key={catIdx} className="flex gap-0.5">
              {suggestedPrompts[catIdx].prompts.map((_, pIdx) => (
                <div
                  key={`${catIdx}-${pIdx}`}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    catIdx === categoryIndex && pIdx === promptIndex
                      ? themeClasses.accentBg
                      : 'bg-gray-600'
                  )}
                />
              ))}
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="p-1"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

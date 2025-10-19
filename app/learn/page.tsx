/**
 * 16-Bit Weather Platform - Learn Hub Page
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Central hub for all educational weather content
 */

'use client';

import React from 'react';
import { Cloud, Zap, BookOpen, Thermometer, Satellite, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import LearningCard from '@/components/learn/LearningCard';

export default function LearnPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  const learningTopics = [
    {
      href: '/cloud-types',
      icon: Cloud,
      title: 'Cloud Types',
      description: 'Learn to identify cumulus, stratus, cirrus, and more. Master cloud classification like a meteorologist.',
      itemCount: 10
    },
    {
      href: '/weather-systems',
      icon: Zap,
      title: 'Weather Systems',
      description: 'Understand fronts, pressure systems, and atmospheric phenomena. Discover how weather patterns form.',
      itemCount: 12
    },
    {
      href: '/extremes',
      icon: Thermometer,
      title: 'Global Extremes',
      description: 'Explore record temperatures and extreme weather events from around the world. Real-time data.',
      itemCount: undefined
    },
    {
      href: '/fun-facts',
      icon: BookOpen,
      title: '16-Bit Takes',
      description: 'Weather trivia, fun facts, and fascinating meteorological oddities. Perfect for weather enthusiasts.',
      itemCount: 25
    },
    {
      href: '/map',
      icon: Satellite,
      title: 'Radar & Models',
      description: 'Interactive NEXRAD radar and GFS weather models. Watch storms in real-time and track systems.',
      itemCount: undefined
    },
    {
      href: '/games',
      icon: Gamepad2,
      title: 'Weather Games',
      description: 'Test your knowledge with interactive weather games and quizzes. Learn while having fun.',
      itemCount: 3
    }
  ];

  return (
    <PageWrapper>
      <div className={cn('container mx-auto px-4 py-8', themeClasses.background)}>
        {/* Header Section */}
        <div className="mb-10">
          <h1
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 font-mono',
              themeClasses.accentText,
              themeClasses.glow
            )}
          >
            WEATHER GUIDE
          </h1>
          <p className={cn('text-base sm:text-lg font-mono max-w-3xl', themeClasses.text)}>
            Explore our comprehensive weather education platform. From cloud identification to extreme weather events,
            learn about meteorology with retro terminal aesthetics.
          </p>
        </div>

        {/* Stats Bar */}
        <div className={cn(
          'grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-6 border-4',
          themeClasses.borderColor,
          themeClasses.background
        )}>
          <div className="text-center">
            <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>6</div>
            <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Topics</div>
          </div>
          <div className="text-center">
            <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>50+</div>
            <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Articles</div>
          </div>
          <div className="text-center">
            <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>100%</div>
            <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Free</div>
          </div>
          <div className="text-center">
            <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>24/7</div>
            <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Updated</div>
          </div>
        </div>

        {/* Learning Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {learningTopics.map((topic) => (
            <LearningCard key={topic.href} {...topic} />
          ))}
        </div>

        {/* Call to Action */}
        <div className={cn(
          'p-8 border-4 text-center',
          themeClasses.borderColor,
          themeClasses.background
        )}>
          <h2 className={cn('text-2xl font-bold font-mono mb-3', themeClasses.headerText)}>
            STAY CURIOUS
          </h2>
          <p className={cn('text-sm font-mono mb-4', themeClasses.text)}>
            New educational content added regularly. Check back often to expand your meteorology knowledge.
          </p>
          <div className={cn('inline-block px-4 py-2 border-2 text-xs font-mono font-bold', themeClasses.accentBg, themeClasses.borderColor)}>
            LAST UPDATED: JANUARY 2025
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

/**
 * 16-Bit Weather Platform - Education Hub Page
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Consolidated hub for all educational weather content
 * Combines: Weather Systems, Cloud Types, Extremes, 16-Bit Takes, News
 */

'use client';

import React from 'react';
import { Cloud, Zap, BookOpen, Thermometer, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import LearningCard from '@/components/learn/LearningCard';
import { Card, CardContent } from '@/components/ui/card';

export default function EducationPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  const educationTopics = [
    {
      href: '/weather-systems',
      icon: Zap,
      title: 'Weather Systems',
      description: 'Analyze the atmospheric dynamics of 16 major storm types with historical case studies and threat levels.',
      itemCount: 16
    },
    {
      href: '/cloud-types',
      icon: Cloud,
      title: 'Cloud Types',
      description: 'Master 10 distinct cloud formations with Latin etymology, altitude classifications, and 16-bit visualizations.',
      itemCount: 10
    },
    {
      href: '/fun-facts',
      icon: BookOpen,
      title: '16-Bit Takes',
      description: 'The science behind the strange. From Ball Lightning to Thundersnow, explore rare phenomena.',
      itemCount: 12
    },
    {
      href: '/extremes',
      icon: Thermometer,
      title: 'Extremes',
      description: 'Live monitoring of the hottest and coldest places on Earth. Track real-time temperature champions.',
      itemCount: undefined
    },
    {
      href: '/news',
      icon: Newspaper,
      title: 'News',
      description: 'Latest weather stories, NASA updates, and Reddit discussions. Stay informed on atmospheric events.',
      itemCount: undefined
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
            EDUCATION HUB
          </h1>
          <p className={cn('text-base sm:text-lg font-mono max-w-3xl', themeClasses.text)}>
            Your portal to weather knowledge. From cloud identification to extreme events,
            expand your meteorological expertise with our retro-styled learning platform.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
            <CardContent className="p-4 text-center">
              <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>5</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Topics</div>
            </CardContent>
          </Card>
          <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
            <CardContent className="p-4 text-center">
              <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>50+</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Articles</div>
            </CardContent>
          </Card>
          <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
            <CardContent className="p-4 text-center">
              <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>100%</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Free</div>
            </CardContent>
          </Card>
          <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
            <CardContent className="p-4 text-center">
              <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>24/7</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Updated</div>
            </CardContent>
          </Card>
        </div>

        {/* Education Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {educationTopics.map((topic) => (
            <LearningCard key={topic.href} {...topic} />
          ))}
        </div>

        {/* Call to Action */}
        <Card className={cn('border-4 text-center', themeClasses.borderColor, themeClasses.background)}>
          <CardContent className="p-8">
            <h2 className={cn('text-2xl font-bold font-mono mb-3', themeClasses.headerText)}>
              KNOWLEDGE IS POWER
            </h2>
            <p className={cn('text-sm font-mono mb-4', themeClasses.text)}>
              Explore our comprehensive weather education resources. New content added regularly.
            </p>
            <div className={cn('inline-block px-4 py-2 border-2 text-xs font-mono font-bold', themeClasses.accentBg, themeClasses.borderColor)}>
              LAST UPDATED: JANUARY 2026
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

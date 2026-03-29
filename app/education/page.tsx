/**
 * 16-Bit Weather Platform - Education Hub Page
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Consolidated hub for all educational weather content
 */

'use client';

import React from 'react';
import { Cloud, Zap, BookOpen, Thermometer, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import LearningCard from '@/components/learn/LearningCard';
import { Card, CardContent } from '@/components/ui/card';
import { ShareButtons } from '@/components/share-buttons';

export default function EducationPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');

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
      title: 'Cloud Atlas',
      description: 'Comprehensive cloud database covering genera, species, varieties, and rare formations with altitude data.',
      itemCount: 35
    },
    {
      href: '/fun-facts',
      icon: BookOpen,
      title: '16-Bit Takes',
      description: 'The science behind the strange. From Ball Lightning to Thundersnow, explore rare weather phenomena.',
      itemCount: 25
    },
    {
      href: '/extremes',
      icon: Thermometer,
      title: 'Extremes',
      description: 'Live monitoring of the hottest and coldest places on Earth. Track real-time temperature champions.',
      itemCount: undefined
    },
    {
      href: '/education/glossary',
      icon: BookMarked,
      title: 'Weather Glossary',
      description: 'In-depth definitions of weather metrics. UV index, pressure, humidity, wind, and more explained.',
      itemCount: 10
    },
  ];

  return (
    <PageWrapper>
      <div className={cn('container mx-auto px-4 py-8', themeClasses.background)}>
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
          <ShareButtons
            config={{
              title: 'Weather Education Hub',
              text: 'Learn meteorology with interactive weather lessons at 16bitweather.co',
              url: 'https://www.16bitweather.co/education',
            }}
            className="mt-3"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className={cn('container-nested', themeClasses.background)}>
            <CardContent className="p-4 text-center">
              <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>5</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Topics</div>
            </CardContent>
          </Card>
          <Card className={cn('container-nested', themeClasses.background)}>
            <CardContent className="p-4 text-center">
              <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>50+</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Items</div>
            </CardContent>
          </Card>
          <Card className={cn('container-nested', themeClasses.background)}>
            <CardContent className="p-4 text-center">
              <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>100%</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Free</div>
            </CardContent>
          </Card>
          <Card className={cn('container-nested', themeClasses.background)}>
            <CardContent className="p-4 text-center">
              <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>24/7</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Updated</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {educationTopics.map((topic) => (
            <LearningCard key={topic.href} {...topic} />
          ))}
        </div>

        <Card className={cn('container-primary text-center', themeClasses.background)}>
          <CardContent className="p-8">
            <h2 className={cn('text-2xl font-bold font-mono mb-3', themeClasses.headerText)}>
              STAY CURIOUS
            </h2>
            <p className={cn('text-sm font-mono mb-4', themeClasses.text)}>
              Explore our comprehensive weather education resources. New content added regularly.
            </p>
            <div className={cn('inline-block px-4 py-2 text-xs font-mono font-bold rounded', themeClasses.accentBg)}>
              LAST UPDATED: MARCH 2026
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

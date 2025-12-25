/**
 * 16-Bit Weather Platform - News Loading Skeleton
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 */

'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NewsSkeletonProps {
  count?: number;
  variant?: 'card' | 'hero' | 'compact';
}

export default function NewsSkeleton({ count = 6, variant = 'card' }: NewsSkeletonProps) {
  if (variant === 'hero') {
    return <NewsHeroSkeleton />;
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <NewsCompactSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Card skeleton
function NewsCardSkeleton() {
  return (
    <Card className="border-2 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader className="space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

// Hero skeleton
function NewsHeroSkeleton() {
  return (
    <Card className="border-2 overflow-hidden mb-6">
      <div className="flex flex-col md:flex-row">
        <Skeleton className="h-64 md:h-80 w-full md:w-1/2" />
        <div className="flex-1 p-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-20 w-full" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Compact skeleton
function NewsCompactSkeleton() {
  return (
    <div className="flex gap-3 p-3 border-2 rounded">
      <Skeleton className="h-16 w-16 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

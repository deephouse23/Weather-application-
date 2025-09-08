"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function WeatherSkeleton() {
  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Search skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
      </div>

      {/* Main weather display skeleton */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b-2">
          <Skeleton className="h-8 w-48 mx-auto" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Temperature skeleton */}
          <div className="text-center space-y-3">
            <Skeleton className="h-20 w-32 mx-auto" />
            <Skeleton className="h-8 w-24 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>

          {/* Weather details grid skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="p-3 space-y-3">
                <Skeleton className="h-4 w-16 mx-auto" />
                <Skeleton className="h-8 w-8 mx-auto" />
                <Skeleton className="h-5 w-12 mx-auto" />
                <Skeleton className="h-4 w-10 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional info skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function LocationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <Skeleton className="h-12 w-20 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto mt-2" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs skeleton */}
      <Skeleton className="h-12 w-full" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <LocationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
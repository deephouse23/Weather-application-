"use client"

/**
 * 16-Bit Weather Platform - v1.0.0
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


import Navigation from "./navigation"

interface PageWrapperProps {
  children: React.ReactNode
  weatherLocation?: string
  weatherTemperature?: number
  weatherUnit?: string
}

/**
 * Page Wrapper for 16-Bit Weather Education Platform
 *
 * Handles theme management and provides consistent navigation
 * across all pages in the education platform.
 *
 * Uses CSS variables for theming - colors automatically adapt
 * based on the data-theme attribute set by ThemeProvider.
 */
export default function PageWrapper({ children, weatherLocation, weatherTemperature, weatherUnit }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navigation
        weatherLocation={weatherLocation}
        weatherTemperature={weatherTemperature}
        weatherUnit={weatherUnit}
      />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
} 
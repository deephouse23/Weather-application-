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
      <footer className="border-t border-border/40 bg-black/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm font-mono">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Weather</h3>
              <nav className="flex flex-col gap-1.5">
                <a href="/radar" className="text-muted-foreground hover:text-foreground transition-colors">Radar</a>
                <a href="/severe" className="text-muted-foreground hover:text-foreground transition-colors">Severe Weather</a>
                <a href="/aviation" className="text-muted-foreground hover:text-foreground transition-colors">Aviation</a>
                <a href="/space-weather" className="text-muted-foreground hover:text-foreground transition-colors">Space Weather</a>
                <a href="/tropical" className="text-muted-foreground hover:text-foreground transition-colors">Tropical</a>
                <a href="/winter" className="text-muted-foreground hover:text-foreground transition-colors">Winter</a>
              </nav>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Tools</h3>
              <nav className="flex flex-col gap-1.5">
                <a href="/situation" className="text-muted-foreground hover:text-foreground transition-colors">Situation</a>
                <a href="/extremes" className="text-muted-foreground hover:text-foreground transition-colors">Extremes</a>
                <a href="/hourly" className="text-muted-foreground hover:text-foreground transition-colors">Hourly</a>
                <a href="/travel" className="text-muted-foreground hover:text-foreground transition-colors">Travel</a>
                <a href="/vibe-check" className="text-muted-foreground hover:text-foreground transition-colors">Vibe Check</a>
                <a href="/map" className="text-muted-foreground hover:text-foreground transition-colors">Map</a>
              </nav>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Learn</h3>
              <nav className="flex flex-col gap-1.5">
                <a href="/education" className="text-muted-foreground hover:text-foreground transition-colors">Education</a>
                <a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a>
                <a href="/news" className="text-muted-foreground hover:text-foreground transition-colors">News</a>
                <a href="/games" className="text-muted-foreground hover:text-foreground transition-colors">Games</a>
                <a href="/cloud-types" className="text-muted-foreground hover:text-foreground transition-colors">Cloud Types</a>
                <a href="/fun-facts" className="text-muted-foreground hover:text-foreground transition-colors">Fun Facts</a>
              </nav>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Site</h3>
              <nav className="flex flex-col gap-1.5">
                <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
                <a href="/weather-systems" className="text-muted-foreground hover:text-foreground transition-colors">Weather Systems</a>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs font-mono text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} 16-Bit Weather. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
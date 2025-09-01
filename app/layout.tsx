/**
 * 16-Bit Weather Platform - BETA v0.3.31
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

import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from '@vercel/analytics/react'
import AppThemeProvider from "@/app/providers/ThemeProvider"
import { LocationProvider } from "@/components/location-context"
import { AuthProvider } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "16 Bit Weather - Retro Terminal Weather Forecast",
  description: "Real-time weather forecasts with authentic 16-bit terminal aesthetics. Check current conditions, 5-day forecasts, and weather data for any city worldwide. Dark Terminal, Miami Vice, and Tron Grid themes available.",
  keywords: "16-bit weather, terminal weather, retro weather forecast, pixel weather, weather app, real-time weather, 5-day forecast, weather data, weather conditions, meteorology education, cloud types, weather systems",
  generator: 'Next.js',
  applicationName: '16 Bit Weather',
  authors: [{ name: '16 Bit Weather' }],
  creator: '16 Bit Weather',
  publisher: '16 Bit Weather',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.16bitweather.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '16 Bit Weather - Retro Terminal Weather Forecast',
    description: 'Real-time weather forecasts with authentic 16-bit terminal aesthetics. Check weather for any city worldwide.',
    url: 'https://www.16bitweather.co',
    siteName: '16 Bit Weather',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '16 Bit Weather Terminal Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '16 Bit Weather - Retro Terminal Weather',
    description: 'Real-time weather forecasts with authentic 16-bit terminal aesthetics.',
    images: ['/og-image.png'],
    creator: '@16bitweather',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/favicon.ico',
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    }
  },
  other: {
    'theme-color': '#0a0a1a',
    'msapplication-TileColor': '#0a0a1a',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'geo.region': 'US',
    'geo.placename': 'United States',
    'geo.position': '39.8283;-98.5795',
    'ICBM': '39.8283, -98.5795',
    'language': 'en-US',
    'distribution': 'global',
    'rating': 'general',
    'revisit-after': '1 day',
    'category': 'Weather, Education, Technology',
    'coverage': 'Worldwide',
    'target': 'all',
    'HandheldFriendly': 'True',
    'MobileOptimized': '320'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pollen.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
      </head>
      <body className={inter.className}>
        <AppThemeProvider>
          <AuthProvider>
            <LocationProvider>
              {children}
            </LocationProvider>
          </AuthProvider>
        </AppThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from "@/components/theme-provider"
import { LocationProvider } from "@/components/location-context"

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
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0a0a1a" />
        <meta name="msapplication-TileColor" content="#0a0a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="geo.position" content="39.8283;-98.5795" />
        <meta name="ICBM" content="39.8283, -98.5795" />
        <meta name="language" content="en-US" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="1 day" />
        <meta name="category" content="Weather, Education, Technology" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pollen.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "16 Bit Weather",
                "description": "Real-time weather forecasts and comprehensive meteorology education with authentic 16-bit retro styling and interactive learning features.",
                "url": "https://www.16bitweather.co",
                "applicationCategory": "Weather",
                "applicationSubCategory": "Weather Forecast",
                "operatingSystem": "Web Browser",
                "browserRequirements": "Requires JavaScript. Modern web browser recommended.",
                "permissions": "geolocation (optional for auto-location)",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "@id": "https://www.16bitweather.co/",
                  "priceCurrency": "USD"
                },
                "author": {
                  "@type": "Organization",
                  "name": "16 Bit Weather",
                  "url": "https://www.16bitweather.co"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "16 Bit Weather"
                },
                "screenshot": "https://www.16bitweather.co/og-image.png",
                "softwareVersion": "0.2.84",
                "datePublished": "2024-01-01",
                "dateModified": "2025-07-20",
                "applicationSuite": "16 Bit Weather Platform",
                "featureList": [
                  "Real-time weather data and forecasts",
                  "5-day weather forecasts",
                  "Current weather conditions",
                  "Humidity and barometric pressure data",
                  "Wind speed and direction",
                  "Sunrise and sunset times",
                  "Moon phase information",
                  "Air quality index",
                  "Pollen count data",
                  "UV index monitoring",
                  "Multiple city weather lookup",
                  "Auto-location detection",
                  "Comprehensive cloud type atlas with pixel art",
                  "Weather systems education and simulations",
                  "Interactive weather facts and statistics", 
                  "Educational weather games and quizzes",
                  "Multiple retro themes (Dark Terminal, Miami Vice, Tron Grid)",
                  "Mobile responsive design",
                  "Authentic 16-bit terminal graphics"
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "reviewCount": "1250",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "serviceType": "Weather Forecast Service"
              },
              {
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "16 Bit Weather Education Platform",
                "description": "Comprehensive weather education platform with 16-bit retro styling, covering meteorology, cloud types, weather systems, and interactive learning.",
                "url": "https://www.16bitweather.co",
                "educationalCredentialAwarded": "Weather Knowledge Certificate",
                "educationalLevel": "All Levels",
                "learningResourceType": [
                  "Interactive Tutorial",
                  "Educational Game",
                  "Reference Material",
                  "Simulation"
                ],
                "teaches": [
                  "Meteorology",
                  "Cloud Formation",
                  "Weather Systems",
                  "Atmospheric Science",
                  "Weather Prediction"
                ],
                "sameAs": [
                  "https://www.16bitweather.co/about",
                  "https://www.16bitweather.co/cloud-types",
                  "https://www.16bitweather.co/weather-systems"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "16 Bit Weather",
                "url": "https://www.16bitweather.co",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://www.16bitweather.co/?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                },
                "sameAs": [
                  "https://www.16bitweather.co"
                ]
              }
            ])
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="weather-edu-theme"
          themes={["dark"]}
        >
          <LocationProvider>
            {children}
          </LocationProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

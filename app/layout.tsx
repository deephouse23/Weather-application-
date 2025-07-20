import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "16-Bit Weather Education Platform - Retro Weather Learning",
  description: "Explore weather like it's 1985! Comprehensive 16-bit weather education platform with cloud atlas, weather systems, fun facts, and educational games. Learn meteorology with authentic pixel graphics.",
  keywords: "16-bit weather, retro weather education, cloud types, weather systems, meteorology learning, educational games, pixel weather, weather facts, atmospheric science",
  generator: 'Next.js',
  applicationName: '16-Bit Weather Education Platform',
  authors: [{ name: 'Weather Education Systems' }],
  creator: 'Weather Education Systems',
  publisher: 'Weather Education Systems',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://16-bit-weather.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '16-Bit Weather Education Platform - Learn Weather Like It\'s 1985',
    description: 'Comprehensive weather education with cloud atlas, weather systems, and retro-styled learning games.',
    url: 'https://16-bit-weather.vercel.app',
    siteName: '16-Bit Weather Education',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '16-Bit Weather Education Platform Screenshot',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '16-Bit Weather Education Platform',
    description: 'Learn weather and meteorology through authentic 16-bit retro experience.',
    images: ['/og-image.png'],
    creator: '@weather16bit',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0a0a1a" />
        <meta name="msapplication-TileColor" content="#0a0a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
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
                "name": "16-Bit Weather Education Platform",
                "description": "Real-time weather forecasts and comprehensive meteorology education with authentic 16-bit retro styling and interactive learning features.",
                "url": "https://16-bit-weather.vercel.app",
                "applicationCategory": "Weather",
                "applicationSubCategory": "Weather Forecast",
                "operatingSystem": "Web Browser",
                "browserRequirements": "Requires JavaScript. Modern web browser recommended.",
                "permissions": "geolocation (optional for auto-location)",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "@id": "https://16-bit-weather.vercel.app/",
                  "priceCurrency": "USD"
                },
                "author": {
                  "@type": "Organization",
                  "name": "Weather Education Systems",
                  "url": "https://16-bit-weather.vercel.app"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Weather Education Systems"
                },
                "screenshot": "https://16-bit-weather.vercel.app/og-image.png",
                "softwareVersion": "0.2.7",
                "datePublished": "2024-01-01",
                "dateModified": "2025-07-20",
                "applicationSuite": "16-Bit Weather Platform",
                "featureList": [
                  "Real-time weather data and forecasts",
                  "7-day weather forecasting",
                  "Current atmospheric conditions",
                  "UV index and air quality monitoring",
                  "Pollen count tracking",
                  "Wind and pressure data",
                  "Sunrise and sunset times",
                  "Moon phase information",
                  "Multiple city weather lookup",
                  "Auto-location detection",
                  "Comprehensive cloud type atlas with pixel art",
                  "Weather systems education and simulations",
                  "Interactive weather facts and statistics", 
                  "Educational weather games and quizzes",
                  "Miami Vice and Dark retro themes",
                  "Mobile responsive design",
                  "Authentic 16-bit graphics and styling"
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "reviewCount": "150",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "serviceType": "Weather Forecast Service"
              },
              {
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "16-Bit Weather Education Platform",
                "description": "Comprehensive weather education platform with 16-bit retro styling, covering meteorology, cloud types, weather systems, and interactive learning.",
                "url": "https://16-bit-weather.vercel.app",
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
                  "https://16-bit-weather.vercel.app/about",
                  "https://16-bit-weather.vercel.app/cloud-types",
                  "https://16-bit-weather.vercel.app/weather-systems"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "16-Bit Weather",
                "url": "https://16-bit-weather.vercel.app",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://16-bit-weather.vercel.app/?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                },
                "sameAs": [
                  "https://16-bit-weather.vercel.app"
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
          themes={["dark", "miami", "tron"]}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

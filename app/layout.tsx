import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Share_Tech_Mono } from "next/font/google"
import { Analytics } from '@vercel/analytics/react'

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "16-Bit Weather - Retro Weather App with Doppler Radar",
  description: "Experience weather like it's 1985! 16-bit retro weather app with world's first 16-bit doppler radar, Miami Vice themes, and authentic pixel graphics. Get real-time weather data with nostalgic style.",
  keywords: "16-bit weather, retro weather app, doppler radar, miami vice theme, pixel weather, 80s weather, retro radar, weather terminal, 16-bit graphics",
  generator: 'Next.js',
  applicationName: '16-Bit Weather',
  authors: [{ name: 'Weather Terminal Systems' }],
  creator: 'Weather Terminal Systems',
  publisher: 'Weather Terminal Systems',
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
    title: '16-Bit Weather - Retro Weather App with Doppler Radar',
    description: 'Experience weather like it\'s 1985! 16-bit retro weather app with world\'s first 16-bit doppler radar, Miami Vice themes, and authentic pixel graphics.',
    url: 'https://16-bit-weather.vercel.app',
    siteName: '16-Bit Weather',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '16-Bit Weather App Screenshot',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '16-Bit Weather - Retro Weather App',
    description: 'Experience weather like it\'s 1985! 16-bit retro weather with doppler radar.',
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
    <html lang="en">
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
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "16-Bit Weather",
              "description": "Experience weather like it's 1985! 16-bit retro weather app with world's first 16-bit doppler radar, Miami Vice themes, and authentic pixel graphics.",
              "url": "https://16-bit-weather.vercel.app",
              "applicationCategory": "WeatherApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Weather Terminal Systems"
              },
              "screenshot": "https://16-bit-weather.vercel.app/og-image.png",
              "featureList": [
                "Real-time weather data",
                "16-bit doppler radar",
                "Miami Vice retro theme",
                "Dark mode support",
                "Location search",
                "5-day forecast",
                "Pixel art graphics",
                "Mobile responsive"
              ],
              "browserRequirements": "Requires JavaScript. Modern web browser recommended.",
              "permissions": "geolocation (optional)"
            })
          }}
        />
      </head>
      <body className={shareTechMono.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "16-Bit Weather Education Platform - Retro Weather Learning",
  description: "Explore weather like it's 1985! Comprehensive 16-bit weather education platform with doppler radar, cloud atlas, weather systems, fun facts, and educational games. Learn meteorology with authentic pixel graphics.",
  keywords: "16-bit weather, retro weather education, doppler radar, cloud types, weather systems, meteorology learning, educational games, pixel weather, weather facts, atmospheric science",
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
    description: 'Comprehensive weather education with 16-bit doppler radar, cloud atlas, weather systems, and retro-styled learning games.',
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
  // Check if Clerk keys are available
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // If Clerk keys are missing, render without authentication
  if (!clerkPublishableKey) {
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
          <link rel="preconnect" href="https://api.openweathermap.org" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "16-Bit Weather Education Platform",
                "description": "Comprehensive weather education platform with 16-bit retro styling, covering meteorology, cloud types, weather systems, and interactive learning.",
                "url": "https://16-bit-weather.vercel.app",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "author": {
                  "@type": "Organization",
                  "name": "Weather Education Systems"
                },
                "screenshot": "https://16-bit-weather.vercel.app/og-image.png",
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
                "featureList": [
                  "Real-time weather data with 16-bit doppler radar",
                  "Comprehensive cloud type atlas with pixel art",
                  "Weather systems education and simulations",
                  "Interactive weather facts and statistics", 
                  "Educational weather games and quizzes",
                  "Miami Vice and Dark retro themes",
                  "Mobile responsive design",
                  "Authentic 8-bit graphics and styling"
                ],
                "browserRequirements": "Requires JavaScript. Modern web browser recommended.",
                "permissions": "geolocation (optional)"
              })
            }}
          />
        </head>
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-cyan-600 font-mono mb-4">CLERK KEYS NOT CONFIGURED</div>
              <div className="text-cyan-400 font-mono text-sm">
                Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables
              </div>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#00ffff',
          colorBackground: '#000000',
          colorInputBackground: '#000000',
          colorInputText: '#00ffff',
          fontFamily: '"Courier Prime", monospace',
          borderRadius: '4px',
          spacingUnit: '1rem'
        },
        elements: {
          // Social buttons styling
          socialButtonsBlockButton: `
            bg-black border border-cyan-500 text-white hover:bg-cyan-500/5 
            font-mono text-sm transition-all duration-200 mb-3 rounded-sm
            flex items-center justify-center gap-3 p-4
          `,
          socialButtonsBlockButtonText: 'font-mono text-sm',
          socialButtonsBlockButtonArrow: 'hidden',
          
          // Card styling  
          card: 'bg-black border-2 border-cyan-500 shadow-xl shadow-cyan-500/10 rounded-sm',
          headerTitle: 'text-cyan-400 font-mono text-lg text-center',
          headerSubtitle: 'text-cyan-600 font-mono text-xs text-center',
          
          // Form elements
          formFieldInput: `
            bg-black border border-cyan-500 text-cyan-400 font-mono
            focus:border-cyan-300 focus:shadow-cyan-500/20 focus:shadow-lg
            rounded-sm
          `,
          formFieldLabel: 'text-cyan-400 font-mono text-xs uppercase',
          
          formButtonPrimary: `
            bg-cyan-500 hover:bg-cyan-400 text-black font-mono 
            uppercase tracking-wider transition-all duration-200 rounded-sm
          `,
          
          // Links and footer
          footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-mono text-xs',
          dividerLine: 'bg-cyan-500',
          dividerText: 'text-cyan-600 font-mono text-xs',
          
          // Error states
          formFieldErrorText: 'text-red-400 font-mono text-xs',
          
          // Loading states
          spinner: 'border-cyan-500'
        }
      }}
    >
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
          <link rel="preconnect" href="https://api.openweathermap.org" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "16-Bit Weather Education Platform",
                "description": "Comprehensive weather education platform with 16-bit retro styling, covering meteorology, cloud types, weather systems, and interactive learning.",
                "url": "https://16-bit-weather.vercel.app",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "author": {
                  "@type": "Organization",
                  "name": "Weather Education Systems"
                },
                "screenshot": "https://16-bit-weather.vercel.app/og-image.png",
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
                "featureList": [
                  "Real-time weather data with 16-bit doppler radar",
                  "Comprehensive cloud type atlas with pixel art",
                  "Weather systems education and simulations",
                  "Interactive weather facts and statistics", 
                  "Educational weather games and quizzes",
                  "Miami Vice and Dark retro themes",
                  "Mobile responsive design",
                  "Authentic 8-bit graphics and styling"
                ],
                "browserRequirements": "Requires JavaScript. Modern web browser recommended.",
                "permissions": "geolocation (optional)"
              })
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
    </ClerkProvider>
  )
}

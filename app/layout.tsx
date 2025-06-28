import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "16-Bit Weather Education Platform",
  description: "Learn weather like it's 1985!",
}

console.log('Layout module loaded');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log('Layout component rendered');
  
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // If Clerk key is missing, render without ClerkProvider
  if (!clerkPublishableKey) {
    console.log('Clerk key missing, rendering without ClerkProvider');
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <meta name="theme-color" content="#0a0a1a" />
        </head>
        <body className={inter.className}>
          <div className="min-h-screen bg-black text-cyan-400">
            <div className="p-8 text-center">
              <h1 className="text-2xl font-mono mb-4">16-Bit Weather</h1>
              <p className="text-cyan-600">Clerk authentication not configured</p>
              <p className="text-sm text-cyan-600 mt-2">Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable auth</p>
            </div>
            {children}
          </div>
        </body>
      </html>
    );
  }
  
  // With Clerk key, render with ClerkProvider
  console.log('Clerk key found, rendering with ClerkProvider');
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
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <meta name="theme-color" content="#0a0a1a" />
        </head>
        <body className={inter.className}>
          <div className="min-h-screen bg-black text-cyan-400">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

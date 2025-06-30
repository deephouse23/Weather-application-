import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

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

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    if (typeof window === 'undefined') {
      console.warn('Warning: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Clerk authentication will be disabled.');
    }
    return (
      <html lang="en">
        <body className={`${inter.className} bg-black text-cyan-400`}>
          <ThemeProvider defaultTheme="dark">
            {children}
          </ThemeProvider>
        </body>
      </html>
    );
  }

  // Only import ClerkProvider if the key is present
  const { ClerkProvider } = require('@clerk/nextjs');

  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-cyan-400`}>
        <ClerkProvider
          publishableKey={publishableKey}
          allowedRedirectOrigins={[
            'https://weather-application-jvxh6l7gs-justin-elrods-projects.vercel.app',
            'http://localhost:3000'
          ]}
        >
          <ThemeProvider defaultTheme="dark">
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

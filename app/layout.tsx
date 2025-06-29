import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from '@clerk/nextjs'

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
  
  // Check if Clerk environment variables are available
  const hasClerkConfig = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  console.log('Clerk config available:', !!hasClerkConfig);
  
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-cyan-400`}>
        {hasClerkConfig ? (
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            allowedRedirectOrigins={[
              'https://weather-application-jvxh6l7gs-justin-elrods-projects.vercel.app',
              'http://localhost:3000'
            ]}
          >
            <ThemeProvider defaultTheme="dark">
              {children}
            </ThemeProvider>
          </ClerkProvider>
        ) : (
          <ThemeProvider defaultTheme="dark">
            {children}
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}

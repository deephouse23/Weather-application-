import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import NextAuthProvider from '@/components/providers/session-provider'

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

  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-cyan-400`}>
        <NextAuthProvider>
          <ThemeProvider defaultTheme="dark">
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

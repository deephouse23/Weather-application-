import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Share_Tech_Mono } from "next/font/google"

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "WEATHER.EXE - Retro Weather Terminal",
  description: "A retro 8-bit style weather application with pixel art graphics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={shareTechMono.className}>{children}</body>
    </html>
  )
}

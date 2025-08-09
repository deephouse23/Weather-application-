"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"
import PageWrapper from "@/components/page-wrapper"
import { useTheme } from '@/components/theme-provider'
import { cn } from "@/lib/utils"

function AboutPageContent() {
  const { theme } = useTheme()

  return (
    <PageWrapper>
      <div className={cn("min-h-screen", 
        (theme || 'dark') === 'dark' && "bg-gradient-to-b from-gray-900 to-black",
        (theme || 'dark') === 'miami' && "bg-gradient-to-b from-pink-900 to-purple-900",
        (theme || 'dark') === 'tron' && "bg-gradient-to-b from-black to-blue-900"
      )}>
        <div className="container mx-auto px-4 py-8">
          <div className={cn("p-6 border-4",
            (theme || 'dark') === 'dark' && "bg-[#0f0f0f] border-[#00d4ff]",
            (theme || 'dark') === 'miami' && "bg-[#0a0025] border-[#ff1493]", 
            (theme || 'dark') === 'tron' && "bg-black border-[#00FFFF]"
          )}>
            <h1 className={cn("text-3xl font-bold mb-4",
              (theme || 'dark') === 'dark' && "text-[#00d4ff]",
              (theme || 'dark') === 'miami' && "text-[#ff1493]",
              (theme || 'dark') === 'tron' && "text-[#00FFFF]"
            )}>About 16-Bit Weather</h1>
            <p className={cn("mb-4",
              (theme || 'dark') === 'dark' && "text-[#e0e0e0]",
              (theme || 'dark') === 'miami' && "text-[#00ffff]",
              (theme || 'dark') === 'tron' && "text-white"
            )}>
              Welcome to 16-Bit Weather, a retro-styled weather application that combines modern weather data with a nostalgic 16-bit aesthetic.
            </p>
            <p className={cn("mb-4",
              (theme || 'dark') === 'dark' && "text-[#e0e0e0]",
              (theme || 'dark') === 'miami' && "text-[#00ffff]",
              (theme || 'dark') === 'tron' && "text-white"
            )}>
              This application provides real-time weather information, forecasts, and educational content about weather systems and phenomena.
            </p>
            <p className={cn("",
              (theme || 'dark') === 'dark' && "text-[#e0e0e0]",
              (theme || 'dark') === 'miami' && "text-[#00ffff]",
              (theme || 'dark') === 'tron' && "text-white"
            )}>
              Built with Next.js, TypeScript, and Tailwind CSS, featuring three unique themes: Dark Mode, Miami Vice, and Tron.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

// Create a dynamic import to avoid SSR issues
const DynamicAboutPage = dynamic(
  () => Promise.resolve(AboutPageContent),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
)

export default function AboutPage() {
  return <DynamicAboutPage />
}
'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"

function GlobalErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-weather-bg-elev flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-weather-text mb-4">Something went wrong!</h2>
            <button
              onClick={() => reset()}
              className="text-weather-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

// Create a dynamic import to avoid SSR issues
const DynamicGlobalError = dynamic(
  () => Promise.resolve(GlobalErrorContent),
  { 
    ssr: false,
    loading: () => (
      <html>
        <body>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </body>
      </html>
    )
  }
)

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <DynamicGlobalError error={error} reset={reset} />
}
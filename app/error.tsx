/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"

function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
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
  )
}

// Create a dynamic import to avoid SSR issues
const DynamicError = dynamic(
  () => Promise.resolve(ErrorContent),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
)

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <DynamicError error={error} reset={reset} />
}
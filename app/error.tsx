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

export const runtime = 'nodejs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="text-blue-400 hover:underline px-4 py-2 border border-blue-400 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
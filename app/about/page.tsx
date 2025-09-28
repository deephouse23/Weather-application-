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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 border-4 bg-gray-900 border-blue-400">
          <h1 className="text-3xl font-bold mb-4 text-blue-400">About 16-Bit Weather</h1>
          <p className="mb-4 text-gray-300">
            Welcome to 16-Bit Weather, a retro-styled weather application that combines modern weather data with a nostalgic 16-bit aesthetic.
          </p>
          <p className="mb-4 text-gray-300">
            This application provides real-time weather information, forecasts, and educational content about weather systems and phenomena.
          </p>
          <p className="text-gray-300">
            Built with Next.js, TypeScript, and Tailwind CSS, featuring three unique themes: Dark Mode, Miami Vice, and Tron.
          </p>
        </div>
      </div>
    </div>
  )
}
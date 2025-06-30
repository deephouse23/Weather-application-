'use client'
import { useState, useEffect } from 'react'
import NavBar from '@/components/nav-bar'

export default function DebugPage() {
  const [isClient, setIsClient] = useState(false)
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsClient(true)
    // Check environment variables
    setEnvVars({
      'NEXT_PUBLIC_OPENWEATHER_API_KEY': process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'Not set',
      'NODE_ENV': process.env.NODE_ENV || 'Not set',
    })
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black text-cyan-400">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
        
        <div className="bg-gray-900 border border-cyan-400 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-mono text-sm">{key}:</span>
                <span className="font-mono text-sm text-cyan-300">
                  {value === 'Not set' ? '❌ Not set' : '✅ Set'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-cyan-400 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">System Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>User Agent:</span>
              <span className="text-sm text-cyan-300">{navigator.userAgent}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <span className="text-sm text-cyan-300">{navigator.platform}</span>
            </div>
            <div className="flex justify-between">
              <span>Language:</span>
              <span className="text-sm text-cyan-300">{navigator.language}</span>
            </div>
            <div className="flex justify-between">
              <span>Cookies Enabled:</span>
              <span className="text-sm text-cyan-300">{navigator.cookieEnabled ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Geolocation:</span>
              <span className="text-sm text-cyan-300">{navigator.geolocation ? '✅ Available' : '❌ Not available'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
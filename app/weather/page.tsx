'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WeatherPage() {
  const [isClient, setIsClient] = useState(false)
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (isClient && isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isClient, isLoaded, user, router])

  // Show loading state during SSR or when not client-side
  if (!isClient || !isLoaded) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 p-4 crt-scanlines flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyan-600 font-mono">LOADING AUTHENTICATION...</div>
        </div>
      </div>
    )
  }

  // Show redirect state when user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 p-4 crt-scanlines flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyan-600 font-mono">REDIRECTING TO SIGN IN...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4 crt-scanlines">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 crt-flicker">
          <pre className="text-cyan-400 text-xs leading-none">
{`16-BIT WEATHER MAINFRAME
AUTHENTICATED USER SESSION ACTIVE`}
          </pre>
        </div>
        
        <div className="border-2 border-cyan-500 p-6">
          <h1 className="text-2xl font-mono mb-4">Welcome to 16-Bit Weather!</h1>
          <div className="text-cyan-600">
            Authentication successful. Weather data integration coming soon...
          </div>
        </div>
      </div>
    </div>
  )
} 
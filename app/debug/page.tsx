'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({})
  const [isClient, setIsClient] = useState(false)

  // Client-side mounting effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't call Clerk hooks during SSR
  if (!isClient) {
    return (
      <div className="p-8">
        <h1 className="text-2xl mb-4">Environment Debug</h1>
        <div className="bg-gray-800 p-4 rounded text-sm">
          Loading...
        </div>
      </div>
    )
  }

  // NOW it's safe to use Clerk hooks
  const { isSignedIn, userId, sessionId } = useAuth()

  useEffect(() => {
    setEnvVars({
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
      authStatus: {
        isSignedIn,
        userId,
        sessionId
      }
    })
  }, [isSignedIn, userId, sessionId])

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Environment Debug</h1>
      <pre className="bg-gray-800 p-4 rounded text-sm">
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  )
} 
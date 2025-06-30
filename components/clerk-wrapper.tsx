'use client'

import { useEffect, useState } from 'react'

interface ClerkWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClerkWrapper({ children, fallback }: ClerkWrapperProps) {
  const [isClerkAvailable, setIsClerkAvailable] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Check if Clerk environment variables are available
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const hasClerkConfig = !!publishableKey
    
    console.log('=== CLERK WRAPPER DEBUG ===')
    console.log('publishableKey:', publishableKey)
    console.log('hasClerkConfig:', hasClerkConfig)
    console.log('==========================')
    
    setIsClerkAvailable(hasClerkConfig)
  }, [])

  if (!isClient) {
    return fallback || <div>Loading...</div>
  }

  if (!isClerkAvailable) {
    return fallback || <div>Clerk not configured</div>
  }

  return <>{children}</>
} 
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  // Hooks must be called unconditionally at the top
  const { user, loading } = useAuth()
  const router = useRouter()

  // Playwright E2E runs: bypass client-side auth gating for determinism.
  // Middleware/test fixtures already cover auth behavior when needed.
  const isPlaywrightTestMode =
    process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true' ||
    process.env.PLAYWRIGHT_TEST_MODE === 'true'

  useEffect(() => {
    if (!isPlaywrightTestMode && !loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo, isPlaywrightTestMode])

  // Bypass auth for Playwright tests
  if (isPlaywrightTestMode) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
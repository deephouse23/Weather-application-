'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'
import { isPlaywrightTestModeAllowedEnv } from '@/lib/playwright-test-mode'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  // Hooks must be called unconditionally at the top
  const { user, loading } = useAuth()
  const router = useRouter()

  // Playwright E2E runs: bypass client-side auth gating for determinism.
  // SECURITY: Only activate when NODE_ENV is "development" or "test" (via shared
  // allowlist).  Prevents bypass on staging/preview where env var may be set but
  // real traffic is served.
  const isPlaywrightTestMode = isPlaywrightTestModeAllowedEnv(
    typeof window !== 'undefined' ? window.location.hostname : undefined
  ) && (
    process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true' ||
    process.env.PLAYWRIGHT_TEST_MODE === 'true'
  )

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
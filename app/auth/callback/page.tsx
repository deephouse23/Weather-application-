'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const { isInitialized, user, loading } = useAuth()
  const themeClasses = getComponentStyles(theme as ThemeType, 'auth')
  const [status, setStatus] = useState('Processing authentication...')
  const [error, setError] = useState<string | null>(null)

  const handleRedirect = useCallback((destination: string, delay = 1000) => {
    setTimeout(() => {
      router.replace(destination)
      router.refresh() // Force refresh to update auth state
    }, delay)
  }, [router])

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[Callback] Starting auth callback handler')
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        const next = searchParams.get('next') || '/dashboard' // Default to dashboard for better UX

        console.log('[Callback] Params:', { hasCode: !!code, hasError: !!error, next })

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error:', error, errorDescription)
          setError(`Authentication failed: ${errorDescription || error}`)
          setStatus('Authentication failed. Redirecting...')
          handleRedirect('/auth/login?error=' + encodeURIComponent(errorDescription || error), 3000)
          return
        }

        if (!code) {
          setError('No authentication code received')
          setStatus('No authentication code found. Redirecting...')
          handleRedirect('/auth/login', 2000)
          return
        }

        setStatus('Verifying your account...')

        console.log('[Callback] Exchanging code for session...')
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        console.log('[Callback] Exchange result:', { hasError: !!exchangeError })

        if (exchangeError) {
          console.error('Auth exchange error:', exchangeError)
          setError(exchangeError.message)
          setStatus('Authentication failed. Please try again.')
          handleRedirect('/auth/login?error=' + encodeURIComponent(exchangeError.message), 3000)
          return
        }

        // Session created successfully - redirect immediately
        // Profile and preferences will load on the destination page
        console.log('[Callback] Session created successfully, redirecting to:', next)
        setStatus('Authentication successful! Redirecting...')
        handleRedirect(next, 1000)

      } catch (error) {
        console.error('Callback error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        setStatus('Something went wrong. Please try again.')
        handleRedirect('/auth/login?error=' + encodeURIComponent(errorMessage), 3000)
      }
    }

    handleAuthCallback()
    // Only run once when searchParams change - don't re-run when auth state updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const isSuccess = status.includes('successful') || status.includes('Welcome')
  const isError = error !== null

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className={`text-center p-8 border-4 max-w-md w-full ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
        {/* 16-Bit Weather Logo */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 flex items-center justify-center ${
            isError ? 'opacity-50' : isSuccess ? 'opacity-100' : 'animate-pulse'
          }`}>
            <Image
              src="/logo-16bit-weather.svg"
              alt="16-Bit Weather"
              width={96}
              height={96}
              className={themeClasses.text}
              style={{ filter: isError ? 'grayscale(1)' : 'none' }}
              priority
            />
          </div>
        </div>

        <h1 className={`text-xl font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text}`}>
          {isError ? 'Authentication Failed' :
           isSuccess ? 'Welcome to 16-Bit Weather!' :
           'Verifying Account...'}
        </h1>

        <p className={`text-sm font-mono mb-4 ${
          isError ? 'text-red-400' : themeClasses.secondary || themeClasses.text
        }`}>
          {status}
        </p>

        {error && (
          <div className={`text-xs font-mono text-red-400 mb-4 p-3 border-2 border-red-500 ${themeClasses.background}`}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!isError && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`inline-block animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${
              isSuccess ? 'border-green-500' : themeClasses.borderColor
            }`}></div>
            {isSuccess && (
              <span className="text-green-500 font-mono text-sm">✓</span>
            )}
          </div>
        )}

        <div className={`text-xs font-mono mt-6 opacity-70 ${themeClasses.text}`}>
          {loading ? 'Initializing your session...' :
           isInitialized && user ? '✓ Session authenticated' :
           'Connecting to server...'}
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg, #0a0a0a)' }}>
      <div className="text-center p-8 border-4 max-w-md w-full bg-black border-green-500 shadow-lg shadow-green-500/20">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 animate-pulse">
            <Image
              src="/logo-16bit-weather.svg"
              alt="16-Bit Weather"
              width={96}
              height={96}
              className="text-green-500"
              priority
            />
          </div>
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider font-mono mb-4 text-green-500">
          16-Bit Weather
        </h1>
        <p className="text-sm font-mono mb-4 text-green-400">
          Preparing authentication...
        </p>
        <div className="mt-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-green-500"></div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
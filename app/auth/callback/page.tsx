'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
    }, delay)
  }, [router])

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        const next = searchParams.get('next') || '/dashboard'

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

        setStatus('Exchanging code for session...')
        
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('Auth exchange error:', exchangeError)
          setError(exchangeError.message)
          setStatus('Authentication failed. Please try again.')
          handleRedirect('/auth/login?error=' + encodeURIComponent(exchangeError.message), 3000)
          return
        }

        setStatus('Authentication successful! Setting up your session...')
        
        // Wait for the auth context to initialize and recognize the user
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max
        
        const waitForAuth = () => {
          attempts++
          
          if (isInitialized && user) {
            setStatus('Welcome! Redirecting to your dashboard...')
            handleRedirect(next, 500)
          } else if (attempts >= maxAttempts) {
            console.warn('Timeout waiting for auth initialization')
            setStatus('Taking longer than expected. Redirecting...')
            handleRedirect(next, 1000)
          } else {
            setTimeout(waitForAuth, 100)
          }
        }
        
        waitForAuth()
        
      } catch (error) {
        console.error('Callback error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        setStatus('Something went wrong. Please try again.')
        handleRedirect('/auth/login?error=' + encodeURIComponent(errorMessage), 3000)
      }
    }

    handleAuthCallback()
  }, [searchParams, handleRedirect, isInitialized, user])

  const isSuccess = status.includes('successful') || status.includes('Welcome')
  const isError = error !== null

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`text-center p-8 border-4 max-w-md w-full ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
        <div className={`w-12 h-12 border-2 flex items-center justify-center mx-auto mb-4 ${
          isError ? 'border-red-500' : isSuccess ? 'border-green-500' : 'animate-pulse'
        } ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
          <span className="text-black font-bold text-lg">16</span>
        </div>
        
        <h1 className={`text-xl font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text}`}>
          {isError ? 'Authentication Failed' : 
           isSuccess ? 'Authentication Complete!' : 
           'Processing Authentication...'}
        </h1>
        
        <p className={`text-sm font-mono mb-4 ${
          isError ? 'text-red-400' : themeClasses.secondary || themeClasses.text
        }`}>
          {status}
        </p>

        {error && (
          <div className={`text-xs font-mono text-red-400 mb-4 p-2 border border-red-500 rounded ${themeClasses.background}`}>
            Error: {error}
          </div>
        )}

        {!isError && (
          <div className="mt-4">
            <div className={`inline-block animate-spin rounded-full h-6 w-6 border-b-2 ${
              isSuccess ? 'border-green-500' : themeClasses.borderColor
            }`}></div>
          </div>
        )}

        <div className={`text-xs font-mono mt-4 opacity-70 ${themeClasses.text}`}>
          {loading ? 'Initializing session...' : 
           isInitialized && user ? 'Session ready' : 
           'Waiting for authentication...'}
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center p-8 border-4 max-w-md w-full bg-black border-green-500 shadow-lg shadow-green-500/20">
        <div className="w-12 h-12 border-2 border-green-500 bg-green-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-black font-bold text-lg">16</span>
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider font-mono mb-4 text-green-500">
          Loading Authentication...
        </h1>
        <p className="text-sm font-mono mb-4 text-green-400">
          Preparing authentication handler...
        </p>
        <div className="mt-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
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
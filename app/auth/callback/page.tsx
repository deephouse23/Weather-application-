'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'auth')

  useEffect(() => {
    // This page is handled by the route.ts file
    // If we reach this component, something went wrong
    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`text-center p-8 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
        <div className={`w-12 h-12 border-2 flex items-center justify-center mx-auto mb-4 animate-pulse ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
          <span className="text-black font-bold text-lg">16</span>
        </div>
        <h1 className={`text-xl font-bold uppercase tracking-wider font-mono mb-2 ${themeClasses.text}`}>
          Processing Authentication...
        </h1>
        <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
          Please wait while we complete your sign in
        </p>
        <div className="mt-4">
          <div className={`inline-block animate-spin rounded-full h-6 w-6 border-b-2 ${themeClasses.borderColor}`}></div>
        </div>
      </div>
    </div>
  )
}
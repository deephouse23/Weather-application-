'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Github, Chrome } from 'lucide-react'
import { signIn, signUp, signInWithProvider } from '@/lib/supabase/auth'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { theme } = useTheme()

  const themeClasses = getComponentStyles(theme as ThemeType, 'auth')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
        const { user, error } = await signIn({ email, password })
        if (error) {
          setError(error.message)
        } else if (user) {
          router.push('/')
        }
      } else {
        const { user, error } = await signUp({ 
          email, 
          password, 
          username: username || undefined,
          full_name: fullName || undefined
        })
        if (error) {
          setError(error.message)
        } else {
          setError('Check your email for confirmation link')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setLoading(true)
      const { error } = await signInWithProvider(provider)
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`w-full max-w-md p-8 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-12 h-12 border-2 flex items-center justify-center mx-auto mb-4 ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
            <span className="text-black font-bold text-lg">16</span>
          </div>
          <h1 className={`text-2xl font-bold uppercase tracking-wider font-mono mb-2 ${themeClasses.text}`}>
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h1>
          <p className={`text-sm ${themeClasses.mutedText}`}>
            {mode === 'signin' 
              ? 'Access your weather preferences and saved locations'
              : 'Create your account to save locations and customize your experience'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-3 mb-4 border-2 border-red-500 bg-red-100 text-red-700 text-sm font-mono`}>
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 disabled:opacity-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <Chrome className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>
          
          <button
            onClick={() => handleOAuthSignIn('github')}
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 disabled:opacity-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <Github className="w-4 h-4" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className={`absolute inset-0 flex items-center`}>
            <div className={`w-full border-t-2 ${themeClasses.borderColor}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`bg-current px-2 text-xs font-mono uppercase ${themeClasses.mutedText}`}>
              Or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
                  Username (Optional)
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current`}
                    placeholder="Choose a username"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current`}
                placeholder="Enter your password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.mutedText} hover:${themeClasses.text}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div className="text-right">
              <Link
                href="/auth/reset-password"
                className={`text-sm font-mono hover:underline ${themeClasses.accentText}`}
              >
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={mode === 'signin' ? '/auth/signup' : '/auth/login'}
              className={`font-bold hover:underline ${themeClasses.accentText}`}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
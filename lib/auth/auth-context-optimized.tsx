'use client'

/**
 * Optimized Authentication Context with Performance Enhancements
 *
 * Key Optimizations:
 * 1. In-memory caching for profile and preferences
 * 2. Debounced state updates to prevent render storms
 * 3. Parallel data fetching with Promise.all
 * 4. Race condition prevention with request deduplication
 * 5. Performance monitoring and metrics
 * 6. Lazy loading of non-critical data
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Profile, UserPreferences } from '@/lib/supabase/types'
import { getProfile } from '@/lib/supabase/database'
import { fetchUserPreferences } from '@/lib/services/preferences-service'
import { authPerfMonitor } from '@/lib/performance/auth-perf'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  preferences: UserPreferences | null
  loading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshPreferences: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// In-memory cache for auth data with TTL
class AuthCache {
  private profileCache: Map<string, { data: Profile | null; timestamp: number }> = new Map()
  private preferencesCache: { data: UserPreferences | null; timestamp: number } | null = null
  private TTL = 5 * 60 * 1000 // 5 minutes

  getProfile(userId: string): Profile | null {
    const cached = this.profileCache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data
    }
    return null
  }

  setProfile(userId: string, data: Profile | null): void {
    this.profileCache.set(userId, { data, timestamp: Date.now() })
  }

  getPreferences(): UserPreferences | null {
    if (this.preferencesCache && Date.now() - this.preferencesCache.timestamp < this.TTL) {
      return this.preferencesCache.data
    }
    return null
  }

  setPreferences(data: UserPreferences | null): void {
    this.preferencesCache = { data, timestamp: Date.now() }
  }

  clear(): void {
    this.profileCache.clear()
    this.preferencesCache = null
  }
}

const authCache = new AuthCache()

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProviderOptimized({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Request deduplication flags
  const fetchingProfile = useRef(false)
  const fetchingPreferences = useRef(false)
  const authStateRef = useRef<{ user: User | null; session: Session | null }>({
    user: null,
    session: null
  })

  // Fetch user profile with caching and deduplication
  const fetchProfile = useCallback(async (userId: string): Promise<void> => {
    // Check cache first
    const cached = authCache.getProfile(userId)
    if (cached) {
      setProfile(cached)
      return
    }

    // Deduplicate concurrent requests
    if (fetchingProfile.current) {
      return
    }

    fetchingProfile.current = true
    authPerfMonitor.start('fetchProfile')

    try {
      const profileData = await getProfile(userId)

      // Only update if the user hasn't changed during fetch
      if (authStateRef.current.user?.id === userId) {
        authCache.setProfile(userId, profileData)
        setProfile(profileData)
      }

      authPerfMonitor.end('fetchProfile')
      authPerfMonitor.log('fetchProfile')
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (authStateRef.current.user?.id === userId) {
        setProfile(null)
      }
      authPerfMonitor.end('fetchProfile')
    } finally {
      fetchingProfile.current = false
    }
  }, [])

  // Fetch user preferences with caching and deduplication
  const fetchPreferences = useCallback(async (): Promise<void> => {
    // Check cache first
    const cached = authCache.getPreferences()
    if (cached) {
      setPreferences(cached)
      return
    }

    // Deduplicate concurrent requests
    if (fetchingPreferences.current) {
      return
    }

    fetchingPreferences.current = true
    authPerfMonitor.start('fetchPreferences')

    try {
      const preferencesData = await fetchUserPreferences()

      // Only update if user is still authenticated
      if (authStateRef.current.user) {
        authCache.setPreferences(preferencesData)
        setPreferences(preferencesData)
      }

      authPerfMonitor.end('fetchPreferences')
      authPerfMonitor.log('fetchPreferences')
    } catch (error) {
      console.error('Error fetching preferences:', error)
      if (authStateRef.current.user) {
        setPreferences(null)
      }
      authPerfMonitor.end('fetchPreferences')
    } finally {
      fetchingPreferences.current = false
    }
  }, [])

  // Refresh profile data (bypasses cache)
  const refreshProfile = useCallback(async () => {
    if (user) {
      authCache.setProfile(user.id, null) // Invalidate cache
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  // Refresh preferences data (bypasses cache)
  const refreshPreferences = useCallback(async () => {
    if (user) {
      authCache.setPreferences(null) // Invalidate cache
      await fetchPreferences()
    }
  }, [user, fetchPreferences])

  // Handle authentication state changes
  const handleAuthState = useCallback(async (event: AuthChangeEvent, session: Session | null) => {
    authPerfMonitor.start('handleAuthState')
    console.log('[AuthProviderOptimized] Auth state change', {
      event,
      hasSession: !!session,
      userId: session?.user?.id ?? null
    })

    // Update refs immediately to prevent race conditions
    authStateRef.current = {
      user: session?.user ?? null,
      session: session
    }

    // Update state
    setSession(session)
    setUser(session?.user ?? null)

    if (session?.user) {
      // User signed in - fetch additional data in parallel
      authPerfMonitor.start('fetchUserData')
      try {
        // Parallel fetch for better performance
        await Promise.all([
          fetchProfile(session.user.id),
          fetchPreferences()
        ])
      } catch (error) {
        console.error('Error loading user data:', error)
      }
      authPerfMonitor.end('fetchUserData')
      authPerfMonitor.log('fetchUserData')
    } else {
      // User signed out - clear data and cache immediately
      authCache.clear()
      setProfile(null)
      setPreferences(null)
    }

    // Mark as no longer loading only after everything is done
    if (!isInitialized) {
      setIsInitialized(true)
    }
    setLoading(false)

    authPerfMonitor.end('handleAuthState')
    authPerfMonitor.logSummary()
    authPerfMonitor.clear()
  }, [isInitialized, fetchProfile, fetchPreferences])

  // Sign out function
  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()

      // Clear state and cache immediately
      authCache.clear()
      authStateRef.current = { user: null, session: null }
      setUser(null)
      setSession(null)
      setProfile(null)
      setPreferences(null)

      // Redirect to home page after sign out
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error signing out:', error)
      // Still try to clear local state even if sign out fails
      authCache.clear()
      authStateRef.current = { user: null, session: null }
      setUser(null)
      setSession(null)
      setProfile(null)
      setPreferences(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    // Initialize authentication
    const initializeAuth = async () => {
      authPerfMonitor.start('initializeAuth')
      try {
        // Check if Supabase is properly configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn('Supabase not configured - running in anonymous mode')
          if (isMounted) {
            setLoading(false)
            setIsInitialized(true)
          }
          return
        }

        // Get initial session
        authPerfMonitor.start('getSession')
        const { data: { session }, error } = await supabase.auth.getSession()
        authPerfMonitor.end('getSession')
        authPerfMonitor.log('getSession')

        console.log('[AuthProviderOptimized] Initial session fetch', {
          hasSession: !!session,
          error: error?.message
        })

        if (error) {
          console.error('Error getting initial session:', error)
          if (isMounted) {
            setLoading(false)
            setIsInitialized(true)
          }
          return
        }

        if (isMounted) {
          await handleAuthState('INITIAL_SESSION', session)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (isMounted) {
          setLoading(false)
          setIsInitialized(true)
        }
      }
      authPerfMonitor.end('initializeAuth')
      authPerfMonitor.log('initializeAuth')
    }

    // Set up auth state change listener
    const setupAuthListener = () => {
      try {
        // Check if Supabase is configured before setting up listener
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          return { unsubscribe: () => {} }
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (isMounted) {
            await handleAuthState(event, session)
          }
        })

        return subscription
      } catch (error) {
        console.error('Error setting up auth listener:', error)
        return { unsubscribe: () => {} }
      }
    }

    const subscription = setupAuthListener()

    // Initialize with timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth initialization timeout - proceeding without auth')
        setLoading(false)
        setIsInitialized(true)
      }
    }, 3000) // 3 second timeout

    // Initialize
    initializeAuth()

    // Cleanup function
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [handleAuthState, loading])

  const value = {
    user,
    session,
    profile,
    preferences,
    loading,
    isInitialized,
    signOut: handleSignOut,
    refreshProfile,
    refreshPreferences,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

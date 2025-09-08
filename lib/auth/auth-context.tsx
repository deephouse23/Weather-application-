'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Profile, UserPreferences } from '@/lib/supabase/types'
import { getProfile } from '@/lib/supabase/database'
import { fetchUserPreferences } from '@/lib/services/preferences-service'

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

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use refs to prevent race conditions and track loading states
  const isLoadingProfile = useRef(false)
  const isLoadingPreferences = useRef(false)
  const authStateRef = useRef<{ user: User | null; session: Session | null }>({
    user: null,
    session: null
  })

  // Fetch user profile with race condition protection
  const fetchProfile = useCallback(async (userId: string) => {
    if (isLoadingProfile.current) {
      return
    }
    
    isLoadingProfile.current = true
    try {
      const profileData = await getProfile(userId)
      // Only update if the user hasn't changed during fetch
      if (authStateRef.current.user?.id === userId) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (authStateRef.current.user?.id === userId) {
        setProfile(null)
      }
    } finally {
      isLoadingProfile.current = false
    }
  }, [])

  // Fetch user preferences with race condition protection
  const fetchPreferences = useCallback(async () => {
    if (isLoadingPreferences.current) {
      return
    }
    
    isLoadingPreferences.current = true
    try {
      const preferencesData = await fetchUserPreferences()
      // Only update if user is still authenticated
      if (authStateRef.current.user) {
        setPreferences(preferencesData)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      if (authStateRef.current.user) {
        setPreferences(null)
      }
    } finally {
      isLoadingPreferences.current = false
    }
  }, [])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  // Refresh preferences data
  const refreshPreferences = useCallback(async () => {
    if (user) {
      await fetchPreferences()
    }
  }, [user, fetchPreferences])

  // Handle authentication state changes
  const handleAuthState = useCallback(async (event: AuthChangeEvent, session: Session | null) => {
    console.log('Auth state change:', event, session?.user?.id || 'no user')
    
    // Update refs immediately to prevent race conditions
    authStateRef.current = {
      user: session?.user ?? null,
      session: session
    }
    
    // Update state
    setSession(session)
    setUser(session?.user ?? null)

    if (session?.user) {
      // User signed in - fetch additional data
      try {
        await Promise.all([
          fetchProfile(session.user.id),
          fetchPreferences()
        ])
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    } else {
      // User signed out - clear data immediately
      setProfile(null)
      setPreferences(null)
    }

    // Mark as no longer loading only after everything is done
    if (!isInitialized) {
      setIsInitialized(true)
    }
    setLoading(false)
  }, [isInitialized, fetchProfile, fetchPreferences])

  // Sign out function
  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      
      // Clear state immediately
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
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
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
    }

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        await handleAuthState(event, session)
      }
    })

    // Initialize
    initializeAuth()

    // Cleanup function
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [handleAuthState])

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
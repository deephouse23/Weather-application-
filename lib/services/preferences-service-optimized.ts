/**
 * Optimized User Preferences Service
 *
 * Performance Enhancements:
 * 1. In-memory caching with configurable TTL
 * 2. Request deduplication to prevent redundant API calls
 * 3. Debounced updates to batch rapid changes
 * 4. Optimistic updates for better UX
 * 5. Background refresh for stale data
 */

import { UserPreferences, UserPreferencesUpdate } from '@/lib/supabase/types'
import { authPerfMonitor } from '@/lib/performance/auth-perf'

interface PreferencesResponse {
  preferences: UserPreferences
  error?: string
}

// In-memory cache with TTL
class PreferencesCache {
  private cache: UserPreferences | null = null
  private timestamp: number = 0
  private TTL: number = 5 * 60 * 1000 // 5 minutes default
  private inflight: Promise<UserPreferences | null> | null = null

  setTTL(ttl: number): void {
    this.TTL = ttl
  }

  get(): UserPreferences | null {
    if (this.cache && Date.now() - this.timestamp < this.TTL) {
      return this.cache
    }
    return null
  }

  set(preferences: UserPreferences | null): void {
    this.cache = preferences
    this.timestamp = Date.now()
  }

  clear(): void {
    this.cache = null
    this.timestamp = 0
    this.inflight = null
  }

  isStale(): boolean {
    return Date.now() - this.timestamp > this.TTL / 2
  }

  getInflight(): Promise<UserPreferences | null> | null {
    return this.inflight
  }

  setInflight(promise: Promise<UserPreferences | null>): void {
    this.inflight = promise
  }

  clearInflight(): void {
    this.inflight = null
  }
}

const preferencesCache = new PreferencesCache()

// Debounce map for batching updates
const updateDebounceMap = new Map<string, NodeJS.Timeout>()

/**
 * Fetch user preferences with caching and request deduplication
 */
export const fetchUserPreferences = async (): Promise<UserPreferences | null> => {
  authPerfMonitor.start('fetchUserPreferences')

  // Check cache first
  const cached = preferencesCache.get()
  if (cached) {
    authPerfMonitor.end('fetchUserPreferences')
    authPerfMonitor.log('fetchUserPreferences')
    return cached
  }

  // Check for inflight request
  const inflight = preferencesCache.getInflight()
  if (inflight) {
    return inflight
  }

  // Create new request
  const request = performFetch()
  preferencesCache.setInflight(request)

  try {
    const result = await request
    preferencesCache.clearInflight()
    authPerfMonitor.end('fetchUserPreferences')
    authPerfMonitor.log('fetchUserPreferences')

    // Background refresh if stale
    if (result && preferencesCache.isStale()) {
      setTimeout(() => {
        performFetch(true) // Silent background refresh
      }, 0)
    }

    return result
  } catch (error) {
    preferencesCache.clearInflight()
    authPerfMonitor.end('fetchUserPreferences')
    throw error
  }
}

/**
 * Internal fetch function
 */
async function performFetch(silent: boolean = false): Promise<UserPreferences | null> {
  try {
    const response = await fetch('/api/user/preferences', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // If preferences don't exist (404), create them
      if (response.status === 404 || response.status === 401) {
        return null
      }
      console.error('Failed to fetch preferences:', response.statusText)
      return null
    }

    const data: PreferencesResponse = await response.json()
    preferencesCache.set(data.preferences)
    return data.preferences
  } catch (error) {
    if (!silent) {
      console.error('Error fetching user preferences:', error)
    }
    return null
  }
}

/**
 * Update user preferences with debouncing and optimistic updates
 */
export const updateUserPreferencesAPI = async (
  updates: UserPreferencesUpdate,
  options: { debounce?: number; optimistic?: boolean } = {}
): Promise<UserPreferences | null> => {
  const { debounce = 0, optimistic = true } = options

  // Optimistic update
  if (optimistic) {
    const current = preferencesCache.get()
    if (current) {
      const optimisticData = { ...current, ...updates }
      preferencesCache.set(optimisticData)
    }
  }

  // Debounce if requested
  if (debounce > 0) {
    return new Promise((resolve) => {
      const key = 'preferences-update'
      if (updateDebounceMap.has(key)) {
        clearTimeout(updateDebounceMap.get(key)!)
      }

      const timer = setTimeout(async () => {
        updateDebounceMap.delete(key)
        const result = await performUpdate(updates)
        resolve(result)
      }, debounce)

      updateDebounceMap.set(key, timer)
    })
  }

  return performUpdate(updates)
}

/**
 * Internal update function
 */
async function performUpdate(updates: UserPreferencesUpdate): Promise<UserPreferences | null> {
  authPerfMonitor.start('updateUserPreferences')

  try {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      console.error('Failed to update preferences:', response.statusText)
      // Invalidate optimistic update on failure
      preferencesCache.clear()
      authPerfMonitor.end('updateUserPreferences')
      return null
    }

    const data: PreferencesResponse = await response.json()
    preferencesCache.set(data.preferences)

    authPerfMonitor.end('updateUserPreferences')
    authPerfMonitor.log('updateUserPreferences')
    return data.preferences
  } catch (error) {
    console.error('Error updating user preferences:', error)
    // Invalidate optimistic update on error
    preferencesCache.clear()
    authPerfMonitor.end('updateUserPreferences')
    return null
  }
}

/**
 * Create initial user preferences
 */
export const createUserPreferences = async (
  initialPrefs: { theme?: string; units?: string } = {}
): Promise<UserPreferences | null> => {
  authPerfMonitor.start('createUserPreferences')

  try {
    const response = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialPrefs),
    })

    if (!response.ok) {
      console.error('Failed to create preferences:', response.statusText)
      authPerfMonitor.end('createUserPreferences')
      return null
    }

    const data: PreferencesResponse = await response.json()
    preferencesCache.set(data.preferences)

    authPerfMonitor.end('createUserPreferences')
    authPerfMonitor.log('createUserPreferences')
    return data.preferences
  } catch (error) {
    console.error('Error creating user preferences:', error)
    authPerfMonitor.end('createUserPreferences')
    return null
  }
}

/**
 * Update theme preference specifically with optimistic update
 */
export const updateThemePreference = async (theme: 'dark' | 'miami' | 'tron'): Promise<boolean> => {
  try {
    const updatedPrefs = await updateUserPreferencesAPI(
      { theme },
      { debounce: 100, optimistic: true }
    )
    return !!updatedPrefs
  } catch (error) {
    console.error('Error updating theme preference:', error)
    return false
  }
}

/**
 * Invalidate cache (useful for forced refresh)
 */
export const invalidatePreferencesCache = (): void => {
  preferencesCache.clear()
}

/**
 * Preload preferences (useful for ahead-of-time caching)
 */
export const preloadPreferences = async (): Promise<void> => {
  if (!preferencesCache.get()) {
    await fetchUserPreferences()
  }
}

/**
 * Configure cache TTL
 */
export const setPreferencesCacheTTL = (ttl: number): void => {
  preferencesCache.setTTL(ttl)
}

import { Profile, ProfileUpdate, SavedLocation, SavedLocationInsert, SavedLocationUpdate, UserPreferences, UserPreferencesUpdate } from './types'
import { DbSavedLocation, dbToSavedLocation, savedLocationToDb } from './schema-adapter'
import { getSupabaseAdmin } from './admin'
import { captureDbError } from '../error-utils'

/**
 * Server-side Supabase client (service-role, bypasses RLS).
 *
 * ⚠️  SECURITY: This uses SUPABASE_SERVICE_ROLE_KEY which bypasses all
 *     Row-Level Security policies. It must ONLY be used on the server.
 *     NEVER add the NEXT_PUBLIC_ prefix to SUPABASE_SERVICE_ROLE_KEY —
 *     that would expose it to the browser, allowing unauthenticated users
 *     to bypass every RLS policy.
 *
 * CONSOLIDATED: Previously this module maintained its own _serverClient singleton,
 * duplicating the connection pool that lib/supabase/admin.ts already managed.
 * Now it delegates to getSupabaseAdmin() so there is exactly one service-role
 * connection pool per process — see t_14f59a96.
 */

/** Return a shared Supabase client (service-role on server, anon on browser). */
const getSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the browser singleton (already cached at module level
    // in lib/supabase/client.ts — `require` avoids bundling server code).
    const { supabase } = require('./client')
    return supabase
  }

  // Server-side: reuse the admin singleton (one connection pool per process)
  return getSupabaseAdmin()
}

// Null UUID used for mock/test sessions - no profile exists for this
const NULL_UUID = '00000000-0000-0000-0000-000000000000'

// Profile operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  // Guard: Skip database query for null UUID (used in Playwright test mode)
  // This prevents "Cannot coerce the result to a single JSON object" errors
  if (!userId || userId === NULL_UUID) {
    return null
  }

  const supabase = getSupabaseClient()

  // Try with all columns first, fallback to essential columns only
  let { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, email, default_location, avatar_url, preferred_units, timezone, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (error && error.message.includes('does not exist')) {
    console.warn('Some profile columns missing, using fallback query:', error.message)
    // Fallback to only columns we know exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('profiles')
      .select('id, username, created_at, updated_at')
      .eq('id', userId)
      .single()
    
    if (fallbackError) {
      captureDbError('getProfile.fallback', fallbackError, { userId })
      return null
    }
    
    // Return with default values for missing columns
    data = {
      ...fallbackData,
      full_name: null,
      email: null,
      default_location: null,
      avatar_url: null,
      preferred_units: 'imperial' as const,
      timezone: 'UTC'
    }
  } else if (error) {
    captureDbError('getProfile', error, { userId })
    return null
  }

  return data
}

export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<Profile | null> => {
  if (!userId) {
    return null
  }

  // Return mock profile for test sessions (nil UUID) to avoid DB errors
  if (userId === NULL_UUID) {
    return {
      id: NULL_UUID,
      username: updates.username ?? null,
      full_name: updates.full_name ?? null,
      email: '',
      default_location: updates.default_location ?? null,
      avatar_url: updates.avatar_url ?? null,
      preferred_units: updates.preferred_units ?? 'imperial' as const,
      timezone: updates.timezone ?? 'UTC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile
  }

  const supabase = getSupabaseClient()

  // Filter out updates for columns that might not exist
  const safeUpdates: any = {}

  // Include all common profile fields in safe updates
  if (updates.username !== undefined) safeUpdates.username = updates.username
  if (updates.full_name !== undefined) safeUpdates.full_name = updates.full_name
  if (updates.default_location !== undefined) safeUpdates.default_location = updates.default_location
  if (updates.avatar_url !== undefined) safeUpdates.avatar_url = updates.avatar_url
  if (updates.preferred_units !== undefined) safeUpdates.preferred_units = updates.preferred_units
  if (updates.timezone !== undefined) safeUpdates.timezone = updates.timezone

  // Explicitly select all columns to ensure we get complete data back
  const selectColumns = 'id, username, full_name, email, default_location, avatar_url, preferred_units, timezone, created_at, updated_at'

  // Try to update with full column set first
  let { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(selectColumns)
    .single()

  if (error) {
    // Capture detailed error information in Sentry
    captureDbError('updateProfile', error, { userId, updates })

    // Check if error is due to missing columns
    if (error.message.includes('does not exist')) {
      console.warn('Some profile columns missing during update, using safe updates:', error.message)
      // Fallback to only safe updates
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', userId)
        .select(selectColumns)
        .single()

      if (fallbackError) {
        captureDbError('updateProfile.fallback', fallbackError, { userId })
        return null
      }

      // Validate that we got data back
      if (!fallbackData) {
        captureDbError('updateProfile.fallback', { message: 'No data returned' }, { userId })
        return null
      }

      data = fallbackData
    } else {
      // Other errors (RLS violations, constraints, etc.) - already captured above
      return null
    }
  }

  // Validate that we got data back
  if (!data) {
    captureDbError('updateProfile', { message: 'No data returned' }, { userId })
    return null
  }

  return data
}

// Saved locations operations
export const getSavedLocations = async (userId: string): Promise<SavedLocation[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    captureDbError('getSavedLocations', error, { userId })
    return []
  }

  return data || []
}

const saveLocation = async (locationData: SavedLocationInsert): Promise<SavedLocation | null> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('saved_locations')
    .insert(locationData)
    .select()
    .single()

  if (error) {
    captureDbError('saveLocation', error, { user_id: locationData.user_id })
    return null
  }

  return data
}

const updateSavedLocation = async (
  locationId: string, 
  updates: SavedLocationUpdate
): Promise<SavedLocation | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('saved_locations')
    .update(updates)
    .eq('id', locationId)
    .select()
    .single()

  if (error) {
    captureDbError('updateSavedLocation', error, { locationId })
    return null
  }

  return data
}

export const deleteSavedLocation = async (locationId: string): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('saved_locations')
    .delete()
    .eq('id', locationId)

  if (error) {
    captureDbError('deleteSavedLocation', error, { locationId })
    return false
  }

  return true
}

export const toggleLocationFavorite = async (locationId: string, isFavorite: boolean): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('saved_locations')
    .update({ is_favorite: isFavorite })
    .eq('id', locationId)

  if (error) {
    captureDbError('toggleLocationFavorite', error, { locationId, isFavorite })
    return false
  }

  return true
}

// User preferences operations
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    captureDbError('getUserPreferences', error, { userId })
    return null
  }

  return data
}

const updateUserPreferences = async (
  userId: string,
  updates: UserPreferencesUpdate
): Promise<UserPreferences | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    captureDbError('updateUserPreferences', error, { userId, updates })
    return null
  }

  return data
}

// Utility functions for weather app integration
const getLocationsByUser = async (userId: string, limit: number = 10): Promise<SavedLocation[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    captureDbError('getLocationsByUser', error, { userId, limit })
    return []
  }

  return data || []
}

const getFavoriteLocations = async (userId: string): Promise<SavedLocation[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false })

  if (error) {
    captureDbError('getFavoriteLocations', error, { userId })
    return []
  }

  return data || []
}

const searchSavedLocations = async (userId: string, searchTerm: string): Promise<SavedLocation[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', userId)
    .or(`location_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,custom_name.ilike.%${searchTerm}%`)
    .order('is_favorite', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) {
    captureDbError('searchSavedLocations', error, { userId, searchTerm })
    return []
  }

  return data || []
}
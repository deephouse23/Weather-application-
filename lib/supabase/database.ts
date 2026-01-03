import { createClient } from '@supabase/supabase-js'
import { Profile, ProfileUpdate, SavedLocation, SavedLocationInsert, SavedLocationUpdate, UserPreferences, UserPreferencesUpdate } from './types'
import { DbSavedLocation, dbToSavedLocation, savedLocationToDb } from './schema-adapter'
import { PLACEHOLDER_URL, PLACEHOLDER_SERVICE_KEY } from './constants'

// Create a supabase client that works in both server and client contexts
const getSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the browser client
    const { supabase } = require('./client')
    return supabase
  } else {
    // Server-side: create a service role client with fallbacks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_SERVICE_KEY
    
    return createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
}

// Profile operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
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
      console.error('Error fetching profile (fallback):', fallbackError)
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
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<Profile | null> => {
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
    // Log detailed error information for debugging
    console.error('Error updating profile:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId,
      updates
    })

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
        console.error('Error updating profile (fallback):', {
          message: fallbackError.message,
          details: fallbackError.details,
          hint: fallbackError.hint,
          code: fallbackError.code
        })
        return null
      }

      // Validate that we got data back
      if (!fallbackData) {
        console.error('Profile update succeeded but no data returned (fallback)')
        return null
      }

      data = fallbackData
    } else {
      // Other errors (RLS violations, constraints, etc.)
      console.error('Profile update failed:', error.message)
      return null
    }
  }

  // Validate that we got data back
  if (!data) {
    console.error('Profile update succeeded but no data returned')
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
    console.error('Error fetching saved locations:', error)
    return []
  }

  return data || []
}

export const saveLocation = async (locationData: SavedLocationInsert): Promise<SavedLocation | null> => {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('saved_locations')
    .insert(locationData)
    .select()
    .single()

  if (error) {
    console.error('Error saving location to database:', error.message)
    if (error.code) {
      console.error('Database error code:', error.code)
    }
    return null
  }

  return data
}

export const updateSavedLocation = async (
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
    console.error('Error updating saved location:', error)
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
    console.error('Error deleting saved location:', error)
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
    console.error('Error toggling location favorite:', error)
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
    console.error('Error fetching user preferences:', error)
    return null
  }

  return data
}

export const updateUserPreferences = async (
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
    console.error('Error updating user preferences:', error)
    return null
  }

  return data
}

// Utility functions for weather app integration
export const getLocationsByUser = async (userId: string, limit: number = 10): Promise<SavedLocation[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching user locations:', error)
    return []
  }

  return data || []
}

export const getFavoriteLocations = async (userId: string): Promise<SavedLocation[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorite locations:', error)
    return []
  }

  return data || []
}

export const searchSavedLocations = async (userId: string, searchTerm: string): Promise<SavedLocation[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', userId)
    .or(`location_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,custom_name.ilike.%${searchTerm}%`)
    .order('is_favorite', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error searching saved locations:', error)
    return []
  }

  return data || []
}
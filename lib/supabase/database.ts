'use client'

import { supabase } from './client'
import { Profile, ProfileUpdate, SavedLocation, SavedLocationInsert, SavedLocationUpdate, UserPreferences, UserPreferencesUpdate } from './types'

// Profile operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

// Saved locations operations
export const getSavedLocations = async (userId: string): Promise<SavedLocation[]> => {
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
  const { data, error } = await supabase
    .from('saved_locations')
    .insert(locationData)
    .select()
    .single()

  if (error) {
    console.error('Error saving location:', error)
    return null
  }

  return data
}

export const updateSavedLocation = async (
  locationId: string, 
  updates: SavedLocationUpdate
): Promise<SavedLocation | null> => {
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
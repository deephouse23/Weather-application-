'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single supabase client for interacting with your database
// If not configured, create a dummy client that will fail gracefully
export const supabase = supabaseUrl && supabaseAnonKey
  ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  : createBrowserClient<Database>('https://placeholder.supabase.co', 'placeholder-key')

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to get user session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}
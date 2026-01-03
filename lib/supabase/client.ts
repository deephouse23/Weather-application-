'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'
import { PLACEHOLDER_URL, PLACEHOLDER_ANON_KEY } from './constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Using placeholder client.')
} else {
  console.log('[Supabase] Client initialized', { supabaseUrl })
}

export const supabase = createBrowserClient<Database>(
  supabaseUrl || PLACEHOLDER_URL, 
  supabaseAnonKey || PLACEHOLDER_ANON_KEY
)

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

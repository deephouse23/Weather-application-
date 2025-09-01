'use client'

import { supabase } from './client'
import { AuthError, User } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
  username?: string
  full_name?: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up new user
export const signUp = async ({ email, password, username, full_name }: SignUpData): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name,
      }
    }
  })

  return {
    user: data.user,
    error
  }
}

// Sign in existing user
export const signIn = async ({ email, password }: SignInData): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return {
    user: data.user,
    error
  }
}

// Sign in with OAuth providers
export const signInWithProvider = async (provider: 'google' | 'github' | 'discord') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  return { data, error }
}

// Sign out user
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  return { data, error }
}

// Update password
export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password
  })

  return {
    user: data.user,
    error
  }
}

// Update user profile
export const updateProfile = async (updates: {
  username?: string
  full_name?: string
  avatar_url?: string
}) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })

  return {
    user: data.user,
    error
  }
}

// Check if username is available
export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (error && error.code === 'PGRST116') {
    // No rows returned, username is available
    return true
  }

  // Username exists or other error
  return false
}
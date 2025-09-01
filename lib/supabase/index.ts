// Main export file for Supabase integration
export { supabase, getCurrentUser, getSession } from './client'
export { createServerSupabaseClient, getServerUser, getServerSession } from './server'
export * from './auth'
export * from './database'
export * from './hooks'
export * from './types'
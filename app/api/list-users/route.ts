import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json({
        success: false,
        error: usersError.message
      }, { status: 500 })
    }
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    
    // Get all preferences
    const { data: preferences, error: preferencesError } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
    
    const result = {
      success: true,
      users: users?.users?.map(user => ({
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        provider: user.app_metadata?.provider
      })) || [],
      profiles: profiles?.map(profile => ({
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        defaultLocation: profile.default_location,
        createdAt: profile.created_at
      })) || [],
      preferences: preferences?.map(pref => ({
        userId: pref.user_id,
        theme: pref.theme,
        units: pref.units,
        createdAt: pref.created_at
      })) || [],
      summary: {
        totalUsers: users?.users?.length || 0,
        totalProfiles: profiles?.length || 0,
        totalPreferences: preferences?.length || 0
      }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('List users failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to list users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
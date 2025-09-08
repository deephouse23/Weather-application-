import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN FUNCTIONALITY TEST ===')
    
    const body = await request.json()
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password required for login test'
      }, { status: 400 })
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Create client with anon key (same as frontend would use)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    console.log('Attempting login with email:', email)
    
    // Test login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('Login result:', { 
      success: !error,
      hasUser: !!data.user,
      hasSession: !!data.session,
      error: error?.message
    })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.name || 'LOGIN_ERROR'
      }, { status: 401 })
    }
    
    if (!data.user) {
      return NextResponse.json({
        success: false,
        error: 'No user returned from login'
      }, { status: 401 })
    }
    
    // Test fetching user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    console.log('Profile fetch result:', {
      hasProfile: !!profile,
      error: profileError?.message
    })
    
    // Test fetching user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', data.user.id)
      .single()
    
    console.log('Preferences fetch result:', {
      hasPreferences: !!preferences,
      error: preferencesError?.message
    })
    
    const result = {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: !!data.user.email_confirmed_at,
        createdAt: data.user.created_at
      },
      session: {
        hasAccessToken: !!data.session?.access_token,
        expiresAt: data.session?.expires_at
      },
      profile: {
        exists: !!profile,
        data: profile ? {
          username: profile.username,
          fullName: profile.full_name,
          defaultLocation: profile.default_location
        } : null,
        error: profileError?.message
      },
      preferences: {
        exists: !!preferences,
        data: preferences ? {
          theme: preferences.theme,
          units: preferences.units
        } : null,
        error: preferencesError?.message
      }
    }
    
    console.log('=== LOGIN TEST COMPLETE ===')
    console.log(JSON.stringify(result, null, 2))
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Login test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Login test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with {"email": "test@example.com", "password": "password"} to test login'
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getProfile, updateProfile } from '@/lib/supabase/database'

export async function GET() {
  try {
    console.log('=== USER PORTAL FUNCTIONALITY TEST ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Get existing user to test with
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const testUser = users?.users?.[0]
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'No users found to test with'
      }, { status: 404 })
    }
    
    const tests = []
    
    // Test 1: Profile read with fallback logic
    try {
      const profile = await getProfile(testUser.id)
      tests.push({
        test: 'profile_read',
        success: !!profile,
        data: profile ? {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          email: profile.email,
          default_location: profile.default_location
        } : null,
        description: 'Read user profile with fallback handling'
      })
    } catch (error) {
      tests.push({
        test: 'profile_read',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        description: 'Read user profile with fallback handling'
      })
    }
    
    // Test 2: Profile update with safe fields
    try {
      const testUpdates = {
        username: 'test-user-' + Date.now()
      }
      
      const updatedProfile = await updateProfile(testUser.id, testUpdates)
      tests.push({
        test: 'profile_update',
        success: !!updatedProfile,
        data: updatedProfile ? {
          id: updatedProfile.id,
          username: updatedProfile.username
        } : null,
        description: 'Update user profile with safe fallback'
      })
    } catch (error) {
      tests.push({
        test: 'profile_update',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        description: 'Update user profile with safe fallback'
      })
    }
    
    // Test 3: Auth context functionality
    const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    
    try {
      const { data, error } = await supabaseClient.auth.getSession()
      tests.push({
        test: 'auth_session_check',
        success: !error,
        hasSession: !!data?.session,
        error: error?.message,
        description: 'Check auth session functionality'
      })
    } catch (error) {
      tests.push({
        test: 'auth_session_check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        description: 'Check auth session functionality'
      })
    }
    
    // Test 4: User preferences
    try {
      const { data: preferences, error } = await supabaseAdmin
        .from('user_preferences')
        .select('*')
        .eq('user_id', testUser.id)
        .single()
      
      tests.push({
        test: 'user_preferences',
        success: !error,
        data: preferences ? {
          theme: preferences.theme,
          temperature_unit: preferences.temperature_unit,
          wind_unit: preferences.wind_unit
        } : null,
        error: error?.message,
        description: 'Read user preferences'
      })
    } catch (error) {
      tests.push({
        test: 'user_preferences',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        description: 'Read user preferences'
      })
    }
    
    // Test 5: Protected route simulation
    try {
      // Simulate what happens when accessing a protected route
      const mockProtectedAccess = {
        hasUser: !!testUser,
        userEmail: testUser.email,
        profileAccessible: tests.find(t => t.test === 'profile_read')?.success || false,
        preferencesAccessible: tests.find(t => t.test === 'user_preferences')?.success || false
      }
      
      tests.push({
        test: 'protected_route_simulation',
        success: mockProtectedAccess.hasUser && mockProtectedAccess.profileAccessible,
        data: mockProtectedAccess,
        description: 'Simulate protected route access'
      })
    } catch (error) {
      tests.push({
        test: 'protected_route_simulation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        description: 'Simulate protected route access'
      })
    }
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      testUser: {
        id: testUser.id,
        email: testUser.email,
        emailConfirmed: !!testUser.email_confirmed_at
      },
      tests,
      summary: {
        totalTests: tests.length,
        passed: tests.filter(t => t.success).length,
        failed: tests.filter(t => !t.success).length,
        portalStatus: tests.filter(t => t.success).length === tests.length ? 'WORKING' : 'PARTIALLY_WORKING'
      },
      recommendations: [
        'Run the SQL commands to add missing columns to profiles table',
        'The fallback logic allows basic functionality to work',
        'Profile updates are limited to username only until schema is fixed'
      ]
    }
    
    console.log('=== USER PORTAL TEST COMPLETE ===')
    console.log(JSON.stringify(result, null, 2))
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('User portal test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'User portal test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
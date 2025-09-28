import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    console.log('=== AUTHENTICATION DIAGNOSTIC ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Test 1: Service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test 2: Anonymous client
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test 3: Check users in auth.users table
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    console.log('Users in system:', { 
      count: users?.users?.length || 0, 
      error: usersError?.message 
    })
    
    // Test 4: Check profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    
    console.log('Profiles in system:', { 
      count: profiles?.length || 0, 
      error: profilesError?.message 
    })
    
    // Test 5: Check user_preferences table
    const { data: preferences, error: preferencesError } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
    
    console.log('User preferences in system:', { 
      count: preferences?.length || 0, 
      error: preferencesError?.message 
    })
    
    // Test 6: Try to get current session (should be null for API route)
    const { data: currentSession, error: sessionError } = await supabaseAnon.auth.getSession()
    
    console.log('Current session:', { 
      hasSession: !!currentSession?.session,
      error: sessionError?.message 
    })
    
    // Test 7: Test if we can create a test user (will use service role)
    const testEmail = 'test-diagnostic@16bitweather.co'
    let testUserResult = null
    let testUserError = null
    
    try {
      // First, try to delete the test user if it exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingTestUser = existingUsers?.users?.find(u => u.email === testEmail)
      
      if (existingTestUser) {
        await supabaseAdmin.auth.admin.deleteUser(existingTestUser.id)
        console.log('Deleted existing test user')
      }
      
      // Create test user
      const { data: testUser, error } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'test123456',
        email_confirm: true
      })
      
      testUserResult = testUser
      testUserError = error
      
      // Clean up - delete the test user
      if (testUser?.user) {
        await supabaseAdmin.auth.admin.deleteUser(testUser.user.id)
        console.log('Cleaned up test user')
      }
      
    } catch (err) {
      testUserError = err instanceof Error ? err : new Error('Unknown error')
    }
    
    const diagnosticResults = {
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        serviceRoleConnection: {
          success: true,
          description: 'Service role client initialized successfully'
        },
        anonConnection: {
          success: true,
          description: 'Anonymous client initialized successfully'
        },
        usersList: {
          success: !usersError,
          count: users?.users?.length || 0,
          error: usersError?.message,
          description: 'Listed users from auth.users table'
        },
        profilesTable: {
          success: !profilesError,
          count: profiles?.length || 0,
          error: profilesError?.message,
          description: 'Queried profiles table'
        },
        preferencesTable: {
          success: !preferencesError,
          count: preferences?.length || 0,
          error: preferencesError?.message,
          description: 'Queried user_preferences table'
        },
        sessionCheck: {
          success: !sessionError,
          hasSession: !!currentSession?.session,
          error: sessionError?.message,
          description: 'Checked for current session'
        },
        testUserCreation: {
          success: !testUserError && !!testUserResult,
          error: testUserError?.message,
          description: 'Attempted to create/delete test user'
        }
      },
      summary: {
        totalTests: 7,
        passed: 0,
        failed: 0
      }
    }
    
    // Count passed/failed tests
    Object.values(diagnosticResults.tests).forEach(test => {
      if (test.success) {
        diagnosticResults.summary.passed++
      } else {
        diagnosticResults.summary.failed++
      }
    })
    
    console.log('=== AUTH DIAGNOSTIC COMPLETE ===')
    console.log(JSON.stringify(diagnosticResults, null, 2))
    
    return NextResponse.json(diagnosticResults)
    
  } catch (error) {
    console.error('Auth diagnostic failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Auth diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
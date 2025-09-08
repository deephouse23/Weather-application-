import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('=== USER PORTAL DIAGNOSTIC ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test 1: Check database schema
    const schemaTests = []
    
    // Check profiles table structure
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, username, full_name, default_location, created_at, updated_at')
        .limit(1)
      
      schemaTests.push({
        table: 'profiles',
        success: !error,
        error: error?.message,
        columns: data ? Object.keys(data[0] || {}) : []
      })
    } catch (err) {
      schemaTests.push({
        table: 'profiles',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        columns: []
      })
    }
    
    // Check user_preferences table structure
    try {
      const { data, error } = await supabaseAdmin
        .from('user_preferences')
        .select('*')
        .limit(1)
      
      schemaTests.push({
        table: 'user_preferences',
        success: !error,
        error: error?.message,
        columns: data ? Object.keys(data[0] || {}) : []
      })
    } catch (err) {
      schemaTests.push({
        table: 'user_preferences',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        columns: []
      })
    }
    
    // Check saved_locations table structure
    try {
      const { data, error } = await supabaseAdmin
        .from('saved_locations')
        .select('*')
        .limit(1)
      
      schemaTests.push({
        table: 'saved_locations',
        success: !error,
        error: error?.message,
        columns: data ? Object.keys(data[0] || {}) : []
      })
    } catch (err) {
      schemaTests.push({
        table: 'saved_locations',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        columns: []
      })
    }
    
    // Test 2: Check RLS (Row Level Security) policies
    const rlsTests = []
    
    // Test anonymous access to profiles (should be restricted)
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .limit(1)
      
      rlsTests.push({
        table: 'profiles',
        test: 'anonymous_read',
        success: error !== null, // We WANT this to fail for security
        expectsError: true,
        error: error?.message,
        description: 'Anonymous users should not be able to read profiles'
      })
    } catch (err) {
      rlsTests.push({
        table: 'profiles',
        test: 'anonymous_read',
        success: true,
        expectsError: true,
        error: err instanceof Error ? err.message : 'Unknown error',
        description: 'Anonymous users should not be able to read profiles'
      })
    }
    
    // Test 3: Skip auth settings check (not available in this version)
    const authSettings = { skipped: true }
    
    // Test 4: Check if there are any missing indexes or constraints
    const performanceTests = []
    
    // Check if profiles table has proper constraints
    try {
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .single()
      
      performanceTests.push({
        test: 'profiles_count',
        success: !error,
        result: profiles?.count || 0,
        error: error?.message
      })
    } catch (err) {
      performanceTests.push({
        test: 'profiles_count',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
    
    // Test 5: Test actual user operations
    const userOperationTests = []
    
    // Get an existing user to test with
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const testUser = existingUsers?.users?.[0]
    
    if (testUser) {
      // Test profile read
      try {
        const { data: profile, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', testUser.id)
          .single()
        
        userOperationTests.push({
          operation: 'read_profile',
          success: !error,
          hasData: !!profile,
          error: error?.message
        })
      } catch (err) {
        userOperationTests.push({
          operation: 'read_profile',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
      
      // Test preferences read
      try {
        const { data: preferences, error } = await supabaseAdmin
          .from('user_preferences')
          .select('*')
          .eq('user_id', testUser.id)
          .single()
        
        userOperationTests.push({
          operation: 'read_preferences',
          success: !error,
          hasData: !!preferences,
          error: error?.message
        })
      } catch (err) {
        userOperationTests.push({
          operation: 'read_preferences',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }
    
    const diagnosticResults = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        environment: 'Connected successfully',
        database: 'Accessible with service role',
        existingUsers: existingUsers?.users?.length || 0
      },
      tests: {
        schemaTests,
        rlsTests,
        performanceTests,
        userOperationTests,
        authSettings
      }
    }
    
    console.log('=== PORTAL DIAGNOSTIC COMPLETE ===')
    console.log(JSON.stringify(diagnosticResults, null, 2))
    
    return NextResponse.json(diagnosticResults)
    
  } catch (error) {
    console.error('Portal diagnostic failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Portal diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
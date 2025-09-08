import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('=== SUPABASE CONNECTION DIAGNOSTIC ===')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment Variables Check:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present' : '❌ Missing')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Present' : '❌ Missing')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing required Supabase environment variables',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey,
          supabaseAnonKey: !!supabaseAnonKey
        }
      }, { status: 500 })
    }
    
    // Test with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('Testing admin connection...')
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1)
    
    console.log('Connection Test Result:', { connectionTest, connectionError })
    
    // Test 2: Skip table listing for now
    console.log('Skipping table listing test')
    
    // Test 3: Check specific tables exist
    const tablesToCheck = ['profiles', 'saved_locations', 'user_preferences']
    const tableChecks = []
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1)
        
        tableChecks.push({
          table,
          exists: !error,
          error: error?.message || null,
          count: data?.length || 0
        })
        console.log(`Table ${table}:`, { exists: !error, error: error?.message })
      } catch (err) {
        tableChecks.push({
          table,
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          count: 0
        })
      }
    }
    
    // Test 4: Test anon key client
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey!)
    const { data: anonTest, error: anonError } = await supabaseAnon.auth.getSession()
    
    console.log('Anonymous client test:', { anonTest, anonError })
    
    // Test 5: Auth configuration test
    const { data: authConfig, error: authConfigError } = await supabaseAdmin.auth.getUser()
    console.log('Auth config test:', { authConfig, authConfigError })
    
    const diagnosticResults = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey
      },
      tests: {
        basicConnection: {
          success: !connectionError,
          error: connectionError?.message,
          data: connectionTest
        },
        tableChecks,
        tableListingSkipped: true,
        anonClientTest: {
          success: !anonError,
          error: anonError?.message,
          hasSession: !!anonTest?.session
        },
        authConfiguration: {
          success: !authConfigError,
          error: authConfigError?.message
        }
      }
    }
    
    console.log('=== DIAGNOSTIC COMPLETE ===')
    console.log(JSON.stringify(diagnosticResults, null, 2))
    
    return NextResponse.json(diagnosticResults)
    
  } catch (error) {
    console.error('Diagnostic failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
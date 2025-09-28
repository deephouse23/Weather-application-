import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection and saved_locations table...')
    
    // Create admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Test 1: Check if we can connect
    const { data: testData, error: testError } = await supabase
      .from('saved_locations')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('Supabase test error:', testError)
      
      // Check if it's a table not found error
      if (testError.message.includes('relation') && testError.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'saved_locations table does not exist',
          details: testError.message,
          hint: 'Run the database migration to create the table'
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 })
    }
    
    // Test 2: Check table structure
    const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
      table_name: 'saved_locations'
    }).select('*').single()
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      tableExists: true,
      sampleQuery: testData,
      columnsInfo: columnsError ? 'Could not fetch column info' : columns
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
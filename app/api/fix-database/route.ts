import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DATABASE SCHEMA FIX ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const fixes = []
    
    // Fix 1: Check and add missing columns to profiles table
    try {
      console.log('Checking profiles table structure...')
      
      // Try to add missing columns to profiles table
      const missingColumns = [
        'full_name TEXT',
        'avatar_url TEXT', 
        'preferred_units TEXT CHECK (preferred_units IN (\'metric\', \'imperial\')) DEFAULT \'imperial\'',
        'default_location TEXT',
        'timezone TEXT DEFAULT \'UTC\'',
        'email TEXT'
      ]
      
      for (const column of missingColumns) {
        try {
          const columnName = column.split(' ')[0]
          const { error } = await supabaseAdmin.rpc('exec_sql', {
            sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ${column}`
          })
          
          fixes.push({
            operation: `add_column_${columnName}`,
            success: !error,
            error: error?.message,
            description: `Add ${columnName} column to profiles table`
          })
          
          console.log(`Add column ${columnName}:`, error ? error.message : 'Success')
        } catch (err) {
          // Try direct SQL execution instead
          const columnName = column.split(' ')[0]
          fixes.push({
            operation: `add_column_${columnName}`,
            success: false,
            error: 'RPC function not available',
            description: `Need to manually add ${columnName} column to profiles table`,
            sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ${column}`
          })
        }
      }
      
    } catch (error) {
      fixes.push({
        operation: 'check_profiles_structure',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Fix 2: Check if we can query the profiles table properly now
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, username, full_name, email, default_location')
        .limit(1)
      
      fixes.push({
        operation: 'test_profiles_query',
        success: !error,
        error: error?.message,
        description: 'Test querying profiles with required columns'
      })
    } catch (err) {
      fixes.push({
        operation: 'test_profiles_query',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
    
    // Fix 3: Check user_preferences columns
    try {
      const { data, error } = await supabaseAdmin
        .from('user_preferences')
        .select('*')
        .limit(1)
      
      const expectedColumns = ['theme', 'temperature_unit', 'wind_unit']
      const hasAllColumns = expectedColumns.every(col => 
        data?.[0] && col in data[0]
      )
      
      fixes.push({
        operation: 'check_preferences_columns',
        success: !error && hasAllColumns,
        error: error?.message,
        description: 'Check user_preferences table structure',
        columns: data?.[0] ? Object.keys(data[0]) : []
      })
    } catch (err) {
      fixes.push({
        operation: 'check_preferences_columns',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
    
    // Fix 4: Try to populate missing data for existing user
    try {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = users?.users?.[0]
      
      if (existingUser) {
        // Try to update profile with email if missing
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ email: existingUser.email })
          .eq('id', existingUser.id)
        
        fixes.push({
          operation: 'populate_profile_email',
          success: !updateError,
          error: updateError?.message,
          description: 'Populate email field in existing profile'
        })
      }
    } catch (err) {
      fixes.push({
        operation: 'populate_profile_email',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      fixes,
      summary: {
        totalFixes: fixes.length,
        successful: fixes.filter(f => f.success).length,
        failed: fixes.filter(f => !f.success).length
      },
      nextSteps: [
        'If SQL operations failed, run the provided SQL statements manually in Supabase dashboard',
        'Check if the application can now access user profiles correctly',
        'Test login and profile update functionality'
      ]
    }
    
    console.log('=== DATABASE FIX COMPLETE ===')
    console.log(JSON.stringify(result, null, 2))
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Database fix failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Database fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to attempt database schema fixes'
  })
}
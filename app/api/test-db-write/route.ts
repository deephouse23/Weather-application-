import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing database write operation...')
    
    // Get auth header from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }
    
    // Create Supabase client with user's auth
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: authError?.message 
      }, { status: 401 })
    }
    
    console.log('User authenticated:', user.id)
    
    // Test data
    const testLocation = {
      user_id: user.id,
      location_name: 'Test Location',
      city: 'Test City',
      state: 'TC',
      country: 'Test Country',
      latitude: 0.0,
      longitude: 0.0,
      is_favorite: false,
      custom_name: 'Test Custom Name',
      notes: 'This is a test location created at ' + new Date().toISOString()
    }
    
    console.log('Attempting to insert test location:', testLocation)
    
    // Try to insert
    const { data, error } = await supabase
      .from('saved_locations')
      .insert(testLocation)
      .select()
      .single()
    
    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database insert failed',
        details: error.message,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('Insert successful:', data)
    
    // Try to delete the test record
    const { error: deleteError } = await supabase
      .from('saved_locations')
      .delete()
      .eq('id', data.id)
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database write test successful',
      inserted: data,
      deleted: !deleteError
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
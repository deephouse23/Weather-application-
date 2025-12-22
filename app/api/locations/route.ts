import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received location save request:', body)

    // Validate required fields
    const { user_id, location_name, city, country, latitude, longitude, is_favorite, custom_name, notes } = body

    if (!user_id || !location_name || !city || !country || latitude === undefined || longitude === undefined) {
      console.error('Missing required fields:', { user_id, location_name, city, country, latitude, longitude })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get auth header from request
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create auth client to verify user's token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Verify user_id matches the authenticated user
    if (user.id !== user_id) {
      console.error('User ID mismatch:', { tokenUserId: user.id, payloadUserId: user_id })
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      )
    }

    console.log('User verified:', user.id)

    // Create service role client for database operations (bypasses RLS)
    // This is safe because we've already verified the user owns this request
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Prepare location data matching the actual database schema
    const locationData = {
      user_id,
      location_name: location_name,  // correct column name
      city: city || null,
      state: body.state || null,
      country,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      is_favorite: !!is_favorite,
      custom_name: custom_name || null,  // correct column name
      notes: notes || null  // notes column exists in schema
    }

    // Check if location already exists for this user
    console.log('Checking for existing location...')
    const { data: existingLocations, error: checkError } = await supabase
      .from('saved_locations')
      .select('id')
      .eq('user_id', user_id)
      .eq('latitude', locationData.latitude)
      .eq('longitude', locationData.longitude)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing location:', checkError)
    }

    if (existingLocations && existingLocations.length > 0) {
      console.log('Location already exists')
      return NextResponse.json(
        { error: 'This location is already saved', existing: true },
        { status: 409 }
      )
    }

    // Insert the location
    console.log('Attempting to save location:', locationData)
    
    const { data, error } = await supabase
      .from('saved_locations')
      .insert(locationData)
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      
      // Check for specific RLS violation
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Permission denied - RLS policy violation', details: error.message },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to save location', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    console.log('Location saved to database:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Locations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth header from request
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create auth client to verify user's token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    console.log('User verified for GET:', user.id)

    // Create service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get user's saved locations
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      )
    }

    // Transform the data to match expected format (column names are now correct)
    const transformedData = (data || []).map((location: Record<string, unknown>) => ({
      ...location,
      // Ensure backwards compatibility - prefer correct column names
      location_name: location.location_name || location.city_name,
      custom_name: location.custom_name || location.nickname,
      notes: location.notes || null,
      updated_at: location.updated_at || location.created_at
    }))

    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('Locations GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
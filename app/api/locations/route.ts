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

    // Create Supabase client with the user's token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    console.log('Creating Supabase client with auth header')

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    console.log('Supabase client created')

    // Verify the user is authenticated and matches the user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    if (user.id !== user_id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      )
    }

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
    const { data: existingLocation, error: checkError } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('user_id', user_id)
      .eq('latitude', locationData.latitude)
      .eq('longitude', locationData.longitude)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing location:', checkError)
    }

    if (existingLocation) {
      console.log('Location already exists:', existingLocation)
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
      console.error('Error details:', error.details, error.hint)
      return NextResponse.json(
        { error: 'Failed to save location', details: error.message },
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

    // Create Supabase client with the user's token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    console.log('Creating Supabase client with auth header')

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    console.log('Supabase client created')

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

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
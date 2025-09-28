import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create admin client to check schema
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
    
    // Get a sample row to see what columns exist
    const { data: sampleRow, error: sampleError } = await supabase
      .from('saved_locations')
      .select('*')
      .limit(1)
      .single()
    
    // Get table info using a raw query
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', {
        table_schema: 'public',
        table_name: 'saved_locations'
      })
      .single()
    
    let columns = null
    if (!tableError && tableInfo) {
      columns = tableInfo
    }
    
    // If the RPC doesn't exist, try another approach
    if (!columns) {
      // Try to infer from a select query
      const { data: testSelect, error: selectError } = await supabase
        .from('saved_locations')
        .select('*')
        .limit(0)
      
      if (!selectError && testSelect) {
        columns = Object.keys(testSelect[0] || {})
      }
    }
    
    return NextResponse.json({
      success: true,
      sampleRow: sampleRow || 'No rows found',
      sampleError: sampleError?.message,
      existingColumns: sampleRow ? Object.keys(sampleRow) : [],
      tableInfo: columns,
      codeExpects: [
        'id',
        'user_id',
        'location_name',
        'city',
        'state',
        'country',
        'latitude',
        'longitude',
        'is_favorite',
        'custom_name', // This is missing!
        'notes',       // This might be missing too
        'created_at',
        'updated_at'
      ]
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
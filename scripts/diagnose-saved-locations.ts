/**
 * Diagnostic script to check saved_locations table schema and RLS policies
 * Run with: npx tsx scripts/diagnose-saved-locations.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

console.log('Diagnosing saved_locations table...\n')

// Use service role key if available (bypasses RLS)
const supabase = createClient(
    supabaseUrl,
    serviceRoleKey || supabaseKey,
    { auth: { persistSession: false } }
)

async function diagnose() {
    // 1. Check table schema by querying information_schema
    console.log('1. Checking table columns...')
    const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'saved_locations' })

    if (columnsError) {
        console.log('   Could not query via RPC (expected if RPC not defined)')
        console.log('   Error:', columnsError.message)

        // Try a different approach - select empty to see column names
        console.log('\n   Trying SELECT * with limit 0...')
        const { data, error } = await supabase
            .from('saved_locations')
            .select('*')
            .limit(0)

        if (error) {
            console.log('   Error:', error.message)
            console.log('   Code:', error.code)
            console.log('   Details:', error.details)
            console.log('   Hint:', error.hint)
        } else {
            console.log('   Query succeeded (empty result expected)')
        }
    } else {
        console.log('   Columns:', columns)
    }

    // 2. Try to understand what columns exist by attempting inserts with test data
    console.log('\n2. Testing INSERT with expected schema...')

    const testData = {
        user_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
        location_name: 'Test Location',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country',
        latitude: 37.7749,
        longitude: -122.4194,
        is_favorite: false,
        custom_name: null,
        notes: null
    }

    console.log('   Attempting insert with columns:', Object.keys(testData).join(', '))

    const { error: insertError } = await supabase
        .from('saved_locations')
        .insert(testData)
        .select()
        .single()

    if (insertError) {
        console.log('   Insert error (expected - testing schema compatibility):')
        console.log('   Message:', insertError.message)
        console.log('   Code:', insertError.code)
        console.log('   Details:', insertError.details)
        console.log('   Hint:', insertError.hint)

        // Parse error to understand missing/wrong columns
        if (insertError.message.includes('violates foreign key constraint')) {
            console.log('\n   ** Schema appears correct - error is due to fake user_id')
        } else if (insertError.message.includes('column')) {
            console.log('\n   ** Column mismatch detected!')
        } else if (insertError.code === '42501') {
            console.log('\n   ** RLS policy blocking insert (expected with anon key)')
        }
    } else {
        console.log('   Insert succeeded unexpectedly')
    }

    // 3. Check what happens with old column names
    console.log('\n3. Testing with OLD column names (city_name, nickname)...')

    const oldData = {
        user_id: '00000000-0000-0000-0000-000000000000',
        city_name: 'Test Location',  // old column name
        city: 'Test City',
        country: 'Test Country',
        latitude: 37.7749,
        longitude: -122.4194,
        is_favorite: false,
        nickname: 'Test Nickname'  // old column name
    }

    const { error: oldInsertError } = await supabase
        .from('saved_locations')
        .insert(oldData)
        .select()

    if (oldInsertError) {
        console.log('   Error with old column names:')
        console.log('   Message:', oldInsertError.message)

        if (oldInsertError.message.includes('city_name') || oldInsertError.message.includes('nickname')) {
            console.log('\n   ** OLD columns do NOT exist - schema has been updated')
        } else if (oldInsertError.message.includes('violates foreign key')) {
            console.log('\n   ** OLD columns EXIST - schema NOT updated!')
        }
    }

    // 4. Query existing data to see actual structure
    console.log('\n4. Checking for any existing data...')
    const { data: existingData, error: existingError, count } = await supabase
        .from('saved_locations')
        .select('*', { count: 'exact' })
        .limit(1)

    if (existingError) {
        console.log('   Error:', existingError.message)
    } else {
        console.log('   Total locations in table:', count)
        if (existingData && existingData.length > 0) {
            console.log('   Sample record columns:', Object.keys(existingData[0]).join(', '))
            console.log('   Sample record:', JSON.stringify(existingData[0], null, 2))
        }
    }

    console.log('\n--- Diagnosis Complete ---')
}

diagnose().catch(console.error)

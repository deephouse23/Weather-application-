/**
 * Comprehensive diagnostic for profile and location save issues
 * Run with: npx tsx scripts/diagnose-all-tables.ts
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

console.log('=== Comprehensive Supabase Diagnostic ===\n')

const supabase = createClient(
    supabaseUrl,
    serviceRoleKey || supabaseKey,
    { auth: { persistSession: false } }
)

async function diagnose() {
    // 1. Check profiles table
    console.log('1. PROFILES TABLE')
    console.log('   Expected columns: id, email, username, full_name, avatar_url, preferred_units, default_location, timezone, created_at, updated_at')

    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

    if (profilesError) {
        console.log('   ERROR:', profilesError.message)
        console.log('   Code:', profilesError.code)
    } else if (profiles && profiles.length > 0) {
        console.log('   Actual columns:', Object.keys(profiles[0]).join(', '))
        console.log('   Sample:', JSON.stringify(profiles[0], null, 2))
    } else {
        console.log('   Table is empty - trying test insert...')

        // Try test insert to see schema
        const { error: testError } = await supabase
            .from('profiles')
            .insert({
                id: '00000000-0000-0000-0000-000000000000',
                email: 'test@test.com',
                username: 'test',
                full_name: 'Test User',
                default_location: 'Test City'
            })

        if (testError) {
            console.log('   Insert test error:', testError.message)
            if (testError.message.includes('column')) {
                console.log('   ** SCHEMA MISMATCH DETECTED **')
            }
        }
    }

    // 2. Check saved_locations table
    console.log('\n2. SAVED_LOCATIONS TABLE')
    console.log('   Expected: id, user_id, location_name, city, state, country, latitude, longitude, is_favorite, custom_name, notes, created_at, updated_at')

    const { data: locations, error: locationsError } = await supabase
        .from('saved_locations')
        .select('*')
        .limit(1)

    if (locationsError) {
        console.log('   ERROR:', locationsError.message)
    } else if (locations && locations.length > 0) {
        console.log('   Actual columns:', Object.keys(locations[0]).join(', '))
    } else {
        console.log('   Table is empty')
    }

    // 3. Check user_preferences table
    console.log('\n3. USER_PREFERENCES TABLE')
    console.log('   Expected: id, user_id, theme, temperature_unit, wind_unit, pressure_unit, auto_location, etc.')

    const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1)

    if (prefsError) {
        console.log('   ERROR:', prefsError.message)
    } else if (prefs && prefs.length > 0) {
        console.log('   Actual columns:', Object.keys(prefs[0]).join(', '))
    } else {
        console.log('   Table is empty')
    }

    // 4. Check RLS policies
    console.log('\n4. ROW LEVEL SECURITY STATUS')
    console.log('   (If using anon key and RLS is enabled, empty results are expected)')
    console.log('   Using:', serviceRoleKey ? 'SERVICE_ROLE_KEY (bypasses RLS)' : 'ANON_KEY (respects RLS)')

    // 5. Check if there are any auth users
    console.log('\n5. AUTH USERS')
    if (serviceRoleKey) {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
        if (authError) {
            console.log('   Error listing users:', authError.message)
        } else {
            console.log('   Total auth users:', authUsers?.users?.length || 0)
            if (authUsers?.users && authUsers.users.length > 0) {
                console.log('   First user ID:', authUsers.users[0].id)
                console.log('   First user email:', authUsers.users[0].email)
            }
        }
    } else {
        console.log('   (Cannot list users without service role key)')
    }

    // 6. Test profile create/update trigger
    console.log('\n6. PROFILE TRIGGER CHECK')
    console.log('   The handle_new_user trigger should auto-create profiles when users sign up')
    console.log('   If profiles table is empty but auth users exist, the trigger may not be set up')

    console.log('\n=== Diagnostic Complete ===')
}

diagnose().catch(console.error)

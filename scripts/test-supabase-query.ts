/**
 * Test script to query Supabase tables
 * Run with: npx ts-node scripts/test-supabase-query.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'MISSING')
    console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'set' : 'MISSING')
    process.exit(1)
}

console.log('Connecting to Supabase...')
console.log('  URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQueries() {
    console.log('\n--- Testing Supabase Queries ---\n')

    // Test 1: Check auth connection
    console.log('1. Testing auth connection...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
        console.error('   Auth error:', authError.message)
    } else {
        console.log('   Auth connection OK')
        console.log('   Session:', authData.session ? 'Active' : 'None')
    }

    // Test 2: Query profiles table
    console.log('\n2. Querying profiles table...')
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

    if (profilesError) {
        console.error('   Profiles error:', profilesError.message)
        console.error('   Code:', profilesError.code)
    } else {
        console.log('   Found', profiles?.length || 0, 'profiles')
        if (profiles && profiles.length > 0) {
            console.log('   Sample:', JSON.stringify(profiles[0], null, 2).substring(0, 200))
        }
    }

    // Test 3: Query user_preferences table
    console.log('\n3. Querying user_preferences table...')
    const { data: preferences, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(5)

    if (prefsError) {
        console.error('   Preferences error:', prefsError.message)
        console.error('   Code:', prefsError.code)
    } else {
        console.log('   Found', preferences?.length || 0, 'user preferences')
    }

    // Test 4: Query saved_locations table
    console.log('\n4. Querying saved_locations table...')
    const { data: locations, error: locationsError } = await supabase
        .from('saved_locations')
        .select('*')
        .limit(5)

    if (locationsError) {
        console.error('   Locations error:', locationsError.message)
        console.error('   Code:', locationsError.code)
    } else {
        console.log('   Found', locations?.length || 0, 'saved locations')
        if (locations && locations.length > 0) {
            console.log('   Sample:', JSON.stringify(locations[0], null, 2).substring(0, 200))
        }
    }

    // Test 5: Query games table
    console.log('\n5. Querying games table...')
    const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .limit(5)

    if (gamesError) {
        console.error('   Games error:', gamesError.message)
        console.error('   Code:', gamesError.code)
    } else {
        console.log('   Found', games?.length || 0, 'games')
    }

    // Test 6: Query game_scores table
    console.log('\n6. Querying game_scores table...')
    const { data: scores, error: scoresError } = await supabase
        .from('game_scores')
        .select('*')
        .limit(5)

    if (scoresError) {
        console.error('   Scores error:', scoresError.message)
        console.error('   Code:', scoresError.code)
    } else {
        console.log('   Found', scores?.length || 0, 'game scores')
    }

    console.log('\n--- Query Tests Complete ---\n')
}

testQueries().catch(console.error)

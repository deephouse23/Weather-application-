/**
 * Test script for profile save functionality
 * Run with: npm run test:profile
 * 
 * This script tests the profile update functionality to verify:
 * - Database update succeeds
 * - Error handling works correctly
 * - Data is properly returned
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { updateProfile, getProfile } from '../lib/supabase/database'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Initialize Supabase client for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

async function testProfileUpdate(): Promise<TestResult[]> {
  const results: TestResult[] = []

  try {
    // Test 1: Get a test user (or create one for testing)
    console.log('\n📋 Test 1: Fetching test user...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError || !users?.users || users.users.length === 0) {
      results.push({
        name: 'Get test user',
        passed: false,
        error: usersError?.message || 'No users found for testing'
      })
      return results
    }

    const testUserId = users.users[0].id
    console.log(`✅ Found test user: ${testUserId}`)

    // Test 2: Get current profile
    console.log('\n📋 Test 2: Fetching current profile...')
    const currentProfile = await getProfile(testUserId)
    if (!currentProfile) {
      results.push({
        name: 'Get current profile',
        passed: false,
        error: 'Failed to fetch current profile'
      })
      return results
    }
    console.log('✅ Current profile:', currentProfile)
    results.push({
      name: 'Get current profile',
      passed: true,
      details: currentProfile
    })

    // Test 3: Update profile with test data
    console.log('\n📋 Test 3: Updating profile...')
    const testUpdates = {
      username: currentProfile.username || 'test_user_' + Date.now(),
      full_name: 'Test User',
      default_location: 'Test Location'
    }
    
    const updatedProfile = await updateProfile(testUserId, testUpdates)
    
    if (!updatedProfile) {
      results.push({
        name: 'Update profile',
        passed: false,
        error: 'updateProfile returned null - check database schema and RLS policies'
      })
    } else {
      console.log('✅ Profile updated:', updatedProfile)
      results.push({
        name: 'Update profile',
        passed: true,
        details: updatedProfile
      })

      // Verify the update persisted
      const verifyProfile = await getProfile(testUserId)
      if (verifyProfile?.username === testUpdates.username) {
        results.push({
          name: 'Verify update persisted',
          passed: true,
          details: verifyProfile
        })
      } else {
        results.push({
          name: 'Verify update persisted',
          passed: false,
          error: 'Update did not persist correctly'
        })
      }
    }

    // Test 4: Test error handling with invalid user ID
    console.log('\n📋 Test 4: Testing error handling...')
    const invalidUpdate = await updateProfile('00000000-0000-0000-0000-000000000000', {
      username: 'should_fail'
    })
    
    if (invalidUpdate === null) {
      results.push({
        name: 'Error handling (invalid user ID)',
        passed: true,
        details: 'Correctly returned null for invalid user'
      })
    } else {
      results.push({
        name: 'Error handling (invalid user ID)',
        passed: false,
        error: 'Should have returned null for invalid user ID'
      })
    }

    // Test 5: Test with null values
    console.log('\n📋 Test 5: Testing null value handling...')
    const nullUpdate = await updateProfile(testUserId, {
      username: null,
      full_name: null,
      default_location: null
    })
    
    if (nullUpdate !== null) {
      results.push({
        name: 'Null value handling',
        passed: true,
        details: 'Successfully handled null values'
      })
    } else {
      results.push({
        name: 'Null value handling',
        passed: false,
        error: 'Failed to handle null values'
      })
    }

  } catch (error) {
    results.push({
      name: 'Test execution',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  return results
}

async function runTests() {
  console.log('🧪 Starting Profile Save Tests\n')
  console.log('=' .repeat(50))
  
  const results = await testProfileUpdate()
  
  console.log('\n' + '='.repeat(50))
  console.log('\n📊 Test Results:\n')
  
  let passed = 0
  let failed = 0
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${index + 1}. ${result.name}: ${status}`)
    
    if (result.passed) {
      passed++
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details).substring(0, 100)}...`)
      }
    } else {
      failed++
      console.log(`   Error: ${result.error}`)
    }
  })
  
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed\n`)
  
  if (failed > 0) {
    console.log('⚠️  Some tests failed. Check the errors above.')
    process.exit(1)
  } else {
    console.log('🎉 All tests passed!')
    process.exit(0)
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})


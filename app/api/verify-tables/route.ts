import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('=== TABLE VERIFICATION & CREATION ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const verificationResults = []
    
    // Check profiles table
    try {
      console.log('Checking profiles table...')
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log('Profiles table error:', error.message)
        verificationResults.push({
          table: 'profiles',
          exists: false,
          error: error.message,
          needsCreation: true
        })
      } else {
        // Check column structure
        const columns = data?.[0] ? Object.keys(data[0]) : []
        const requiredColumns = ['id', 'email', 'username', 'full_name', 'avatar_url', 'created_at', 'updated_at']
        const missingColumns = requiredColumns.filter(col => !columns.includes(col))
        
        verificationResults.push({
          table: 'profiles',
          exists: true,
          columns,
          missingColumns,
          needsColumnUpdates: missingColumns.length > 0
        })
      }
    } catch (err) {
      verificationResults.push({
        table: 'profiles',
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        needsCreation: true
      })
    }
    
    // Check user_preferences table
    try {
      console.log('Checking user_preferences table...')
      const { data, error } = await supabaseAdmin
        .from('user_preferences')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log('User preferences table error:', error.message)
        verificationResults.push({
          table: 'user_preferences',
          exists: false,
          error: error.message,
          needsCreation: true
        })
      } else {
        const columns = data?.[0] ? Object.keys(data[0]) : []
        const requiredColumns = ['id', 'user_id', 'theme', 'temperature_unit', 'notifications_enabled', 'created_at', 'updated_at']
        const missingColumns = requiredColumns.filter(col => !columns.includes(col))
        
        verificationResults.push({
          table: 'user_preferences',
          exists: true,
          columns,
          missingColumns,
          needsColumnUpdates: missingColumns.length > 0
        })
      }
    } catch (err) {
      verificationResults.push({
        table: 'user_preferences',
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        needsCreation: true
      })
    }
    
    // Check saved_locations table
    try {
      console.log('Checking saved_locations table...')
      const { data, error } = await supabaseAdmin
        .from('saved_locations')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log('Saved locations table error:', error.message)
        verificationResults.push({
          table: 'saved_locations',
          exists: false,
          error: error.message,
          needsCreation: true
        })
      } else {
        const columns = data?.[0] ? Object.keys(data[0]) : []
        const requiredColumns = ['id', 'user_id', 'city_name', 'country', 'latitude', 'longitude', 'is_favorite', 'created_at']
        const missingColumns = requiredColumns.filter(col => !columns.includes(col))
        
        verificationResults.push({
          table: 'saved_locations',
          exists: true,
          columns,
          missingColumns,
          needsColumnUpdates: missingColumns.length > 0
        })
      }
    } catch (err) {
      verificationResults.push({
        table: 'saved_locations',
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        needsCreation: true
      })
    }
    
    // Generate SQL statements for missing tables/columns
    const sqlStatements = []
    
    verificationResults.forEach(result => {
      if (result.table === 'profiles') {
        if (result.needsCreation) {
          sqlStatements.push({
            type: 'create_table',
            table: 'profiles',
            sql: `-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);`
          })
        } else if (result.missingColumns && result.missingColumns.length > 0) {
          result.missingColumns.forEach((column: string) => {
            let columnDef = ''
            switch (column) {
              case 'email':
                columnDef = 'email TEXT'
                break
              case 'username':
                columnDef = 'username TEXT'
                break
              case 'full_name':
                columnDef = 'full_name TEXT'
                break
              case 'avatar_url':
                columnDef = 'avatar_url TEXT'
                break
              case 'created_at':
                columnDef = 'created_at TIMESTAMP DEFAULT NOW()'
                break
              case 'updated_at':
                columnDef = 'updated_at TIMESTAMP DEFAULT NOW()'
                break
            }
            if (columnDef) {
              sqlStatements.push({
                type: 'add_column',
                table: 'profiles',
                column,
                sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${columnDef};`
              })
            }
          })
        }
      }
      
      if (result.table === 'user_preferences') {
        if (result.needsCreation) {
          sqlStatements.push({
            type: 'create_table',
            table: 'user_preferences',
            sql: `-- User preferences
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'default',
  temperature_unit TEXT DEFAULT 'fahrenheit',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);`
          })
        } else if (result.missingColumns && result.missingColumns.length > 0) {
          result.missingColumns.forEach((column: string) => {
            let columnDef = ''
            switch (column) {
              case 'theme':
                columnDef = "theme TEXT DEFAULT 'default'"
                break
              case 'temperature_unit':
                columnDef = "temperature_unit TEXT DEFAULT 'fahrenheit'"
                break
              case 'notifications_enabled':
                columnDef = 'notifications_enabled BOOLEAN DEFAULT true'
                break
              case 'created_at':
                columnDef = 'created_at TIMESTAMP DEFAULT NOW()'
                break
              case 'updated_at':
                columnDef = 'updated_at TIMESTAMP DEFAULT NOW()'
                break
            }
            if (columnDef) {
              sqlStatements.push({
                type: 'add_column',
                table: 'user_preferences',
                column,
                sql: `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS ${columnDef};`
              })
            }
          })
        }
      }
      
      if (result.table === 'saved_locations') {
        if (result.needsCreation) {
          sqlStatements.push({
            type: 'create_table',
            table: 'saved_locations',
            sql: `-- Saved locations
CREATE TABLE saved_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  country TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, city_name)
);`
          })
        } else if (result.missingColumns && result.missingColumns.length > 0) {
          result.missingColumns.forEach((column: string) => {
            let columnDef = ''
            switch (column) {
              case 'city_name':
                columnDef = 'city_name TEXT NOT NULL'
                break
              case 'country':
                columnDef = 'country TEXT'
                break
              case 'latitude':
                columnDef = 'latitude DECIMAL'
                break
              case 'longitude':
                columnDef = 'longitude DECIMAL'
                break
              case 'is_favorite':
                columnDef = 'is_favorite BOOLEAN DEFAULT false'
                break
              case 'created_at':
                columnDef = 'created_at TIMESTAMP DEFAULT NOW()'
                break
            }
            if (columnDef) {
              sqlStatements.push({
                type: 'add_column',
                table: 'saved_locations',
                column,
                sql: `ALTER TABLE saved_locations ADD COLUMN IF NOT EXISTS ${columnDef};`
              })
            }
          })
        }
      }
    })
    
    // Add RLS policies if tables need to be created
    const needsRLS = verificationResults.some(r => r.needsCreation)
    if (needsRLS) {
      sqlStatements.push({
        type: 'enable_rls',
        sql: `-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;`
      })
      
      sqlStatements.push({
        type: 'create_policies',
        sql: `-- Create policies
CREATE POLICY 'Users can view own profile' ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY 'Users can update own profile' ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY 'Users can view own preferences' ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY 'Users can update own preferences' ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY 'Users can manage own locations' ON saved_locations
  FOR ALL USING (auth.uid() = user_id);`
      })
    }
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      verification: verificationResults,
      summary: {
        tablesExist: verificationResults.filter(r => r.exists).length,
        tablesNeedCreation: verificationResults.filter(r => r.needsCreation).length,
        tablesNeedColumnUpdates: verificationResults.filter(r => r.needsColumnUpdates).length,
        totalSqlStatements: sqlStatements.length
      },
      sqlStatements,
      instructions: [
        '1. Copy the SQL statements below',
        '2. Go to your Supabase dashboard > SQL Editor',
        '3. Paste and run each SQL statement',
        '4. Verify tables are created by refreshing the Table Editor'
      ]
    }
    
    console.log('=== TABLE VERIFICATION COMPLETE ===')
    console.log(JSON.stringify(result, null, 2))
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Table verification failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Table verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
# Supabase Integration for 16-Bit Weather

## Overview
This directory contains the complete Supabase integration for user authentication and data management in the 16-Bit Weather application.

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Environment Variables
Add these to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup
1. In your Supabase dashboard, go to SQL Editor
2. Run the contents of `schema.sql` to create all tables and policies
3. Verify the tables are created: `profiles`, `saved_locations`, `user_preferences`

### 4. Authentication Setup
1. In Supabase dashboard, go to Authentication > Settings
2. Configure allowed redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
3. Enable email confirmation if desired
4. Configure OAuth providers (Google, GitHub, Discord) if needed

## Database Schema

### Tables Created:

#### `profiles`
- User profile information
- Auto-created when user signs up
- Stores username, full_name, preferred_units, default_location, etc.

#### `saved_locations` 
- User's saved weather locations
- Supports favorites and custom names
- Lat/lng coordinates for weather API calls

#### `user_preferences`
- User settings and preferences
- Theme, units, notifications, etc.
- Auto-created with defaults when user signs up

## File Structure

```
lib/supabase/
├── client.ts          # Client-side Supabase client
├── server.ts          # Server-side Supabase client  
├── types.ts           # TypeScript database types
├── auth.ts            # Authentication functions
├── database.ts        # Database operations (CRUD)
├── hooks.ts           # React hooks for auth/data
├── middleware.ts      # Next.js middleware for route protection
├── schema.sql         # Database schema and RLS policies
└── README.md          # This file
```

## Usage Examples

### Authentication
```typescript
import { useAuth, signIn, signUp, signOut } from '@/lib/supabase'

// In a component
const { user, loading, isAuthenticated } = useAuth()

// Sign in
await signIn({ email: 'user@example.com', password: 'password' })

// Sign up
await signUp({ 
  email: 'user@example.com', 
  password: 'password',
  username: 'username',
  full_name: 'Full Name' 
})
```

### Saved Locations
```typescript
import { useSavedLocations, saveLocation, toggleLocationFavorite } from '@/lib/supabase'

// Get user's saved locations
const { locations, loading } = useSavedLocations()

// Save a new location
await saveLocation({
  user_id: user.id,
  location_name: 'San Francisco, CA',
  city: 'San Francisco',
  state: 'CA',
  country: 'US',
  latitude: 37.7749,
  longitude: -122.4194
})
```

### User Preferences  
```typescript
import { useUserPreferences, updateUserPreferences } from '@/lib/supabase'

// Get user preferences
const { preferences } = useUserPreferences()

// Update theme
await updateUserPreferences(user.id, { theme: 'miami' })
```

## Security Features
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic profile creation on signup
- JWT-based authentication
- Secure server-side operations

## Integration with Weather App
- Sync saved locations with existing weather functionality
- User preferences override default app settings
- Profile data integrates with existing location/theme systems
- Backward compatible with existing localStorage functionality
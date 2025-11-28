# 🔐 Login Fix Guide

## Problem Diagnosed ✅

**Login is not working because Supabase credentials are missing.**

Your app is currently running with a **placeholder Supabase client** (see `lib/supabase/client.ts` line 17), which means authentication features are disabled.

---

## Fix Steps

### Step 1: Create `.env.local` File

1. **Copy the template:**
   ```bash
   cp env.example .env.local
   ```

2. **Or create manually:**
   Create a new file named `.env.local` in the root directory.

---

### Step 2: Get Your Supabase Credentials

You need two values from your Supabase project:

1. **Go to:** https://app.supabase.com
2. **Select your project** (or create a new one)
3. **Navigate to:** Settings → API
4. **Copy these values:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Step 3: Add to `.env.local`

```bash
# REQUIRED FOR LOGIN
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# REQUIRED FOR WEATHER
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# OPTIONAL
NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here
```

---

### Step 4: Configure OAuth Providers (Optional)

If you want Google/GitHub login to work:

1. **Go to:** Supabase Dashboard → Authentication → Providers
2. **Enable Google:**
   - Client ID from Google Cloud Console
   - Client Secret
3. **Enable GitHub:**
   - Client ID from GitHub OAuth Apps
   - Client Secret
4. **Add redirect URLs:**
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

---

### Step 5: Set Up Database Tables

Your Supabase project needs these tables (they should already exist based on the code):

**`profiles` table:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**`user_preferences` table:**
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'dark',
  temperature_unit TEXT DEFAULT 'celsius',
  wind_speed_unit TEXT DEFAULT 'kmh',
  pressure_unit TEXT DEFAULT 'hpa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Step 6: Restart the Dev Server

After adding credentials:

```bash
# Stop the current dev server (Ctrl+C if running)
npm run dev
```

---

## Verification

Once configured, you should see in the browser console:

```
[Supabase] Client initialized { supabaseUrl: 'https://your-project.supabase.co' }
```

Instead of:

```
[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Using placeholder client.
```

---

## Testing Login

1. Go to: http://localhost:3000/auth/login
2. Try signing up with a test email
3. Check Supabase Dashboard → Authentication → Users to see if the user was created
4. Check your email for the confirmation link (if email confirmation is enabled)

---

## Troubleshooting

### Issue: "Invalid API key" or "Failed to fetch"
- **Solution:** Double-check your Supabase URL and anon key are correct
- Verify no extra spaces or quotes in `.env.local`

### Issue: OAuth providers not working
- **Solution:** Configure redirect URLs in Supabase Dashboard
- Enable the provider in Supabase Dashboard → Authentication → Providers

### Issue: User created but can't see profile data
- **Solution:** Check if database tables exist
- Verify Row Level Security (RLS) policies allow read access
- Check browser console for errors

---

## Files Modified in This Fix

- ✅ Created: `LOGIN_FIX_GUIDE.md` (this file)
- 📝 Need to create: `.env.local` (you must do this manually)

---

## Next Steps

1. Create `.env.local` with your credentials
2. Restart the dev server
3. Test login functionality
4. If login works, mark this todo as completed
5. Move on to fixing the deprecated weather radar


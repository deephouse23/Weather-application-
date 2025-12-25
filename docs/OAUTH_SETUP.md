# OAuth Setup Guide for 16-Bit Weather

This guide explains how to properly configure OAuth providers (Google, GitHub) with branding for your 16-Bit Weather application.

---

## Issue: OAuth Consent Screen Shows Raw Keys/Strings

When users authenticate with Google OAuth, they may see:
- Raw Supabase project URLs (e.g., `cckcvyccjntadoohjntr.supabase.co`)
- Unbranded consent screens
- Technical-looking strings that appear suspicious

**Solution:** Configure proper branding in Google Cloud Console and Supabase.

---

## Google OAuth Configuration

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **OAuth consent screen**

### Step 2: Configure OAuth Consent Screen

#### Basic Information

- **App name**: `16-Bit Weather`
- **User support email**: Your support email (e.g., `support@16bitweather.co`)
- **App logo**: Upload the 16-Bit Weather logo
  - Use the logo at `/public/logo-16bit-weather.svg` or `/public/apple-touch-icon.png`
  - Logo requirements: PNG/JPG, 120x120px minimum, square format
  - **Important:** This logo will be shown to users during OAuth consent

#### App Domain Configuration

- **Application home page**: `https://www.16bitweather.co`
- **Application privacy policy link**: `https://www.16bitweather.co/privacy`
- **Application terms of service link**: `https://www.16bitweather.co/terms`

#### Authorized Domains

Add these domains:
- `16bitweather.co`
- `supabase.co` (required for Supabase OAuth callback)
- Your custom domain if using one

#### Developer Contact Information

- Add your developer email address
- This email receives notifications about changes to your OAuth app

### Step 3: Configure OAuth Scopes

**Recommended Scopes:**
- `openid` (required)
- `userinfo.email` (to get user's email)
- `userinfo.profile` (to get user's name and profile picture)

**Note:** Adding additional scopes may trigger Google's verification process, which can take several business days.

### Step 4: Add Test Users (Development)

If your app is in testing mode:
1. Add test user emails in the "Test users" section
2. Only these users can authenticate until the app is published

### Step 5: Publishing Status

Choose the appropriate status:
- **Testing**: Only test users can authenticate
- **In Production**: Anyone with a Google account can authenticate
  - May require Google verification if sensitive scopes are used
  - Verification process: 1-6 weeks typically

---

## Supabase Configuration

### Step 1: Get Google OAuth Credentials

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `16-Bit Weather - Supabase Auth`

#### Authorized JavaScript Origins

Add these origins:
```
https://www.16bitweather.co
http://localhost:3000
```

#### Authorized Redirect URIs

Add your Supabase callback URL:
```
https://cckcvyccjntadoohjntr.supabase.co/auth/v1/callback
```

5. Click **Create** and save your **Client ID** and **Client Secret**

### Step 2: Configure Supabase Auth Providers

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `cckcvyccjntadoohjntr`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to configure

#### Google Provider Settings

- **Enable Google provider**: ✓ Enabled
- **Client ID**: Paste your Google OAuth Client ID
- **Client Secret**: Paste your Google OAuth Client Secret
- **Redirect URL**: Should auto-populate as:
  ```
  https://cckcvyccjntadoohjntr.supabase.co/auth/v1/callback
  ```

5. Click **Save**

### Step 3: Configure Supabase Site URL

1. In Supabase Dashboard, go to **Settings** → **Authentication**
2. Set **Site URL** to: `https://www.16bitweather.co`
3. Add **Redirect URLs**:
   ```
   https://www.16bitweather.co/auth/callback
   http://localhost:3000/auth/callback
   ```

---

## GitHub OAuth Configuration (Optional)

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: `16-Bit Weather`
   - **Homepage URL**: `https://www.16bitweather.co`
   - **Authorization callback URL**: `https://cckcvyccjntadoohjntr.supabase.co/auth/v1/callback`
   - **Application description**: "Retro terminal weather forecast application"
   - **Application logo**: Upload your logo

### Step 2: Configure in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **GitHub** and configure:
   - **Client ID**: From GitHub OAuth app
   - **Client Secret**: From GitHub OAuth app

---

## Custom Domain Setup (Advanced)

To replace the default Supabase URL with your own domain:

### Option 1: Use Supabase Custom Domain (Pro Plan)

1. In Supabase Dashboard → **Settings** → **Custom Domains**
2. Add your custom domain: `auth.16bitweather.co`
3. Update DNS records as instructed
4. Update OAuth redirect URLs to use custom domain

### Option 2: Use Proxy/API Gateway

Set up a proxy that forwards requests to Supabase:
- `https://auth.16bitweather.co` → `https://cckcvyccjntadoohjntr.supabase.co`
- This improves trust but adds complexity

---

## Branding Best Practices

### 1. Logo Requirements

- **Format**: PNG or JPG (SVG not supported by Google)
- **Size**: 120x120px minimum, square aspect ratio
- **Background**: Use transparent or branded background
- **Content**: Should clearly represent your brand

### 2. Consent Screen Copy

Keep descriptions clear and concise:
- ✅ "16-Bit Weather - Real-time weather forecasts with retro terminal aesthetics"
- ❌ "Weather app that uses OAuth for authentication"

### 3. Domain Verification

Verify your domain to show users you're legitimate:
1. Add `<meta>` tag to your website
2. Verify in Google Search Console
3. Link verified domain in OAuth consent screen

---

## Testing OAuth Flow

### Development Testing

1. Start your local dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/auth/login`

3. Click "Continue with Google"

4. Check the consent screen shows:
   - ✅ Your app name "16-Bit Weather"
   - ✅ Your logo
   - ✅ Your domain `16bitweather.co`
   - ❌ Not showing raw Supabase URLs

### Production Testing

1. Test on: `https://www.16bitweather.co/auth/login`
2. Use an account that's not a test user
3. Verify OAuth flow completes and redirects properly

---

## Troubleshooting

### Issue: "OAuth consent screen shows Supabase URL"

**Solution:**
- Ensure app logo is uploaded in Google Cloud Console
- Verify app name is set to "16-Bit Weather"
- Check that authorized domains include your domain

### Issue: "Redirect URI mismatch"

**Solution:**
- Ensure Supabase callback URL is added to Google OAuth allowed redirects
- Format: `https://[PROJECT_ID].supabase.co/auth/v1/callback`
- Check for trailing slashes (should not have them)

### Issue: "Access blocked: This app is not verified"

**Solution:**
- Add user email as a test user in Google Cloud Console
- Or submit app for verification (production only)

### Issue: "User stuck after authentication"

**Solution:**
- Check Supabase Site URL matches your domain
- Ensure redirect URLs include `/auth/callback`
- Check browser console for errors

---

## Security Checklist

- [ ] OAuth credentials stored in environment variables (never in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Supabase RLS (Row Level Security) enabled
- [ ] Only necessary OAuth scopes requested
- [ ] Redirect URLs restricted to your domains
- [ ] HTTPS enabled on production domain
- [ ] OAuth client secrets kept confidential

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google Brand Guidelines](https://developers.google.com/identity/branding-guidelines)

---

**Last Updated:** January 2025
**Maintained By:** 16-Bit Weather Development Team

# Premium Themes Implementation Guide

This document describes the premium themes feature implementation for the 16-Bit Weather Platform.

## Overview

The premium themes system provides 4 additional retro-gaming inspired themes exclusively for registered users, while keeping 3 free themes available to all users.

## Theme Categories

### Free Themes (Available to All Users)
1. **Dark Mode** - Classic terminal interface with cyan accents
2. **Miami Vice** - Neon 80s synthwave aesthetic
3. **TRON Legacy** - Cyberpunk grid world theme

### Premium Themes (Registered Users Only)
1. **Atari 2600** - Classic Atari console aesthetic with VT323 font
2. **Terminal Green** - Old-school monochrome terminal with Fira Code font
3. **8-Bit Classic** - NES-inspired theme with Press Start 2P font
4. **16-Bit SNES** - Super Nintendo era theme with Courier New font

## Architecture

### Core Files

#### Theme Configuration (`lib/theme-config.ts`)
- Defines all theme properties including colors, fonts, and premium status
- Exports utility functions for theme access control
- Contains the master `THEME_DEFINITIONS` object

#### Theme Service (`lib/services/theme-service.ts`)
- Handles theme access control based on authentication status
- Manages theme persistence to both localStorage and Supabase
- Provides validation and fallback logic

#### Enhanced Theme Provider (`components/enhanced-theme-provider.tsx`)
- React context provider with premium theme support
- Integrates with Supabase authentication
- Handles theme loading and persistence

#### Premium Theme Selector (`components/dashboard/premium-theme-selector.tsx`)
- Enhanced theme selector with authentication UI
- Shows premium indicators and unlock prompts
- Integrates with theme service for access control

### Database Schema

#### User Preferences Table
```sql
-- Located in lib/supabase/user-preferences-schema.sql
CREATE TABLE user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_name VARCHAR(50) NOT NULL DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_preference UNIQUE (user_id),
    CONSTRAINT valid_theme_name CHECK (theme_name IN (...))
);
```

## Implementation Details

### Theme Access Control

```typescript
// Check if user can access a theme
ThemeService.canAccessTheme(theme: ThemeType, isAuthenticated: boolean)

// Get valid theme with fallback
ThemeService.getValidTheme(requestedTheme: ThemeType, isAuthenticated: boolean)

// Check if theme is premium
isThemePremium(theme: ThemeType)
```

### Theme Persistence

1. **For All Users**: Themes are saved to localStorage
2. **For Authenticated Users**: Themes are additionally saved to Supabase
3. **Fallback Logic**: If database fails, localStorage is used as backup
4. **Sync on Login**: Database theme overrides localStorage on authentication

### Security Features

- Row Level Security (RLS) on user_preferences table
- Theme validation at both client and database level
- Authentication-based access control
- Graceful degradation when premium themes are accessed by non-authenticated users

## Usage Guide

### For Developers

#### Using the Enhanced Theme Provider
```tsx
import { ThemeProvider } from '@/components/enhanced-theme-provider'
import { useTheme } from '@/components/enhanced-theme-provider'

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  )
}

function YourComponent() {
  const { 
    theme, 
    setTheme, 
    canAccessTheme, 
    isAuthenticated,
    premiumThemes 
  } = useTheme()
  
  return (
    <div data-theme={theme}>
      {/* Your themed content */}
    </div>
  )
}
```

#### Adding the Premium Theme Selector
```tsx
import PremiumThemeSelector from '@/components/dashboard/premium-theme-selector'

function Dashboard() {
  return (
    <div>
      <PremiumThemeSelector />
    </div>
  )
}
```

#### Using Theme Upgrade Prompts
```tsx
import ThemeUpgradePrompt from '@/components/ui/theme-upgrade-prompt'

function SomeComponent() {
  const { isAuthenticated } = useTheme()
  
  return (
    <div>
      {!isAuthenticated && (
        <ThemeUpgradePrompt compact={true} />
      )}
    </div>
  )
}
```

### For Users

#### Accessing Premium Themes
1. Navigate to the dashboard theme selector
2. Premium themes will show a crown icon
3. Click on a premium theme to see unlock prompt
4. Register for free or login to access premium themes
5. Theme preference automatically syncs across devices

#### Theme Features
- **Visual Distinction**: Premium themes have crown icons
- **Font Support**: Each premium theme includes retro-style fonts
- **Persistence**: Themes persist across sessions and devices
- **Fallback**: If user logs out, theme falls back to free theme

## CSS Integration

Premium themes are defined in `app/globals.css` with CSS custom properties:

```css
:root[data-theme="atari2600"] {
  --bg: #000000;
  --primary: #E0EC9C;
  --font-family: "VT323", "Press Start 2P", monospace;
  /* ... other properties */
}
```

Components can use these variables:
```css
.themed-component {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-family, monospace);
}
```

## Database Setup

To enable premium themes, run the SQL schema:

```bash
# Connect to your Supabase project
psql [your-supabase-connection-string]

# Run the schema
\i lib/supabase/user-preferences-schema.sql
```

## Testing

### Manual Testing Checklist

1. **Free Theme Access**
   - [ ] All users can access dark, miami, tron themes
   - [ ] Theme changes persist in localStorage
   - [ ] CSS variables update correctly

2. **Premium Theme Access Control**
   - [ ] Non-authenticated users see lock icons on premium themes
   - [ ] Clicking premium themes shows upgrade prompt
   - [ ] Premium themes redirect to login page

3. **Authenticated User Features**
   - [ ] Can access all 7 themes after login
   - [ ] Theme preference saves to database
   - [ ] Theme syncs across browser sessions
   - [ ] Logout falls back to free theme if using premium

4. **Database Integration**
   - [ ] user_preferences table created successfully
   - [ ] RLS policies working correctly
   - [ ] Theme saves and loads from database

5. **UI/UX**
   - [ ] Crown icons visible on premium themes
   - [ ] Upgrade prompts are attractive and functional
   - [ ] Font loading works for all premium themes
   - [ ] Themes apply consistently across all components

## Troubleshooting

### Common Issues

1. **Premium themes not showing**: Check if user_preferences table exists
2. **Fonts not loading**: Verify Google Fonts import in globals.css
3. **Theme not persisting**: Check Supabase RLS policies
4. **Authentication issues**: Verify auth integration in theme provider

### Debug Information

The theme service includes extensive console logging for debugging:
```javascript
// Enable debug mode
localStorage.setItem('theme-debug', 'true')
```

## Future Enhancements

Potential improvements to consider:
- Theme preview animations
- More premium themes
- Custom theme creation for premium users
- Theme marketplace
- Seasonal theme rotation
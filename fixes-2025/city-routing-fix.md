# Fix for City Weather Pages

## Problem
The weather app has conflicting routing structures:
1. Static city folders (los-angeles-ca, new-york-ny, etc.) with old page.tsx files
2. Dynamic [city] folder with the correct implementation

This causes "City Not Found" errors because the static folders take precedence but have broken code.

## Solution

### Option 1: Delete all static city folders (RECOMMENDED)
Remove these folders from `app/weather/`:
- austin-tx/
- chicago-il/
- dallas-tx/
- houston-tx/
- los-angeles-ca/
- new-york-ny/
- philadelphia-pa/
- phoenix-az/
- san-antonio-tx/
- san-diego-ca/

Keep only the `[city]` folder which handles all cities dynamically.

### Option 2: Fix each static city page
Update each static city's page.tsx to remove the params check and hard-code the city slug.

## Instructions for Claude Code:

```bash
claude-code "Fix the city routing issue in the weather app at C:\Users\justi\OneDrive\Desktop\Weather-application--main:

1. Delete all static city folders in app/weather/ (keep only the [city] folder):
   - Delete: austin-tx, chicago-il, dallas-tx, houston-tx, los-angeles-ca
   - Delete: new-york-ny, philadelphia-pa, phoenix-az, san-antonio-tx, san-diego-ca
   
2. Verify the [city] folder has the correct page.tsx and client.tsx files

3. Test that city links work:
   - Navigate to /weather/los-angeles-ca
   - Navigate to /weather/new-york-ny
   - Verify weather loads correctly

4. Run 'npm run build' to ensure no build errors"
```

## Manual Fix (if you want to do it yourself):

1. Open File Explorer
2. Navigate to: `C:\Users\justi\OneDrive\Desktop\Weather-application--main\app\weather\`
3. Delete all city folders EXCEPT `[city]`
4. Keep only the `[city]` folder

The dynamic [city] route will handle all cities automatically.

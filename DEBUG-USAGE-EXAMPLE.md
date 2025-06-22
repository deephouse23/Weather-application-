# 🔧 DEBUG CONFIGURATION USAGE GUIDE

## ⚠️ TEMPORARY DEVELOPMENT SETUP - NEVER COMMIT TO PRODUCTION ⚠️

This guide shows how to use the hardcoded API key for local development debugging.

## 📋 Setup Steps

### 1. Configure Your API Key
Edit `local-dev-config.ts` and replace `'YOUR_API_KEY_HERE'` with your actual OpenWeather API key:

```typescript
export const DEBUG_API_KEY: string = 'your_actual_api_key_here';
```

### 2. Use Debug Functions in Development
In your main page or component, temporarily import the debug functions:

```typescript
// TEMPORARY DEBUG IMPORTS - REMOVE BEFORE PRODUCTION
import { fetchWeatherDataDebug, fetchWeatherByLocationDebug } from '@/lib/weather-api-debug';

// Replace your existing API calls with debug versions:
// OLD: const weather = await fetchWeatherData(locationInput, API_KEY);
// NEW: const weather = await fetchWeatherDataDebug(locationInput);
```

### 3. Example Usage in app/page.tsx
```typescript
// TEMPORARY DEBUG CODE - REMOVE BEFORE PRODUCTION
const handleSearch = async (locationInput: string) => {
  try {
    // Use debug version for local development
    const weather = await fetchWeatherDataDebug(locationInput);
    setWeather(weather);
  } catch (error) {
    console.error('Debug search failed:', error);
  }
};
```

## 🚨 Security Warnings

### Files That Should NEVER Be Committed:
- ✅ `local-dev-config.ts` (ignored by .gitignore)
- ✅ `lib/weather-api-debug.ts` (ignored by .gitignore)
- ✅ `DEBUG-USAGE-EXAMPLE.md` (this file)

### Before Production Deployment:
1. **Delete debug files:**
   ```bash
   rm local-dev-config.ts
   rm lib/weather-api-debug.ts
   rm DEBUG-USAGE-EXAMPLE.md
   ```

2. **Remove debug imports** from your code
3. **Restore original API calls** using environment variables
4. **Test with production configuration**

## 🔍 Debug Features

The debug configuration provides:
- ✅ API key validation
- ✅ Security warnings on import
- ✅ Detailed console logging
- ✅ Cleanup reminders
- ✅ Error handling with debug context

## 📝 Console Output Examples

When using debug functions, you'll see:
```
🚨 SECURITY WARNING 🚨
You are using the DEBUG weather API utility with hardcoded API keys...

🔧 [DEBUG] Fetching weather data for: New York, NY
🔧 [DEBUG] Using hardcoded API key (development only)
✅ [DEBUG] Weather data fetched successfully
```

## 🧹 Cleanup Checklist

Before committing to production:
- [ ] Delete `local-dev-config.ts`
- [ ] Delete `lib/weather-api-debug.ts`
- [ ] Delete `DEBUG-USAGE-EXAMPLE.md`
- [ ] Remove all debug imports from your code
- [ ] Restore original API calls with environment variables
- [ ] Test that environment variables work correctly
- [ ] Verify no API keys are in your code
- [ ] Run `git status` to ensure debug files aren't tracked

## 🆘 Troubleshooting

### "Debug configuration not found"
- Ensure `local-dev-config.ts` exists in the root directory
- Check that you've set your API key in the file

### "Debug API key not configured"
- Replace `'YOUR_API_KEY_HERE'` with your actual API key
- Ensure the API key is at least 10 characters long

### "Module not found" errors
- Make sure you're importing from the correct path
- Check that the debug files exist

---

**Remember: This is for LOCAL DEVELOPMENT ONLY. Never commit these files to version control!** 
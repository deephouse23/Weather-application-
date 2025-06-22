# 16-Bit Weather App - Deployment Guide

## Environment Variables Setup

### Required Environment Variables

This application requires the following environment variables to be configured:

#### 1. OpenWeatherMap API Key (Required)
```env
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**How to get it:**
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "My API Keys"
4. Copy your API key
5. Set it as the environment variable

#### 2. Google Pollen API Key (Optional)
```env
REACT_APP_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here
```

**How to get it:**
1. Visit [Google Maps Platform](https://developers.google.com/maps/documentation/pollen)
2. Enable the Pollen API
3. Create credentials (API key)
4. Set it as the environment variable

### Local Development Setup

1. **Copy the example environment file:**
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local` and add your API keys:**
   ```env
   REACT_APP_OPENWEATHER_API_KEY=your_actual_openweather_api_key
   REACT_APP_GOOGLE_POLLEN_API_KEY=your_actual_google_pollen_api_key
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Vercel Deployment

1. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `REACT_APP_OPENWEATHER_API_KEY` with your OpenWeather API key
   - Add `REACT_APP_GOOGLE_POLLEN_API_KEY` with your Google Pollen API key (optional)

2. **Deploy:**
   ```bash
   vercel --prod
   ```

#### Other Platforms

For other deployment platforms, set the environment variables according to their documentation:

- **Netlify**: Set in Site Settings > Environment Variables
- **Railway**: Set in Variables tab
- **Heroku**: Use `heroku config:set REACT_APP_OPENWEATHER_API_KEY=your_key`

### Environment Variable Validation

The application includes built-in validation that will:

1. **Show console errors** if `REACT_APP_OPENWEATHER_API_KEY` is missing
2. **Show console warnings** if `REACT_APP_GOOGLE_POLLEN_API_KEY` is missing
3. **Fall back gracefully** if optional APIs are not configured

### Testing Environment Variables

Visit `/test` page to verify your environment variables are properly configured:

- ✅ OpenWeather API Key: SET/MISSING
- ✅ Google Pollen API Key: SET/MISSING

### Security Notes

- ✅ Never commit API keys to version control
- ✅ Use `.env.local` for local development (already in .gitignore)
- ✅ Set environment variables securely in production platforms
- ✅ Rotate API keys regularly
- ✅ Monitor API usage to avoid rate limits

### Troubleshooting

**"OpenWeather API key is missing!" error:**
1. Check that `REACT_APP_OPENWEATHER_API_KEY` is set
2. Verify the API key is valid
3. Restart the development server after setting environment variables

**"Google Pollen API key is missing!" warning:**
1. This is optional - the app will work without it
2. Set `REACT_APP_GOOGLE_POLLEN_API_KEY` for accurate pollen data
3. Without it, pollen data will use air quality metrics as fallback

## Production Deployment Preparation v0.1.3

### ✅ Security Changes Made
- ✅ Removed all hardcoded API keys from source code
- ✅ Removed local environment files with sensitive data
- ✅ App now requires proper environment variable configuration
- ✅ Added graceful error handling for missing API key

### 🔑 Required Environment Variables

The application requires the following environment variable to be set:

```
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here
```

### 🚀 Deployment Platforms

#### Vercel Deployment
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. In Vercel dashboard, go to Project Settings → Environment Variables
4. Add: `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY` with your API key value
5. Deploy

#### Netlify Deployment  
1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. In Netlify dashboard, go to Site Settings → Environment Variables
4. Add: `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY` with your API key value
5. Deploy

#### Other Platforms
Set the environment variable `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY` in your deployment platform's environment configuration.

### 🔧 Getting OpenWeatherMap API Key

1. Visit [OpenWeatherMap API](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Use this key in your environment variables

### 🛡️ Security Features

- No hardcoded secrets in source code
- Environment variables for API configuration
- User-friendly error messages for missing configuration
- Graceful degradation when services are unavailable

### 📱 Local Development Setup

For local development, create a `.env.local` file:

```
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
```

**Note:** This file is gitignored and will not be committed to version control.

### ✨ Features Preserved in v0.1.3

- ASCII 16-bit weather welcome screen
- Complete weather systems interactive database
- PIXEL MODE theme selector
- All retro styling and animations
- Comprehensive weather data display
- Mobile responsive design

---

**Ready for Production Deployment** 🚀 
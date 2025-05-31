# 🌤️ 16-bit Weather - Complete Setup Guide

A comprehensive guide to setting up and running your retro 16-bit style weather application with real OpenWeatherMap API integration.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [API Key Setup](#api-key-setup)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before setting up **16-bit Weather**, ensure you have:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **OpenWeatherMap API Key** (free)
   - Sign up at: https://openweathermap.org/api
   - Get your free API key from the dashboard

## 🚀 Installation Steps

### 1. Clone/Download the Project
```bash
# If using Git
git clone [your-repository-url]
cd 16-bit-weather

# Or download and extract the ZIP file
```

### 2. Install Dependencies
```bash
npm install
```

If you encounter peer dependency warnings, use:
```bash
npm install --legacy-peer-deps
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```bash
# Windows (PowerShell)
New-Item -ItemType File -Name ".env.local"

# macOS/Linux
touch .env.local
```

Add your API key to `.env.local`:
```env
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
```

**⚠️ Important**: Replace `your_api_key_here` with your actual OpenWeatherMap API key.

## 🔑 API Key Setup

### Getting Your OpenWeatherMap API Key:

1. **Sign Up**: Go to https://openweathermap.org/api
2. **Create Account**: Sign up for a free account
3. **Generate Key**: Go to "My API Keys" in your dashboard
4. **Copy Key**: Copy the generated API key
5. **Add to Project**: Paste it in your `.env.local` file

### API Key Format:
```env
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=abc123def456ghi789jkl012mno345pqr
```

## 🏃‍♂️ Running the Application

### Development Mode:
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### Production Build:
```bash
npm run build
npm start
```

## ✨ Features

### 🌍 Location Search Formats
**16-bit Weather** supports multiple location formats:

- **ZIP Codes**: `90210`, `10001`, `SW1A 1AA` (UK), `K1A 0A6` (Canada)
- **US Cities**: `Los Angeles, CA`, `New York, NY`, `Chicago, Illinois`
- **International**: `London, UK`, `Paris, France`, `Tokyo, Japan`
- **City Only**: `Tokyo`, `London`, `Paris` (for major cities)

### 🎮 Retro Features
- **16-bit Aesthetic**: Authentic retro gaming graphics
- **Pixel Art Icons**: Custom weather condition icons
- **Retro Typography**: Pixel-perfect fonts and styling
- **Gaming UI**: Retro terminal-style interface

### 🌦️ Weather Information
- **Current Conditions**: Temperature, humidity, wind speed & direction
- **Wind Display**: Compass directions (N, NE, E, SE, S, SW, W, NW)
- **3-Day Forecast**: Extended weather predictions
- **Real-time Data**: Live updates from OpenWeatherMap

## 🔧 Troubleshooting

### Common Issues:

#### 1. "npm command not found"
- **Solution**: Install Node.js from https://nodejs.org/
- **Verify**: Run `node --version` and `npm --version`

#### 2. "API key not configured"
- **Solution**: Check your `.env.local` file exists and contains the API key
- **Location**: File should be in the root directory (same level as `package.json`)
- **Format**: `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_key_here`

#### 3. "Location not found" errors
- **Solution**: Try different location formats:
  - ZIP codes: `90210`
  - City, State: `Los Angeles, CA`
  - City, Country: `London, UK`

#### 4. PowerShell execution policy errors
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 5. Port 3000 already in use
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### 📱 Browser Compatibility
- **Chrome**: ✅ Fully supported
- **Firefox**: ✅ Fully supported  
- **Safari**: ✅ Fully supported
- **Edge**: ✅ Fully supported

### 🌐 Network Requirements
- **Internet connection** required for weather data
- **API access** to openweathermap.org
- **Geolocation** (optional, for "Use My Location" feature)

## 🎯 Next Steps

Once **16-bit Weather** is running:

1. **Test Different Locations**: Try various ZIP codes and city names
2. **Use Your Location**: Click "USE MY LOCATION" to get local weather
3. **Explore Formats**: Test international locations and postcodes
4. **Check Wind Display**: Notice the compass direction format (e.g., "SW 6 mph")

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify your API key is correct and active
3. Ensure your internet connection is stable
4. Check browser console for error messages

---

**🎮 Enjoy your retro weather experience with 16-bit Weather!** 🌤️ 
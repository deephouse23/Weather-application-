# 🌍 Location Search Formats - 16-bit Weather v2.0

This document details all supported location search formats for **16-bit Weather**, providing users with comprehensive guidance on how to search for weather information worldwide.

Your retro weather app now supports **multiple location input formats** with smart auto-detection!

## 🎯 **Supported Formats**

### **1. US ZIP Codes**
```
90210
10001
30301-1234
```
- 5-digit ZIP codes
- ZIP+4 format (with dash)
- Automatically detects US locations

### **2. US City + State**
```
Los Angeles, CA
New York, NY
Miami, Florida
Chicago, Illinois
```
- City, State abbreviation (CA, NY, FL, etc.)
- City, Full state name (California, New York, etc.)
- Automatically adds "US" country code

### **3. International City + Country**
```
London, UK
Paris, France
Tokyo, JP
Berlin, Germany
Sydney, Australia
```
- City, Country name
- City, Country code (ISO codes like UK, JP, DE)
- Worldwide location support

### **4. City Only**
```
Tokyo
London
Paris
```
- Major world cities
- Works best for well-known locations
- May prompt for more specific format if ambiguous

## ⚡ **Smart Format Detection**

The app automatically detects your input format:

- **ZIP Detection**: Recognizes 5-digit US codes and international postal codes
- **State Recognition**: Identifies US state abbreviations and full names
- **Country Detection**: Handles both country names and ISO codes
- **Auto-formatting**: Adds appropriate country codes automatically

## 🎮 **How to Use**

1. **Type naturally** - no need to select a format
2. **Click examples** - tap format examples for quick entry
3. **Auto-complete** - see format hints as you type
4. **Error guidance** - get specific suggestions if location isn't found

## 🔥 **Examples by Region**

### **United States**
- `90210` (Beverly Hills)
- `New York, NY` (New York City)
- `Austin, Texas` (Austin)
- `Miami, FL` (Miami)

### **International**
- `London, UK` (United Kingdom)
- `Tokyo, JP` (Japan)
- `Paris, France` (France)
- `Sydney, AU` (Australia)

### **Major Cities (City Only)**
- `Tokyo` (Japan)
- `London` (UK)
- `Paris` (France)
- `Mumbai` (India)

## 🚨 **Error Handling**

**Smart error messages** based on your input:

- **ZIP not found**: "ZIP code not found. Please check the ZIP code and try again."
- **City/State not found**: "Try 'City, State' format (e.g., 'New York, NY')"
- **City/Country not found**: "Try 'City, Country' format (e.g., 'London, UK')"
- **City only not found**: "Try including state/country (e.g., 'Paris, France')"

## 🎨 **UI Features**

- **Interactive Examples**: Click format examples to try them
- **Smart Placeholder**: Shows supported formats
- **Format Hints**: Visual examples below search box
- **Dropdown Guide**: Hover over search box for format help
- **Error Suggestions**: Contextual tips when searches fail

## 🛠️ **Technical Details**

- **API Integration**: Uses OpenWeatherMap's geocoding endpoints
- **Format Parsing**: Smart regex-based format detection
- **Error Recovery**: Helpful suggestions for failed searches
- **Performance**: Optimized API calls for different location types

## 🌟 **Pro Tips**

1. **Be Specific**: "Springfield, IL" is better than just "Springfield"
2. **Use Abbreviations**: "LA, CA" works great for Los Angeles
3. **International**: Always include country for non-US cities
4. **ZIP Codes**: Fastest way to search US locations
5. **Major Cities**: Tokyo, London, Paris work without country codes

Enjoy your enhanced retro weather experience! 🌤️👾 
#!/usr/bin/env node

/**
 * Script to integrate animated weather radar into your application
 * Usage: node scripts/integrate-animated-radar.js
 */

const fs = require('fs');
const path = require('path');

console.log('🌧️  Weather Radar Animation Integration Script');
console.log('==============================================\n');

// Check if the animated component exists
const animatedComponentPath = path.join(process.cwd(), 'components', 'weather-map-animated.tsx');
if (!fs.existsSync(animatedComponentPath)) {
  console.error('❌ Error: weather-map-animated.tsx not found in components directory');
  console.log('Please ensure the animated weather map component is created first.');
  process.exit(1);
}

console.log('✅ Found animated weather map component');

// Function to update imports in a file
function updateImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Warning: ${filePath} not found, skipping...`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if already using animated version
  if (content.includes('weather-map-animated')) {
    console.log(`ℹ️  ${path.basename(filePath)} already using animated version`);
    return false;
  }

  // Replace weather-map import with weather-map-animated
  if (content.includes("from '@/components/weather-map'") || 
      content.includes('from "../components/weather-map"') ||
      content.includes('from "./weather-map"')) {
    
    content = content.replace(
      /from ['"][@\.\/]+components\/weather-map['"]/g,
      "from '@/components/weather-map-animated'"
    );
    
    // Also update the component name
    content = content.replace(/WeatherMap/g, 'WeatherMapAnimated');
    
    modified = true;
  }

  // Update lazy-loaded components if present
  if (content.includes('lazy(() => import') && content.includes('weather-map')) {
    
#!/usr/bin/env node

/**
 * Test script for Google Air Quality API
 * Usage: node scripts/test-google-aqi.js YOUR_API_KEY
 */

const https = require('https');

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('Please provide your Google API key as an argument');
  console.error('Usage: node scripts/test-google-aqi.js YOUR_API_KEY');
  process.exit(1);
}

// Test coordinates for Pleasanton, CA
const latitude = 37.6832;
const longitude = -121.8675;

const payload = JSON.stringify({
  location: {
    latitude,
    longitude
  },
  extraComputations: [
    "LOCAL_AQI",
    "POLLUTANT_CONCENTRATION"
  ],
  languageCode: "en"
});

const options = {
  hostname: 'airquality.googleapis.com',
  path: `/v1/currentConditions:lookup?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

console.log('Testing Google Air Quality API...');
console.log('Location: Pleasanton, CA');
console.log('Coordinates:', { latitude, longitude });
console.log('---');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('---');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('SUCCESS! API is working.');
        console.log('---');
        console.log('Response:', JSON.stringify(jsonData, null, 2));
        
        if (jsonData.indexes && jsonData.indexes.length > 0) {
          console.log('---');
          console.log('AQI Summary:');
          jsonData.indexes.forEach(index => {
            console.log(`- ${index.displayName}: ${index.aqi} (${index.category})`);
          });
        }
      } else {
        console.log('ERROR:', jsonData);
        console.log('---');
        
        if (jsonData.error) {
          console.log('Error Message:', jsonData.error.message);
          console.log('Error Code:', jsonData.error.code);
          
          if (jsonData.error.message.includes('API key not valid')) {
            console.log('\n⚠️  Your API key is not valid for the Air Quality API.');
            console.log('Please check:');
            console.log('1. The API key is correct');
            console.log('2. Air Quality API is enabled in Google Cloud Console');
            console.log('3. The API key has the necessary permissions');
          } else if (jsonData.error.message.includes('disabled')) {
            console.log('\n⚠️  The Air Quality API is not enabled for your project.');
            console.log('Enable it at: https://console.cloud.google.com/apis/library/airquality.googleapis.com');
          }
        }
      }
    } catch (e) {
      console.log('Failed to parse response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e);
});

req.write(payload);
req.end();

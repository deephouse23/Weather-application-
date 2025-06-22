/**
 * 🔧 API TEST COMPONENT - FOR LOCAL DEVELOPMENT ONLY
 * 
 * This component helps you test the weather API locally with your hardcoded API key.
 * 
 * USAGE:
 * 1. Add your API key to local-dev-config.ts
 * 2. Import this component in your page for testing
 * 3. Delete this component before production
 * 
 * ⚠️ NEVER COMMIT THIS COMPONENT TO PRODUCTION
 */

"use client"

import React, { useState } from 'react';
import { fetchWeatherDataDebug } from '@/lib/weather-api-debug';

export default function ApiTest() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testApi = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      console.log('🧪 Testing API with location:', location);
      const result = await fetchWeatherDataDebug(location);
      setWeather(result);
      console.log('✅ API test successful:', result);
    } catch (err: any) {
      setError(err.message || 'API test failed');
      console.error('❌ API test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 border border-red-500 rounded-lg mb-6">
      <h2 className="text-xl font-bold text-red-400 mb-4">
        🔧 API TEST COMPONENT - LOCAL DEVELOPMENT ONLY
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Test Location:
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city name (e.g., New York, London)"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <button
          onClick={testApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>

        {error && (
          <div className="p-3 bg-red-900 border border-red-700 rounded text-red-300">
            ❌ Error: {error}
          </div>
        )}

        {weather && (
          <div className="p-4 bg-green-900 border border-green-700 rounded">
            <h3 className="text-green-300 font-bold mb-2">✅ API Test Successful!</h3>
            <div className="text-green-200 text-sm space-y-1">
              <p><strong>Location:</strong> {weather.location}, {weather.country}</p>
              <p><strong>Temperature:</strong> {weather.temperature}{weather.unit}</p>
              <p><strong>Condition:</strong> {weather.condition}</p>
              <p><strong>Humidity:</strong> {weather.humidity}%</p>
              <p><strong>Wind:</strong> {weather.wind.speed} mph {weather.wind.direction}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded text-yellow-300 text-sm">
        <strong>⚠️ REMEMBER:</strong> Delete this component before production deployment!
      </div>
    </div>
  );
} 
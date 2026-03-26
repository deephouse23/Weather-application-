'use client';

/**
 * 16-Bit Weather Platform - Travel Weather Page
 *
 * Compare weather conditions between two locations for trip planning.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import { ArrowRight, MapPin } from 'lucide-react';

interface LocationWeather {
  name: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  condition: string;
  description: string;
}

export default function TravelPage() {
  const { theme } = useTheme();
  getComponentStyles((theme || 'nord') as ThemeType, 'weather');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originWeather, setOriginWeather] = useState<LocationWeather | null>(null);
  const [destWeather, setDestWeather] = useState<LocationWeather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchWeatherForLocation(query: string): Promise<LocationWeather | null> {
    try {
      const geoRes = await fetch(`/api/weather/geocoding?q=${encodeURIComponent(query)}`);
      if (!geoRes.ok) return null;
      const geoData = await geoRes.json();
      const loc = geoData[0] || geoData;
      if (loc?.lat == null && loc?.latitude == null) return null;

      const lat = loc.lat ?? loc.latitude;
      const lon = loc.lon ?? loc.longitude;
      const name = loc.name ?? query;

      const wxRes = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}&units=imperial`);
      if (!wxRes.ok) return null;
      const wx = await wxRes.json();

      return {
        name,
        temp: Math.round(wx.main?.temp ?? 0),
        feelsLike: Math.round(wx.main?.feels_like ?? 0),
        humidity: wx.main?.humidity ?? 0,
        wind: Math.round(wx.wind?.speed ?? 0),
        condition: wx.weather?.[0]?.main ?? 'Unknown',
        description: wx.weather?.[0]?.description ?? '',
      };
    } catch {
      return null;
    }
  }

  async function handleCompare() {
    if (isLoading) return;
    if (!origin.trim() || !destination.trim()) return;
    setIsLoading(true);
    setError('');
    setOriginWeather(null);
    setDestWeather(null);

    const [o, d] = await Promise.all([
      fetchWeatherForLocation(origin),
      fetchWeatherForLocation(destination),
    ]);

    if (!o || !d) {
      setError('Could not find weather for one or both locations. Try "City, State" format.');
    } else {
      setOriginWeather(o);
      setDestWeather(d);
    }
    setIsLoading(false);
  }

  function WeatherCard({ data, label }: { data: LocationWeather; label: string }) {
    return (
      <div className="border border-border rounded-lg p-6 bg-card/30 flex-1">
        <p className="text-xs font-mono text-muted-foreground tracking-wider mb-1">{label}</p>
        <h3 className="text-lg font-bold font-mono flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          {data.name}
        </h3>
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-5xl font-extrabold font-mono">{data.temp}</span>
            <span className="text-lg font-mono text-muted-foreground">°F</span>
            <p className="text-sm font-mono text-muted-foreground capitalize mt-1">{data.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            <div className="text-center">
              <p className="text-xs font-mono text-muted-foreground">FEELS LIKE</p>
              <p className="font-mono font-bold">{data.feelsLike}°</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-muted-foreground">HUMIDITY</p>
              <p className="font-mono font-bold">{data.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-muted-foreground">WIND</p>
              <p className="font-mono font-bold">{data.wind} mph</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono uppercase">Travel Weather</h1>
          <p className="text-sm font-mono text-muted-foreground tracking-wider">// COMPARE CONDITIONS // PLAN YOUR TRIP</p>
        </div>

        {/* Search Form */}
        <div className="flex flex-col md:flex-row items-center gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Origin (e.g. New York, NY)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
            className="flex-1 w-full px-4 py-3 bg-card/50 border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 hidden md:block" />
          <input
            type="text"
            placeholder="Destination (e.g. Miami, FL)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
            className="flex-1 w-full px-4 py-3 bg-card/50 border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleCompare}
            disabled={isLoading || !origin.trim() || !destination.trim()}
            className={cn(
              "px-6 py-3 rounded-lg font-mono font-bold text-sm transition-colors shrink-0",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? 'LOADING...' : 'COMPARE'}
          </button>
        </div>

        {error && <p className="text-center text-sm font-mono text-orange-400">{error}</p>}

        {isLoading && <p className="text-center text-lg font-mono text-muted-foreground animate-pulse py-12">COMPUTING TRAVEL CONDITIONS...</p>}

        {/* Results */}
        {originWeather && destWeather && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <WeatherCard data={originWeather} label="ORIGIN" />
              <WeatherCard data={destWeather} label="DESTINATION" />
            </div>

            {/* Comparison Summary */}
            <div className="border border-border rounded-lg p-5 bg-card/30 text-center">
              <p className="font-mono text-sm text-muted-foreground mb-2">TRAVEL ADVISORY</p>
              <p className="font-mono font-bold">
                {destWeather.temp > originWeather.temp
                  ? `${destWeather.name} is ${destWeather.temp - originWeather.temp}° warmer than ${originWeather.name}`
                  : destWeather.temp < originWeather.temp
                    ? `${destWeather.name} is ${originWeather.temp - destWeather.temp}° cooler than ${originWeather.name}`
                    : `Both locations are the same temperature`
                }
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !originWeather && !destWeather && !error && (
          <div className="text-center py-12 border border-border rounded-lg bg-card/30">
            <p className="text-lg font-mono text-muted-foreground">Enter two locations to compare weather conditions</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

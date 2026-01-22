/**
 * 16-Bit Weather Platform - Flight Route Lookup Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Allows users to search for turbulence PIREPs along a flight route
 * Accepts departure/arrival airports or auto-fills from flight lookup
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Plane, MapPin, Search, AlertTriangle, Loader2, Route, ArrowRight, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import dynamic from 'next/dynamic';

// Lazy load FlightNumberInput for performance
const FlightNumberInput = dynamic(() => import('./FlightNumberInput'), {
  loading: () => (
    <div className="h-[60px] flex items-center justify-center bg-gray-900 border-2 border-dashed border-gray-600 rounded">
      <div className="text-center text-gray-400 font-mono text-xs">
        <div className="animate-pulse">Loading Flight Input...</div>
      </div>
    </div>
  ),
  ssr: false
});

// Flight data from lookup API
export interface FlightData {
  flightNumber: string;
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  departure: {
    icao: string;
    iata: string;
    name: string;
    city: string;
    lat: number;
    lon: number;
  };
  arrival: {
    icao: string;
    iata: string;
    name: string;
    city: string;
    lat: number;
    lon: number;
  };
  status: string;
}

// PIREP data for route display
interface RoutePIREP {
  id: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  turbulenceIntensity: string | null;
  turbulenceType: string | null;
  observationTime: string;
  rawText: string;
}

interface FlightRouteLookupProps {
  initialFlight?: FlightData;
  onRouteSearch?: (departure: string, arrival: string) => void;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if a point is within corridor of a great circle route
function isPointNearRoute(
  pointLat: number,
  pointLon: number,
  depLat: number,
  depLon: number,
  arrLat: number,
  arrLon: number,
  corridorWidth: number = 100 // miles
): boolean {
  // Simple approach: check if point is within corridor
  const routeDist = calculateDistance(depLat, depLon, arrLat, arrLon);
  const distToDep = calculateDistance(pointLat, pointLon, depLat, depLon);
  const distToArr = calculateDistance(pointLat, pointLon, arrLat, arrLon);

  // Point should be between departure and arrival (with some margin)
  if (distToDep > routeDist + corridorWidth || distToArr > routeDist + corridorWidth) {
    return false;
  }

  // Calculate perpendicular distance to route using cross-track error approximation
  // This is simplified; actual implementation would use spherical geometry
  const bearing1 = Math.atan2(
    Math.sin((pointLon - depLon) * Math.PI / 180) * Math.cos(pointLat * Math.PI / 180),
    Math.cos(depLat * Math.PI / 180) * Math.sin(pointLat * Math.PI / 180) -
    Math.sin(depLat * Math.PI / 180) * Math.cos(pointLat * Math.PI / 180) * Math.cos((pointLon - depLon) * Math.PI / 180)
  );

  const bearing2 = Math.atan2(
    Math.sin((arrLon - depLon) * Math.PI / 180) * Math.cos(arrLat * Math.PI / 180),
    Math.cos(depLat * Math.PI / 180) * Math.sin(arrLat * Math.PI / 180) -
    Math.sin(depLat * Math.PI / 180) * Math.cos(arrLat * Math.PI / 180) * Math.cos((arrLon - depLon) * Math.PI / 180)
  );

  const crossTrack = Math.asin(Math.sin(distToDep / 3959) * Math.sin(bearing1 - bearing2)) * 3959;

  return Math.abs(crossTrack) <= corridorWidth;
}

// Get turbulence color
function getTurbulenceColor(intensity: string | null): string {
  if (!intensity) return 'text-green-500';
  const upper = intensity.toUpperCase();
  if (upper.includes('EXTRM') || upper.includes('EXTREME')) return 'text-red-500';
  if (upper.includes('SEV')) return 'text-orange-500';
  if (upper.includes('MOD')) return 'text-yellow-500';
  return 'text-green-500';
}

export default function FlightRouteLookup({ initialFlight, onRouteSearch }: FlightRouteLookupProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  // Form state
  const [departureCode, setDepartureCode] = useState('');
  const [arrivalCode, setArrivalCode] = useState('');
  const [flightData, setFlightData] = useState<FlightData | null>(initialFlight || null);

  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [routePireps, setRoutePireps] = useState<RoutePIREP[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch - only render time-dependent values after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Search for PIREPs along route - defined before useEffect that uses it
  // Note: flight parameter is required to avoid circular dependency with flightData state
  const handleRouteSearch = useCallback(async (depCode: string, arrCode: string, flight?: FlightData | null) => {
    const dep = depCode.trim().toUpperCase();
    const arr = arrCode.trim().toUpperCase();

    if (!dep || !arr) {
      setSearchError('Please enter both departure and arrival airport codes');
      return;
    }

    if (dep === arr) {
      setSearchError('Departure and arrival airports must be different');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      // Fetch PIREPs
      const response = await fetch('/api/aviation/pireps?hours=4&turbulenceOnly=false');

      if (!response.ok) {
        throw new Error('Failed to fetch PIREP data');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      // Get coordinates for filtering - flight parameter must be provided
      // to avoid circular dependency with flightData state
      let depLat: number, depLon: number, arrLat: number, arrLon: number;

      if (flight && flight.departure.icao === dep && flight.arrival.icao === arr) {
        depLat = flight.departure.lat;
        depLon = flight.departure.lon;
        arrLat = flight.arrival.lat;
        arrLon = flight.arrival.lon;
      } else {
        // Cannot resolve coordinates without flight data - show error
        setSearchError('Unable to resolve airport coordinates. Please use flight number lookup above.');
        setIsSearching(false);
        return;
      }

      // Filter PIREPs along route
      const filteredPireps: RoutePIREP[] = result.data.pireps
        .filter((pirep: RoutePIREP) => {
          return isPointNearRoute(
            pirep.latitude,
            pirep.longitude,
            depLat,
            depLon,
            arrLat,
            arrLon,
            150 // 150 mile corridor
          );
        })
        .slice(0, 20); // Limit to 20 results

      setRoutePireps(filteredPireps);

      // Notify parent if callback provided
      if (onRouteSearch) {
        onRouteSearch(dep, arr);
      }
    } catch (error) {
      console.error('Route search error:', error);
      setSearchError('Unable to fetch turbulence data. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [onRouteSearch]);

  // Update form when initialFlight changes
  useEffect(() => {
    if (initialFlight) {
      setFlightData(initialFlight);
      setDepartureCode(initialFlight.departure.icao);
      setArrivalCode(initialFlight.arrival.icao);
      // Auto-search when flight data is provided
      handleRouteSearch(initialFlight.departure.icao, initialFlight.arrival.icao, initialFlight);
    }
  }, [initialFlight, handleRouteSearch]);

  // Handle flight found from FlightNumberInput
  const handleFlightFound = useCallback((data: FlightData) => {
    setFlightData(data);
    setDepartureCode(data.departure.icao);
    setArrivalCode(data.arrival.icao);
    // Auto-search when flight is found
    handleRouteSearch(data.departure.icao, data.arrival.icao, data);
  }, [handleRouteSearch]);

  // Handle manual form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass current flightData state since handleRouteSearch doesn't have it in closure
    handleRouteSearch(departureCode, arrivalCode, flightData);
  };

  // Clear flight data and form
  const handleClear = () => {
    setFlightData(null);
    setDepartureCode('');
    setArrivalCode('');
    setRoutePireps([]);
    setSearchError(null);
    setHasSearched(false);
  };

  // Format time ago
  const formatTimeAgo = (isoString: string): string => {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Unknown';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  // Format altitude
  const formatAltitude = (ft: number): string => {
    if (ft >= 18000) {
      return `FL${Math.round(ft / 100)}`;
    }
    return `${ft.toLocaleString()} ft`;
  };

  return (
    <div className={cn('space-y-4', themeClasses.background)}>
      {/* Flight Number Lookup Section */}
      <div className={cn('p-4 border-2 rounded', themeClasses.borderColor)}>
        <div className={cn('flex items-center gap-2 mb-3', themeClasses.headerText)}>
          <Plane className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-mono font-bold uppercase">Search by Flight Number</span>
        </div>
        <FlightNumberInput
          onFlightFound={handleFlightFound}
          onError={(error) => setSearchError(error)}
        />
      </div>

      {/* Flight Info Display */}
      {flightData && (
        <div className={cn('p-4 border-2 rounded bg-cyan-500/10', themeClasses.borderColor)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-cyan-500" />
              <span className={cn('text-sm font-mono font-bold', themeClasses.accentText)}>
                {flightData.flightNumber}
              </span>
              <span className={cn('text-xs font-mono opacity-70', themeClasses.text)}>
                {flightData.airline.name}
              </span>
            </div>
            <button
              onClick={handleClear}
              className={cn(
                'p-1 text-xs font-mono border rounded hover:bg-gray-700 transition-colors',
                themeClasses.borderColor,
                themeClasses.text
              )}
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-500" />
              <span className={themeClasses.text}>{flightData.departure.iata}</span>
              <span className={cn('text-xs opacity-60', themeClasses.text)}>{flightData.departure.city}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-500" />
              <span className={themeClasses.text}>{flightData.arrival.iata}</span>
              <span className={cn('text-xs opacity-60', themeClasses.text)}>{flightData.arrival.city}</span>
            </div>
          </div>
        </div>
      )}

      {/* Manual Route Entry */}
      <div className={cn('p-4 border-2 rounded', themeClasses.borderColor)}>
        <div className={cn('flex items-center gap-2 mb-3', themeClasses.headerText)}>
          <Route className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-mono font-bold uppercase">Manual Route Entry</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Departure Input */}
            <div className="flex-1">
              <label htmlFor="departure-code" className={cn('block text-xs font-mono mb-1 uppercase', themeClasses.text)}>
                Departure (ICAO)
              </label>
              <input
                id="departure-code"
                type="text"
                value={departureCode}
                onChange={(e) => setDepartureCode(e.target.value.toUpperCase())}
                placeholder="e.g. KLAX"
                maxLength={4}
                className={cn(
                  'w-full px-3 py-2 font-mono text-sm border-2 rounded bg-gray-900 uppercase',
                  themeClasses.borderColor,
                  themeClasses.text,
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500'
                )}
                data-testid="departure-input"
              />
            </div>

            <div className="hidden sm:flex items-end pb-2">
              <ArrowRight className="w-5 h-5 text-gray-500" />
            </div>

            {/* Arrival Input */}
            <div className="flex-1">
              <label htmlFor="arrival-code" className={cn('block text-xs font-mono mb-1 uppercase', themeClasses.text)}>
                Arrival (ICAO)
              </label>
              <input
                id="arrival-code"
                type="text"
                value={arrivalCode}
                onChange={(e) => setArrivalCode(e.target.value.toUpperCase())}
                placeholder="e.g. KJFK"
                maxLength={4}
                className={cn(
                  'w-full px-3 py-2 font-mono text-sm border-2 rounded bg-gray-900 uppercase',
                  themeClasses.borderColor,
                  themeClasses.text,
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500'
                )}
                data-testid="arrival-input"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isSearching || !departureCode || !arrivalCode}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2 font-mono text-sm font-bold border-2 rounded transition-colors',
              themeClasses.borderColor,
              isSearching || !departureCode || !arrivalCode
                ? 'opacity-50 cursor-not-allowed bg-gray-800'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400'
            )}
            data-testid="search-route-button"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching Route...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search Turbulence Along Route
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {searchError && (
        <div className={cn('p-3 border-2 border-red-500/50 bg-red-500/10 rounded', themeClasses.borderColor)}>
          <div className="flex items-center gap-2 text-red-500 font-mono text-sm">
            <AlertTriangle className="w-4 h-4" />
            {searchError}
          </div>
        </div>
      )}

      {/* Results Display */}
      {hasSearched && !searchError && (
        <div className={cn('p-4 border-2 rounded', themeClasses.borderColor)}>
          <div className="flex items-center justify-between mb-3">
            <div className={cn('flex items-center gap-2', themeClasses.headerText)}>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-mono font-bold uppercase">
                Turbulence Reports Along Route
              </span>
            </div>
            <button
              onClick={() => handleRouteSearch(departureCode, arrivalCode, flightData)}
              disabled={isSearching}
              className={cn(
                'p-1.5 border-2 rounded hover:bg-gray-700 transition-colors',
                themeClasses.borderColor,
                isSearching && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Refresh route data"
            >
              <RefreshCw className={cn('w-4 h-4', isSearching && 'animate-spin')} />
            </button>
          </div>

          {routePireps.length === 0 ? (
            <div className={cn('flex items-center gap-2 p-3 bg-green-500/10 rounded', themeClasses.text)}>
              <Info className="w-4 h-4 text-green-500" />
              <span className="font-mono text-sm">
                No significant turbulence reported along this route in the last 4 hours.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className={cn('text-xs font-mono mb-2', themeClasses.text)}>
                <span className={themeClasses.accentText}>{routePireps.length}</span> PIREPs found within 150nm of route
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {routePireps.map((pirep) => (
                  <div
                    key={pirep.id}
                    className={cn(
                      'p-3 border-2 rounded font-mono text-xs',
                      themeClasses.borderColor,
                      'bg-gray-900/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={getTurbulenceColor(pirep.turbulenceIntensity)}>
                          {pirep.turbulenceIntensity || 'SMOOTH'}
                        </span>
                        {pirep.turbulenceType && (
                          <span className="opacity-60">({pirep.turbulenceType})</span>
                        )}
                      </div>
                      <span className="opacity-60">{mounted ? formatTimeAgo(pirep.observationTime) : '...'}</span>
                    </div>
                    <div className="flex items-center gap-4 opacity-70">
                      <span>{formatAltitude(pirep.altitudeFt)}</span>
                      <span>
                        {Math.abs(pirep.latitude).toFixed(2)}{pirep.latitude >= 0 ? 'N' : 'S'}, {Math.abs(pirep.longitude).toFixed(2)}{pirep.longitude >= 0 ? 'E' : 'W'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className={cn('text-xs font-mono opacity-60 text-center', themeClasses.text)}>
        PIREP data from NOAA Aviation Weather Center - Updated every 5 minutes
      </div>
    </div>
  );
}

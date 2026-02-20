/**
 * 16-Bit Weather Platform - Flight Number Input Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Input component for searching flights by flight number (e.g., AA123)
 * Returns flight route data for turbulence lookup
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Search, Plane, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-state';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';

// Flight data interface matching the API response
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

interface FlightNumberInputProps {
  onFlightFound: (data: FlightData) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function FlightNumberInput({
  onFlightFound,
  onError,
  className,
}: FlightNumberInputProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');

  const [flightNumber, setFlightNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle flight number search
  const handleSearch = useCallback(async () => {
    const trimmed = flightNumber.trim();

    if (!trimmed) {
      const errMsg = 'Please enter a flight number';
      setError(errMsg);
      onError?.(errMsg);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/aviation/flight-lookup?flight=${encodeURIComponent(trimmed)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        const errMsg = result.error || 'Flight not found. Check the number and try again.';
        setError(errMsg);
        onError?.(errMsg);
        return;
      }

      // Success - pass flight data to parent
      onFlightFound(result.data);
      setFlightNumber(''); // Clear input on success
    } catch (err) {
      console.error('Flight lookup error:', err);
      const errMsg = 'Unable to search. Please try again.';
      setError(errMsg);
      onError?.(errMsg);
    } finally {
      setIsSearching(false);
    }
  }, [flightNumber, onFlightFound, onError]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle input change - clean up as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow letters, numbers, and spaces (will be cleaned on submit)
    const value = e.target.value.toUpperCase();
    setFlightNumber(value);
    // Clear error when user starts typing again
    if (error) {
      setError(null);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Flight Number Input */}
        <div className="relative flex-1">
          <Plane className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
            themeClasses.accentText
          )} />
          <input
            type="text"
            value={flightNumber}
            onChange={handleInputChange}
            placeholder="Enter flight e.g. AA123"
            maxLength={10}
            disabled={isSearching}
            className={cn(
              'w-full pl-10 pr-3 py-2 font-mono text-sm border-2 rounded bg-gray-900',
              themeClasses.borderColor,
              themeClasses.text,
              'focus:outline-none focus:ring-2 focus:ring-cyan-500',
              'placeholder:text-gray-500',
              isSearching && 'opacity-50 cursor-not-allowed'
            )}
            data-testid="flight-number-input"
            aria-label="Flight number"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isSearching || !flightNumber.trim()}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 font-mono text-sm font-bold border-2 rounded transition-colors min-w-[100px]',
            themeClasses.borderColor,
            isSearching || !flightNumber.trim()
              ? 'opacity-50 cursor-not-allowed bg-gray-800'
              : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400'
          )}
          data-testid="flight-search-button"
          aria-label="Search flight"
        >
          {isSearching ? (
            <>
              <LoadingSpinner size="sm" label="Searching flight" />
              <span className="hidden sm:inline">...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div
          className={cn(
            'flex items-center gap-2 p-2 text-xs font-mono rounded',
            'bg-red-500/10 text-red-400 border border-red-500/30'
          )}
          data-testid="flight-search-error"
          role="alert"
        >
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Help Text */}
      <div className={cn('text-xs font-mono opacity-50', themeClasses.text)}>
        Supported airlines: AA, UA, DL, WN, B6, AS, NK, F9, G4, HA
      </div>
    </div>
  );
}

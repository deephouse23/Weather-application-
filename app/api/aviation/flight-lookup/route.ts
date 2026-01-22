/**
 * 16-Bit Weather Platform - Flight Lookup API Route
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Looks up flight routes by flight number (e.g., AA123)
 * Returns departure/arrival airport data for turbulence lookup
 */

import { NextRequest, NextResponse } from 'next/server';

// Airline data interface
interface AirlineData {
  name: string;
  iata: string;
  icao: string;
}

// Airport data interface
interface AirportData {
  icao: string;
  iata: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
}

// Flight lookup response interface
export interface FlightLookupResponse {
  success: boolean;
  data?: {
    flightNumber: string;
    airline: AirlineData;
    departure: AirportData;
    arrival: AirportData;
    status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'diverted';
  };
  error?: string;
  errorCode?: 'INVALID_FLIGHT_NUMBER' | 'FLIGHT_NOT_FOUND' | 'RATE_LIMITED' | 'API_ERROR';
}

// Airline code mapping
const AIRLINES: Record<string, AirlineData> = {
  AA: { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
  UA: { name: 'United Airlines', iata: 'UA', icao: 'UAL' },
  DL: { name: 'Delta Air Lines', iata: 'DL', icao: 'DAL' },
  WN: { name: 'Southwest Airlines', iata: 'WN', icao: 'SWA' },
  B6: { name: 'JetBlue Airways', iata: 'B6', icao: 'JBU' },
  AS: { name: 'Alaska Airlines', iata: 'AS', icao: 'ASA' },
  NK: { name: 'Spirit Airlines', iata: 'NK', icao: 'NKS' },
  F9: { name: 'Frontier Airlines', iata: 'F9', icao: 'FFT' },
  G4: { name: 'Allegiant Air', iata: 'G4', icao: 'AAY' },
  HA: { name: 'Hawaiian Airlines', iata: 'HA', icao: 'HAL' },
};

// Airport data for popular airports
const AIRPORTS: Record<string, AirportData> = {
  LAX: { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', lat: 33.9425, lon: -118.408 },
  JFK: { icao: 'KJFK', iata: 'JFK', name: 'John F Kennedy International', city: 'New York', lat: 40.6413, lon: -73.7781 },
  ORD: { icao: 'KORD', iata: 'ORD', name: "O'Hare International", city: 'Chicago', lat: 41.9742, lon: -87.9073 },
  SFO: { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', lat: 37.6213, lon: -122.379 },
  DFW: { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', lat: 32.8998, lon: -97.0403 },
  DEN: { icao: 'KDEN', iata: 'DEN', name: 'Denver International', city: 'Denver', lat: 39.8561, lon: -104.6737 },
  ATL: { icao: 'KATL', iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', lat: 33.6407, lon: -84.4277 },
  SEA: { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', lat: 47.4502, lon: -122.3088 },
  MIA: { icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', lat: 25.7959, lon: -80.2870 },
  BOS: { icao: 'KBOS', iata: 'BOS', name: 'Logan International', city: 'Boston', lat: 42.3656, lon: -71.0096 },
  PHX: { icao: 'KPHX', iata: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', lat: 33.4373, lon: -112.0078 },
  LAS: { icao: 'KLAS', iata: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', lat: 36.0840, lon: -115.1537 },
  MSP: { icao: 'KMSP', iata: 'MSP', name: 'Minneapolis-Saint Paul International', city: 'Minneapolis', lat: 44.8848, lon: -93.2223 },
  DTW: { icao: 'KDTW', iata: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit', lat: 42.2162, lon: -83.3554 },
  EWR: { icao: 'KEWR', iata: 'EWR', name: 'Newark Liberty International', city: 'Newark', lat: 40.6895, lon: -74.1745 },
  IAH: { icao: 'KIAH', iata: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', lat: 29.9902, lon: -95.3368 },
  SAN: { icao: 'KSAN', iata: 'SAN', name: 'San Diego International', city: 'San Diego', lat: 32.7338, lon: -117.1933 },
  HNL: { icao: 'PHNL', iata: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', lat: 21.3187, lon: -157.9225 },
  MCO: { icao: 'KMCO', iata: 'MCO', name: 'Orlando International', city: 'Orlando', lat: 28.4312, lon: -81.3081 },
  CLT: { icao: 'KCLT', iata: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', lat: 35.2144, lon: -80.9473 },
};

// Mock flight routes for demo purposes
// Maps flight number patterns to routes
interface MockRoute {
  departure: string;
  arrival: string;
}

const MOCK_ROUTES: Record<string, MockRoute> = {
  // American Airlines
  'AA1': { departure: 'JFK', arrival: 'LAX' },
  'AA100': { departure: 'JFK', arrival: 'LAX' },
  'AA123': { departure: 'LAX', arrival: 'JFK' },
  'AA175': { departure: 'DFW', arrival: 'ORD' },
  'AA200': { departure: 'MIA', arrival: 'JFK' },
  'AA234': { departure: 'ORD', arrival: 'DFW' },
  'AA300': { departure: 'LAX', arrival: 'MIA' },
  'AA456': { departure: 'DFW', arrival: 'LAX' },
  'AA500': { departure: 'JFK', arrival: 'MIA' },
  'AA789': { departure: 'PHX', arrival: 'DFW' },
  // United Airlines
  'UA1': { departure: 'SFO', arrival: 'EWR' },
  'UA100': { departure: 'EWR', arrival: 'SFO' },
  'UA123': { departure: 'ORD', arrival: 'DEN' },
  'UA234': { departure: 'SFO', arrival: 'ORD' },
  'UA456': { departure: 'SFO', arrival: 'ORD' },
  'UA500': { departure: 'DEN', arrival: 'SFO' },
  'UA789': { departure: 'IAH', arrival: 'DEN' },
  // Delta Air Lines
  'DL1': { departure: 'JFK', arrival: 'LAX' },
  'DL100': { departure: 'ATL', arrival: 'LAX' },
  'DL123': { departure: 'JFK', arrival: 'ATL' },
  'DL234': { departure: 'ATL', arrival: 'JFK' },
  'DL456': { departure: 'MSP', arrival: 'ATL' },
  'DL500': { departure: 'DTW', arrival: 'ATL' },
  'DL789': { departure: 'SEA', arrival: 'ATL' },
  // Southwest Airlines
  'WN1': { departure: 'LAS', arrival: 'PHX' },
  'WN100': { departure: 'DEN', arrival: 'LAS' },
  'WN123': { departure: 'LAX', arrival: 'LAS' },
  'WN456': { departure: 'PHX', arrival: 'DEN' },
  'WN789': { departure: 'ORD', arrival: 'DEN' },
  // JetBlue Airways
  'B6100': { departure: 'JFK', arrival: 'BOS' },
  'B6123': { departure: 'BOS', arrival: 'JFK' },
  'B6456': { departure: 'JFK', arrival: 'MCO' },
  'B6789': { departure: 'BOS', arrival: 'MCO' },
  // Alaska Airlines
  'AS100': { departure: 'SEA', arrival: 'LAX' },
  'AS123': { departure: 'SEA', arrival: 'SFO' },
  'AS456': { departure: 'LAX', arrival: 'SEA' },
  // Hawaiian Airlines
  'HA100': { departure: 'HNL', arrival: 'LAX' },
  'HA123': { departure: 'HNL', arrival: 'SFO' },
  'HA456': { departure: 'LAX', arrival: 'HNL' },
};

// Parse flight number into airline code and number
function parseFlightNumber(input: string): { airlineCode: string; flightNum: string } | null {
  // Remove spaces and convert to uppercase
  const cleaned = input.replace(/\s+/g, '').toUpperCase();

  // Match pattern: 2 letters followed by 1-4 digits
  const match = cleaned.match(/^([A-Z]{2})(\d{1,4})$/);

  if (!match) {
    return null;
  }

  return {
    airlineCode: match[1],
    flightNum: match[2],
  };
}

// Generate a mock route for unknown flight numbers
function generateMockRoute(airlineCode: string, flightNum: string): MockRoute {
  // Use the flight number to deterministically select airports
  const num = parseInt(flightNum, 10);
  const airportKeys = Object.keys(AIRPORTS);

  // Create a pseudo-random but deterministic selection
  const depIndex = num % airportKeys.length;
  let arrIndex = (num * 7 + 3) % airportKeys.length;

  // Ensure different airports
  if (arrIndex === depIndex) {
    arrIndex = (arrIndex + 1) % airportKeys.length;
  }

  return {
    departure: airportKeys[depIndex],
    arrival: airportKeys[arrIndex],
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flightParam = searchParams.get('flight');

  // Validate flight parameter
  if (!flightParam) {
    return NextResponse.json<FlightLookupResponse>(
      {
        success: false,
        error: 'Flight number is required. Example: AA123, UA456',
        errorCode: 'INVALID_FLIGHT_NUMBER',
      },
      { status: 400 }
    );
  }

  // Parse the flight number
  const parsed = parseFlightNumber(flightParam);

  if (!parsed) {
    return NextResponse.json<FlightLookupResponse>(
      {
        success: false,
        error: 'Invalid flight number format. Use airline code + number (e.g., AA123, UA456)',
        errorCode: 'INVALID_FLIGHT_NUMBER',
      },
      { status: 400 }
    );
  }

  const { airlineCode, flightNum } = parsed;

  // Check if airline is known
  const airline = AIRLINES[airlineCode];

  if (!airline) {
    return NextResponse.json<FlightLookupResponse>(
      {
        success: false,
        error: `Unknown airline code: ${airlineCode}. Supported airlines: ${Object.keys(AIRLINES).join(', ')}`,
        errorCode: 'FLIGHT_NOT_FOUND',
      },
      { status: 404 }
    );
  }

  // Format flight number for lookup
  const formattedFlight = `${airlineCode}${flightNum}`;

  // Try to find a known mock route first
  let route = MOCK_ROUTES[formattedFlight];

  // If not found, generate a deterministic mock route
  if (!route) {
    route = generateMockRoute(airlineCode, flightNum);
  }

  // Get airport data
  const departure = AIRPORTS[route.departure];
  const arrival = AIRPORTS[route.arrival];

  if (!departure || !arrival) {
    return NextResponse.json<FlightLookupResponse>(
      {
        success: false,
        error: 'Flight not found. Check the flight number and try again.',
        errorCode: 'FLIGHT_NOT_FOUND',
      },
      { status: 404 }
    );
  }

  // Return successful response
  const response: FlightLookupResponse = {
    success: true,
    data: {
      flightNumber: formattedFlight,
      airline,
      departure,
      arrival,
      status: 'scheduled',
    },
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}

import { NextResponse } from 'next/server';

export async function GET() {
  // Server-side environment variable debugging
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ? 'SET' : 'MISSING',
    REACT_APP_OPENWEATHER_API_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY ? 'SET' : 'MISSING',
    NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY ? 'SET' : 'MISSING',
    REACT_APP_GOOGLE_POLLEN_API_KEY: process.env.REACT_APP_GOOGLE_POLLEN_API_KEY ? 'SET' : 'MISSING',
    finalOpenWeatherKey: (process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.REACT_APP_OPENWEATHER_API_KEY) ? 'SET' : 'MISSING',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('OPENWEATHER') || key.includes('POLLEN') || key.includes('NEXT_PUBLIC') || key.includes('REACT_APP'))
  };

  console.log('🔍 SERVER-SIDE ENVIRONMENT DEBUG:', envVars);

  return NextResponse.json({
    message: 'Environment variables test',
    timestamp: new Date().toISOString(),
    environment: envVars
  });
} 
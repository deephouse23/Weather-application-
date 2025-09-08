import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    env: {
      hasOpenWeatherKey: !!process.env.OPENWEATHER_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      note: "API keys are server-only for security (no NEXT_PUBLIC prefix)"
    },
    message: "Debug endpoint - check if environment variables are loaded"
  })
}
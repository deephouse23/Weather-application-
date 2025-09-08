/**
 * 16-Bit Weather Platform - BETA v0.5.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/user/preferences - Fetch user preferences
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefError && prefError.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', prefError)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      preferences: preferences || { 
        user_id: user.id, 
        theme: 'dark',
        temperature_unit: 'fahrenheit',
        wind_unit: 'mph',
        pressure_unit: 'hpa',
        auto_location: false,
        notifications_enabled: false,
        email_alerts: false,
        severe_weather_alerts: false,
        daily_forecast_email: false,
        news_ticker_enabled: true,
        animation_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } 
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      theme, 
      temperature_unit, 
      wind_unit, 
      pressure_unit,
      auto_location,
      notifications_enabled,
      email_alerts,
      severe_weather_alerts,
      daily_forecast_email,
      news_ticker_enabled,
      animation_enabled
    } = body

    // Validate theme if provided
    if (theme && !['dark', 'miami', 'tron'].includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }

    const updates: Record<string, string | boolean> = {}
    if (theme !== undefined) updates.theme = theme
    if (temperature_unit !== undefined) updates.temperature_unit = temperature_unit
    if (wind_unit !== undefined) updates.wind_unit = wind_unit
    if (pressure_unit !== undefined) updates.pressure_unit = pressure_unit
    if (auto_location !== undefined) updates.auto_location = auto_location
    if (notifications_enabled !== undefined) updates.notifications_enabled = notifications_enabled
    if (email_alerts !== undefined) updates.email_alerts = email_alerts
    if (severe_weather_alerts !== undefined) updates.severe_weather_alerts = severe_weather_alerts
    if (daily_forecast_email !== undefined) updates.daily_forecast_email = daily_forecast_email
    if (news_ticker_enabled !== undefined) updates.news_ticker_enabled = news_ticker_enabled
    if (animation_enabled !== undefined) updates.animation_enabled = animation_enabled

    const { data: updatedPreferences, error: updateError } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating user preferences:', updateError)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ preferences: updatedPreferences })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

// POST /api/user/preferences - Create initial user preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { theme = 'dark', temperature_unit = 'fahrenheit' } = body

    // Create initial preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        theme,
        temperature_unit,
        wind_unit: 'mph',
        pressure_unit: 'hpa',
        auto_location: false,
        notifications_enabled: false,
        email_alerts: false,
        severe_weather_alerts: false,
        daily_forecast_email: false,
        news_ticker_enabled: true,
        animation_enabled: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user preferences:', error)
      return NextResponse.json(
        { error: 'Failed to create preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ preferences: data })
  } catch (error) {
    console.error('Error creating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to create preferences' },
      { status: 500 }
    )
  }
}
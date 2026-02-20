/**
 * 16-Bit Weather Platform - v1.0.0
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
import {
  updatePreferencesSchema,
  createPreferencesSchema,
  formatValidationErrors,
} from '@/lib/validations/preferences'

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
        theme: 'nord',
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

    // Validate input with Zod schema
    const parseResult = updatePreferencesSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatValidationErrors(parseResult.error), { status: 400 })
    }

    // Build updates object with only defined fields
    const validatedData = parseResult.data
    const updates: Record<string, string | boolean> = {}
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        updates[key] = value
      }
    }

    const { data: updatedPreferences, error: updateError } = await supabase
      .from('user_preferences')
      // @ts-expect-error - Table definition mismatch
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

    // Validate input with Zod schema (applies defaults)
    const parseResult = createPreferencesSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatValidationErrors(parseResult.error), { status: 400 })
    }

    const { theme, temperature_unit } = parseResult.data

    // Create initial preferences
    const { data, error } = await supabase
      .from('user_preferences')
      // @ts-expect-error - Table definition mismatch
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
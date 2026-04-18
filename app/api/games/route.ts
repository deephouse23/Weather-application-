/**
 * 16-Bit Weather Platform - Games API
 *
 * GET /api/games - List all active games
 * POST /api/games - Create new game (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Game, GamesFilters } from '@/lib/types/games';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');

    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    if (search) {
      // Escape PostgREST filter special characters to prevent query injection
      const sanitized = search.replace(/[%_,().\\]/g, c => '\\' + c);
      query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching games:', error);
      return NextResponse.json(
        { error: 'Failed to fetch games' },
        { status: 500 }
      );
    }

    return NextResponse.json({ games: data as Game[] });
  } catch (error) {
    console.error('Unexpected error fetching games:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Verify user identity server-side (getUser validates the JWT)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enforce admin role — must match RLS policy: auth.jwt() ->> 'role' = 'admin'
    // In Supabase, JWT 'role' claim is sourced from app_metadata
    if (user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, title, description, category, difficulty, icon_emoji, html_file, featured } = body;

    // Validate required fields
    if (!slug || !title || !category || !html_file) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, category, html_file' },
        { status: 400 }
      );
    }

    // Insert new game
    const { data, error } = await supabase
      .from('games')
      // @ts-expect-error - Table definition mismatch
      .insert({
        slug,
        title,
        description,
        category,
        difficulty,
        icon_emoji,
        html_file,
        featured: featured || false,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game:', error);
      return NextResponse.json(
        { error: 'Failed to create game' },
        { status: 500 }
      );
    }

    return NextResponse.json({ game: data as Game }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

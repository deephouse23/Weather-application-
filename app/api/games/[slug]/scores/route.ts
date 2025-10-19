/**
 * 16-Bit Weather Platform - Game Scores API
 *
 * GET /api/games/[slug]/scores - Get leaderboard for a game
 * POST /api/games/[slug]/scores - Submit a new score
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GameScore, LeaderboardEntry, ScoreSubmission } from '@/lib/types/games';

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all-time';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createClient();

    // First, get the game ID from slug
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Determine which view to use based on period
    let viewName = 'leaderboard_all_time';
    if (period === 'daily') {
      viewName = 'leaderboard_daily';
    } else if (period === 'weekly') {
      viewName = 'leaderboard_weekly';
    }

    // Query the appropriate leaderboard view
    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .eq('game_id', game.id)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    return NextResponse.json({ scores: data as LeaderboardEntry[], period });
  } catch (error) {
    console.error('Unexpected error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const supabase = createClient();

    // Get the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, slug, title')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const body: ScoreSubmission = await request.json();
    const { player_name, score, level_reached, time_played_seconds, metadata } = body;

    // Validate required fields
    if (!player_name || score === undefined || score === null) {
      return NextResponse.json(
        { error: 'Missing required fields: player_name, score' },
        { status: 400 }
      );
    }

    // Validate score is a positive number
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Score must be a non-negative number' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const is_guest = !session;
    const user_id = session?.user?.id || null;

    // Rate limiting for guests (check IP)
    if (is_guest) {
      const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

      // Check how many scores this IP has submitted today for this game
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error: countError } = await supabase
        .from('game_scores')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', game.id)
        .eq('ip_address', ip_address)
        .gte('created_at', today.toISOString());

      if (countError) {
        console.error('Error checking rate limit:', countError);
      } else if (count !== null && count >= 10) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Maximum 10 scores per game per day for guests.' },
          { status: 429 }
        );
      }

      // Insert score with IP address for guests
      const { data, error } = await supabase
        .from('game_scores')
        .insert({
          game_id: game.id,
          user_id: null,
          player_name: player_name.substring(0, 20), // Limit name length
          score,
          level_reached,
          time_played_seconds,
          is_guest: true,
          metadata: metadata || {},
          ip_address,
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting guest score:', error);
        return NextResponse.json(
          { error: 'Failed to submit score', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ score: data as GameScore, message: 'Score submitted successfully' }, { status: 201 });
    } else {
      // Authenticated user
      const { data, error } = await supabase
        .from('game_scores')
        .insert({
          game_id: game.id,
          user_id,
          player_name: player_name.substring(0, 20),
          score,
          level_reached,
          time_played_seconds,
          is_guest: false,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting user score:', error);
        return NextResponse.json(
          { error: 'Failed to submit score', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ score: data as GameScore, message: 'Score submitted successfully' }, { status: 201 });
    }
  } catch (error) {
    console.error('Unexpected error submitting score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

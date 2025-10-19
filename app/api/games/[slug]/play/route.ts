/**
 * 16-Bit Weather Platform - Game Play Counter API
 *
 * POST /api/games/[slug]/play - Increment play count
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const supabase = createClient();

    // Call the increment_play_count function
    const { error } = await supabase.rpc('increment_play_count', {
      game_slug: slug,
    });

    if (error) {
      console.error('Error incrementing play count:', error);
      return NextResponse.json(
        { error: 'Failed to increment play count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Play count incremented' });
  } catch (error) {
    console.error('Unexpected error incrementing play count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

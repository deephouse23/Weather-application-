/**
 * 16-Bit Weather Platform - Game Play Counter API
 *
 * POST /api/games/[slug]/play - Increment play count
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createServerSupabaseClient();

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

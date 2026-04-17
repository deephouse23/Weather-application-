/**
 * 16-Bit Weather Platform - Game Detail Page (Server Component)
 *
 * Server-rendered metadata + static params for SEO. Fetches game by slug
 * server-side so Googlebot sees real title/description in the initial HTML.
 * Interactive UI (iframe, leaderboard, score modal) is in the client component.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Game } from '@/lib/types/games';
import GameDetailClient from './game-detail-client';

const BASE_URL = 'https://www.16bitweather.co';

async function getGameBySlug(slug: string): Promise<Game | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data as Game;
  } catch {
    return null;
  }
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from('games')
      .select('slug')
      .eq('is_active', true);

    return (data || []).map((g: { slug: string }) => ({ slug: g.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: 'Game Not Found | 16 Bit Weather Arcade',
      robots: { index: false, follow: false },
    };
  }

  const pageTitle = `${game.title} - Play Free Online | 16 Bit Weather Arcade`;
  const description =
    game.description ||
    `Play ${game.title} free online on the 16 Bit Weather Arcade. Compete for high scores on the live leaderboard.`;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: `${BASE_URL}/games/${slug}` },
    openGraph: {
      title: pageTitle,
      description,
      url: `${BASE_URL}/games/${slug}`,
      siteName: '16 Bit Weather',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
    },
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return <GameDetailClient game={game} slug={slug} />;
}

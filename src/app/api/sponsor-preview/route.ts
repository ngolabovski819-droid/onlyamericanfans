import { NextResponse } from 'next/server';
import { SEARCH_SPONSOR_USERNAMES } from '@/config/search-sponsor';
import { getSponsorOverride } from '@/config/sponsor-overrides';
import { fetchCreatorsByUsernames } from '@/lib/supabase';

export const runtime = 'nodejs';

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
};

export async function GET() {
  if (SEARCH_SPONSOR_USERNAMES.length === 0) {
    return NextResponse.json([], { headers: CACHE_HEADERS });
  }

  const creators = await fetchCreatorsByUsernames(SEARCH_SPONSOR_USERNAMES);
  const byUsername = new Map(creators.map((creator) => [creator.username.toLowerCase(), creator]));
  const ordered = SEARCH_SPONSOR_USERNAMES.flatMap((username) => {
    const creator = byUsername.get(username.toLowerCase());
    if (!creator) return [];
    const override = getSponsorOverride(creator.username);
    return [{
      ...creator,
      ...(override?.imageOverride ? { imageOverride: override.imageOverride } : {}),
      sponsorTracked: true,
    }];
  });

  return NextResponse.json(ordered, { headers: CACHE_HEADERS });
}

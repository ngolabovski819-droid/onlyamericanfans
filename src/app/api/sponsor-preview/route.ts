import { NextResponse } from 'next/server';
import { SEARCH_SPONSOR_USERNAME } from '@/config/search-sponsor';
import { getSponsorOverride } from '@/config/sponsor-overrides';
import { fetchCreatorsByUsernames } from '@/lib/supabase';

export const runtime = 'nodejs';

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
};

export async function GET() {
  if (!SEARCH_SPONSOR_USERNAME) {
    return NextResponse.json(null, { headers: CACHE_HEADERS });
  }

  const [creator] = await fetchCreatorsByUsernames([SEARCH_SPONSOR_USERNAME]);
  if (!creator) {
    return NextResponse.json(null, { headers: CACHE_HEADERS });
  }

  const override = getSponsorOverride(creator.username);
  return NextResponse.json(
    {
      ...creator,
      ...(override?.imageOverride ? { imageOverride: override.imageOverride } : {}),
      sponsorTracked: true,
    },
    { headers: CACHE_HEADERS }
  );
}

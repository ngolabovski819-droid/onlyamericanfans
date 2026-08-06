import { NextRequest, NextResponse } from 'next/server';
import { getSponsorOverride } from '@/config/sponsor-overrides';
import { isBotUserAgent } from '@/lib/bot-detection';
import { derivePlacement } from '@/lib/placement';
import { extractClientIp, hashIp, isDatacenterIp, isRateLimited } from '@/lib/click-integrity';
import { verifyClickToken } from '@/lib/click-token';

// Identifies THIS site's rows in a click table — matters whenever a clickTable is shared with
// another property's own redirect (see sponsor_clicks_emilylopz: it already existed before this
// system did, is actively written to by fanspedia.net's own /go/ redirect, and has no site column
// of its own — see supabase-migrations/004_sponsor_clicks_emilylopz_add_site.sql).
const SITE_ID = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com').hostname.replace(/^www\./, '');
  } catch {
    return 'onlyamericanfans.com';
  }
})();

// nodejs runtime — same reason as api/search: needs full Node fetch behaviour talking to Supabase.
export const runtime = 'nodejs';

interface Params {
  params: Promise<{ username: string }>;
}

/**
 * Generic click-tracking redirect. Every sponsored card/CTA that has a sponsor-overrides.ts
 * entry links here instead of straight to OnlyFans, so a click can be logged before the visitor
 * leaves the site.
 *
 * GOTCHA 1 — never link to this route with rel="noreferrer". That stops the browser sending a
 * Referer to THIS route (not to OnlyFans), silently zeroing out placement attribution for the
 * site's own internal traffic. Use noopener/nofollow(+sponsored) instead.
 *
 * GOTCHA 2 — never wrap this href in a <Link prefetch> without prefetch={false}. Next.js
 * prefetches same-origin <Link>s as they scroll into view, which would fire this route (and
 * therefore the click-log insert) on page load, before a real click ever happens. CreatorCard
 * deliberately renders a plain <a> here — Next.js only prefetches its own <Link> component, so a
 * raw anchor has no prefetch behavior to disable in the first place. If this ever gets ported to
 * <Link>, prefetch={false} is mandatory.
 *
 * The redirect itself is a 307 with Cache-Control: no-store — a cached redirect would mean the
 * browser stops round-tripping through this route (and therefore stops logging clicks, and stops
 * picking up a changed linkOverride) after the very first visit.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { username } = await params;
  const override = getSponsorOverride(username);
  const destination = override?.linkOverride ?? `https://onlyfans.com/${encodeURIComponent(username)}`;

  if (override?.clickTable) {
    const userAgent = req.headers.get('user-agent');
    if (!isBotUserAgent(userAgent)) {
      const referrer = req.headers.get('referer');
      const placement = derivePlacement(referrer, req.nextUrl.host);
      const clientIp = extractClientIp(req.headers.get('x-forwarded-for'));
      // Awaited (not fire-and-forget): click accuracy for a paid deliverable matters more than
      // shaving the ~50-100ms an insert takes, and an un-awaited promise can be killed by the
      // runtime once the response is sent.
      try {
        await logClick(override.clickTable, {
          username,
          userAgent: userAgent ?? '',
          referrer: referrer ?? null,
          placement,
          clientIp,
          linkToken: req.nextUrl.searchParams.get('t'),
        });
      } catch (err) {
        console.error(`[/go/${username}] click log failed:`, err);
      }
    }
  }

  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: destination,
      'Cache-Control': 'no-store',
    },
  });
}

async function logClick(
  clickTable: string,
  row: {
    username: string;
    userAgent: string;
    referrer: string | null;
    placement: string | null;
    clientIp: string | null;
    linkToken: string | null;
  }
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  // clickTable only ever comes from our own sponsor-overrides.ts config, but sanitize defensively
  // before splicing it into the REST path.
  const safeTable = clickTable.replace(/[^a-z0-9_]/gi, '');
  if (!safeTable) return;

  const salt = process.env.CLICK_IP_SALT;
  const ipHash = row.clientIp && salt ? hashIp(row.clientIp, salt) : null;
  const tokenSecret = process.env.CLICK_TOKEN_SECRET;
  const linkVerified = tokenSecret ? verifyClickToken(row.linkToken, row.username, tokenSecret) : false;

  // Same IP hammering this exact link is a script, whatever UA it claims — checked before
  // logging so a rate-limited hit still gets its redirect (in the caller) but never counts.
  if (ipHash) {
    const rateLimited = await isRateLimited({
      supabaseUrl,
      supabaseKey,
      table: safeTable,
      timestampColumn: 'clicked_at',
      ipHash,
    });
    if (rateLimited) return;
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/${safeTable}`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'public',
      'Content-Profile': 'public',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      clicked_at: new Date().toISOString(),
      site: SITE_ID,
      user_agent: row.userAgent,
      referrer: row.referrer,
      placement: row.placement,
      ip_hash: ipHash,
      is_datacenter_ip: isDatacenterIp(row.clientIp),
      link_verified: linkVerified,
    }),
  });
  if (!res.ok) {
    // Most commonly: the clickTable doesn't exist yet (migration not run). Redirect must still
    // succeed either way — this only affects observability, not the visitor.
    throw new Error(`insert into ${safeTable} failed: ${res.status} ${await res.text()}`);
  }
}

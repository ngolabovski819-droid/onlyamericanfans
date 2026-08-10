import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { to as copyTo, from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'node:stream/promises';

export const runtime = 'nodejs'; // pg/pg-copy-streams need Node, not edge
export const maxDuration = 300; // manual backfill took ~160-190s on ~214k rows

/**
 * Refreshes the lean, US-only onlyfans_profiles table (the dedicated project this app now reads
 * from) from the source (shared, scraper-fed) project's real onlyfans_profiles table.
 *
 * Same mechanism as scripts/sync-lean-creators.mjs (that script is what ran the one-off initial
 * backfill by hand) — streams a filtered/projected COPY directly Postgres-to-Postgres via a
 * staging table + atomic rename, so this table is never queried half-populated mid-sync. See
 * that script's comments for why this is COPY-based rather than paginated REST calls (no JSON
 * overhead, no risk of a slow paginated loop exceeding this route's execution time), and why the
 * sync is a full re-copy rather than incremental (no reliable "last changed" column confirmed to
 * exist on the source; at this row count a full pass is simple, robust, and fast enough that
 * change-tracking isn't worth the complexity).
 *
 * Triggered on a schedule by vercel.json's cron entry, which Vercel authenticates automatically
 * via an `Authorization: Bearer $CRON_SECRET` header — the check below is exactly that Vercel
 * Cron convention, not custom logic.
 */

// Same US_TERMS list as src/config/us-terms.ts — this route runs standalone in a serverless
// function, so it's kept as a plain literal here rather than importing the config module, same
// reasoning as scripts/sync-lean-creators.mjs.
const US_TERMS = [
  'usa', 'us', 'united states', 'america', 'american',
  'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
  'miami', 'dallas', 'san diego', 'las vegas', 'atlanta',
  'seattle', 'boston', 'denver', 'nashville', 'austin',
  'san francisco', 'philadelphia', 'portland', 'minneapolis',
  'california', 'texas', 'florida', 'new york state',
];

// Sponsor-pinned creators (src/config/sponsor-overrides.ts) must never be silently dropped by
// the location filter — confirmed via the source DB that all 3 have a blank `location` field.
// Keep this list in sync with sponsor-overrides.ts's "Active campaigns" whenever a new paid
// placement is added.
const ALWAYS_INCLUDE_USERNAMES = ['emilylopz', 'rocketreynaxo', 'hannazuki'];

const COLUMNS = [
  'id', 'username', 'name', 'about', 'location', 'avatar', 'avatar_c144', 'header',
  'isverified', 'subscribeprice', 'photoscount', 'videoscount', 'postscount',
  'subscriberscount', 'favoritedcount',
  'bundle1_price', 'bundle1_duration', 'bundle1_discount',
  'bundle2_price', 'bundle2_duration', 'bundle2_discount',
  'bundle3_price', 'bundle3_duration', 'bundle3_discount',
  'promotion1_price', 'promotion1_discount',
  'first_seen_at', 'showsubscriberscount',
  'finishedstreamscount', 'audioscount', 'archivedpostscount',
];

function buildWhereClause(): string {
  // US_TERMS and ALWAYS_INCLUDE_USERNAMES are both fixed, developer-authored constants (not
  // user/request input), so plain string interpolation here is safe — same trust boundary as
  // any other hardcoded SQL in this repo's migration files.
  const locationOr = US_TERMS
    .map((t) => `location ILIKE '%${t.replace(/'/g, "''")}%'`)
    .join(' OR ');
  const alwaysIncludeList = ALWAYS_INCLUDE_USERNAMES
    .map((u) => `'${u.replace(/'/g, "''")}'`)
    .join(', ');
  return `isperformer = true AND ((${locationOr}) OR username IN (${alwaysIncludeList}))`;
}

async function runSync(): Promise<{ rows: number; seconds: number }> {
  const sourceUrl = process.env.SOURCE_SUPABASE_POOLER_URL;
  const destUrl = process.env.LEAN_SUPABASE_POOLER_URL;
  if (!sourceUrl || !destUrl) {
    throw new Error('Missing SOURCE_SUPABASE_POOLER_URL / LEAN_SUPABASE_POOLER_URL env vars');
  }

  const source = new Client({ connectionString: sourceUrl });
  const dest = new Client({ connectionString: destUrl });
  await source.connect();
  await dest.connect();

  try {
    // Both projects have a default statement_timeout that would otherwise kill a COPY this size
    // partway through — same fix as the manual index builds/backfill.
    await source.query('SET statement_timeout = 0');
    await dest.query('SET statement_timeout = 0');

    const staging = 'onlyfans_profiles_staging';
    await dest.query(`DROP TABLE IF EXISTS ${staging}`);
    await dest.query(`CREATE TABLE ${staging} (LIKE onlyfans_profiles INCLUDING ALL)`);

    const selectSql = `COPY (SELECT ${COLUMNS.join(', ')} FROM onlyfans_profiles WHERE ${buildWhereClause()}) TO STDOUT WITH CSV`;
    const copyOutStream = source.query(copyTo(selectSql));
    const copyInStream = dest.query(copyFrom(`COPY ${staging} (${COLUMNS.join(', ')}) FROM STDIN WITH CSV`));

    const start = Date.now();
    await pipeline(copyOutStream, copyInStream);
    const seconds = (Date.now() - start) / 1000;

    const { rows } = await dest.query(`SELECT count(*)::int AS n FROM ${staging}`);
    const rowCount = rows[0].n;

    // TRUNCATE + INSERT...SELECT, not DROP + RENAME: search_creators_capped() has `RETURNS
    // SETOF onlyfans_profiles`, a real dependency on this specific table's identity — dropping
    // it would break that function (confirmed: DROP TABLE correctly refused with "other objects
    // depend on it" the first time this ran end-to-end). TRUNCATE+INSERT keeps the table's
    // identity (and everything depending on it — the function, the location index) intact across
    // every sync, while the whole refresh still happens inside one transaction, so a concurrent
    // reader only ever sees either the complete old data or the complete new data, never a gap.
    await dest.query('BEGIN');
    await dest.query('TRUNCATE onlyfans_profiles');
    await dest.query(`INSERT INTO onlyfans_profiles SELECT ${COLUMNS.join(', ')} FROM ${staging}`);
    await dest.query('COMMIT');
    await dest.query(`DROP TABLE ${staging}`);

    return { rows: rowCount, seconds };
  } finally {
    await source.end();
    await dest.end();
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSync();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('sync-creators cron failed:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

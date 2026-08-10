// Backfills / re-syncs the lean, US-only onlyfans_profiles table on the dedicated project from
// the source (shared) project's real onlyfans_profiles table.
//
// Streams a filtered/projected COPY directly from the source Postgres connection into the
// destination Postgres connection (no JSON/REST overhead, no row-count-dependent timeout risk)
// via a staging table + atomic rename, so the destination table is never queried half-populated
// mid-sync.
//
// Run manually: node scripts/sync-lean-creators.mjs
// (Reads SOURCE_SUPABASE_POOLER_URL / LEAN_SUPABASE_POOLER_URL from .env.local)

import { Client } from 'pg';
import { to as copyTo, from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'node:stream/promises';
import fs from 'node:fs';

function loadEnvLocal() {
  const raw = fs.readFileSync('.env.local', 'utf8').replace(/^﻿/, '');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

// Same list as src/config/us-terms.ts — kept in sync manually since this script runs outside
// the Next.js/TypeScript build (plain Node script, no bundler/path aliases available).
const US_TERMS = [
  'usa', 'us', 'united states', 'america', 'american',
  'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
  'miami', 'dallas', 'san diego', 'las vegas', 'atlanta',
  'seattle', 'boston', 'denver', 'nashville', 'austin',
  'san francisco', 'philadelphia', 'portland', 'minneapolis',
  'california', 'texas', 'florida', 'new york state',
];

// Same 31 columns the lean table was created with — see the migration plan.
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

// Sponsor-pinned creators (src/config/sponsor-overrides.ts) must never be silently dropped by
// the location filter — confirmed via the source DB that all 3 have a blank `location` field
// (their placement is pinned to exact positions regardless of ranking, so nothing about the
// existing site ever needed that field populated). Keep this list in sync with
// sponsor-overrides.ts's "Active campaigns" whenever a new paid placement is added.
const ALWAYS_INCLUDE_USERNAMES = ['emilylopz', 'rocketreynaxo', 'hannazuki'];

function buildWhereClause() {
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

async function main() {
  loadEnvLocal();
  const sourceUrl = process.env.SOURCE_SUPABASE_POOLER_URL;
  const destUrl = process.env.LEAN_SUPABASE_POOLER_URL;
  if (!sourceUrl || !destUrl) {
    throw new Error('Missing SOURCE_SUPABASE_POOLER_URL / LEAN_SUPABASE_POOLER_URL in .env.local');
  }

  const source = new Client({ connectionString: sourceUrl });
  const dest = new Client({ connectionString: destUrl });
  await source.connect();
  await dest.connect();
  // Both projects have a default statement_timeout (confirmed ~8s on the source project) that
  // would otherwise kill a COPY this size partway through — same fix as tonight's index builds.
  await source.query('SET statement_timeout = 0');
  await dest.query('SET statement_timeout = 0');
  console.log('Connected to both projects.');

  const staging = 'onlyfans_profiles_staging';
  await dest.query(`DROP TABLE IF EXISTS ${staging}`);
  await dest.query(`CREATE TABLE ${staging} (LIKE onlyfans_profiles INCLUDING ALL)`);
  console.log('Staging table created.');

  const selectSql = `COPY (SELECT ${COLUMNS.join(', ')} FROM onlyfans_profiles WHERE ${buildWhereClause()}) TO STDOUT WITH CSV`;
  const copyOutStream = source.query(copyTo(selectSql));
  const copyInStream = dest.query(copyFrom(`COPY ${staging} (${COLUMNS.join(', ')}) FROM STDIN WITH CSV`));

  console.log('Streaming rows from source to staging...');
  const start = Date.now();
  await pipeline(copyOutStream, copyInStream);
  console.log(`Transfer finished in ${((Date.now() - start) / 1000).toFixed(1)}s.`);

  const { rows } = await dest.query(`SELECT count(*)::int AS n FROM ${staging}`);
  console.log(`Staging table has ${rows[0].n} rows.`);

  // TRUNCATE + INSERT...SELECT, not DROP + RENAME — see the comment in
  // src/app/api/cron/sync-creators/route.ts for why (search_creators_capped() depends on this
  // table's identity; dropping it breaks the function).
  await dest.query('BEGIN');
  await dest.query('TRUNCATE onlyfans_profiles');
  await dest.query(`INSERT INTO onlyfans_profiles SELECT ${COLUMNS.join(', ')} FROM ${staging}`);
  await dest.query('COMMIT');
  await dest.query(`DROP TABLE ${staging}`);
  console.log('Refreshed onlyfans_profiles from staging.');

  await source.end();
  await dest.end();
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Builds and atomically publishes one immutable directory-stat snapshot.
 *
 * Prerequisite: apply supabase-migrations/005_directory_location_stats.sql.
 * Run from the repository root with Node 22+:
 *
 *   node --experimental-strip-types scripts/refresh-location-stats.mjs --include-all-scopes
 *   node --experimental-strip-types scripts/refresh-location-stats.mjs # national + states only
 *   node --experimental-strip-types scripts/refresh-location-stats.mjs --dry-run
 *   # --cutoff=<ISO timestamp> is accepted only for a near-current controlled run.
 *
 * The RPC itself is one transaction. If it errors or times out, Postgres rolls
 * the new snapshot back and the previously published snapshot remains current.
 */

import fs from 'node:fs';
import process from 'node:process';

import { cities } from '../src/config/cities.ts';
import { regions } from '../src/config/regions.ts';
import { states } from '../src/config/states.ts';

const METHODOLOGY_VERSION = 'location-stats-v2';
const FRESHNESS_WINDOW_DAYS = 30;
const RPC_TIMEOUT_MS = 15 * 60 * 1000;

function loadLocalEnv() {
  if (!fs.existsSync('.env.local')) return;

  const source = fs.readFileSync('.env.local', 'utf8').replace(/^\uFEFF/, '');
  for (const line of source.split(/\r?\n/)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*=/.test(line)) continue;
    const separator = line.indexOf('=');
    const name = line.slice(0, separator);
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  const cutoffArg = process.argv.slice(2).find((arg) => arg.startsWith('--cutoff='));
  const unknown = process.argv
    .slice(2)
    .filter(
      (arg) =>
        arg !== '--dry-run' &&
        arg !== '--include-all-scopes' &&
        !arg.startsWith('--cutoff='),
    );

  if (unknown.length > 0) {
    throw new Error(`Unknown argument(s): ${unknown.join(', ')}`);
  }

  const cutoff = cutoffArg ? cutoffArg.slice('--cutoff='.length) : new Date().toISOString();
  const parsedCutoff = new Date(cutoff);
  if (!Number.isFinite(parsedCutoff.getTime())) {
    throw new Error(`Invalid --cutoff value: ${cutoff}`);
  }
  if (parsedCutoff.getTime() > Date.now() + 5 * 60 * 1000) {
    throw new Error('The snapshot cutoff cannot be more than five minutes in the future.');
  }
  if (parsedCutoff.getTime() < Date.now() - 10 * 60 * 1000) {
    throw new Error('The snapshot cutoff cannot be backdated by more than ten minutes.');
  }

  return {
    dryRun: args.has('--dry-run'),
    includeAllScopes: args.has('--include-all-scopes'),
    cutoff: parsedCutoff.toISOString(),
  };
}

function normalizeTerms(terms, identity) {
  const normalized = [...new Set(terms.map((term) => term.trim().toLowerCase()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  if (normalized.length === 0) throw new Error(`${identity} has no location terms.`);
  const wildcard = normalized.find((term) => term.includes('%') || term.includes('_'));
  if (wildcard) {
    throw new Error(`${identity} contains a SQL wildcard character in term "${wildcard}".`);
  }
  const tooShort = normalized.find((term) => term.length < 3);
  if (tooShort) {
    throw new Error(`${identity} contains a term shorter than three characters: "${tooShort}".`);
  }
  return normalized;
}

function validateCityTermAmbiguity() {
  const owners = new Map();
  for (const city of cities) {
    for (const term of normalizeTerms(city.terms, `city:${city.slug}`)) {
      const existing = owners.get(term) ?? [];
      existing.push({ slug: city.slug, parentState: city.parentState });
      owners.set(term, existing);
    }
  }

  const crossStateCollisions = [...owners.entries()].filter(([, matches]) => (
    new Set(matches.map((match) => match.parentState)).size > 1
  ));
  if (crossStateCollisions.length > 0) {
    const preview = crossStateCollisions
      .slice(0, 8)
      .map(([term, matches]) => `${term}: ${matches.map((match) => `${match.slug}/${match.parentState}`).join(', ')}`)
      .join('; ');
    throw new Error(`Ambiguous city terms cross state boundaries: ${preview}`);
  }
}

function buildScopes(includeAllScopes) {
  validateCityTermAmbiguity();
  const coreScopes = [
    {
      scope_type: 'national',
      scope_slug: 'united-states',
      label: 'United States',
      url_slug: 'browse-by-state',
      parent_state_slug: null,
      member_state_slugs: [],
      abbreviation: 'US',
      terms: [],
      sort_order: 0,
    },
    ...states.map((state, index) => ({
      scope_type: 'state',
      scope_slug: state.slug,
      label: state.label,
      url_slug: state.urlSlug,
      parent_state_slug: null,
      member_state_slugs: [],
      abbreviation: state.abbr,
      terms: normalizeTerms(state.terms, `state:${state.slug}`),
      sort_order: index,
    })),
  ];

  const extendedScopes = [
    ...regions.map((region, index) => ({
      scope_type: 'region',
      scope_slug: region.slug,
      label: region.label,
      url_slug: region.urlSlug,
      parent_state_slug: null,
      member_state_slugs: region.stateSlugs,
      abbreviation: region.abbr,
      terms: normalizeTerms(region.terms, `region:${region.slug}`),
      sort_order: index,
    })),
    ...cities.map((city, index) => ({
      scope_type: 'city',
      scope_slug: city.slug,
      label: city.label,
      url_slug: city.urlSlug,
      parent_state_slug: city.parentState,
      member_state_slugs: [],
      abbreviation: null,
      terms: normalizeTerms(city.terms, `city:${city.slug}`),
      sort_order: index,
    })),
  ];
  const scopes = includeAllScopes ? [...coreScopes, ...extendedScopes] : coreScopes;

  const keys = new Set();
  for (const scope of scopes) {
    const key = `${scope.scope_type}:${scope.scope_slug}`;
    if (keys.has(key)) throw new Error(`Duplicate location-stat scope: ${key}`);
    keys.add(key);
  }

  if (states.length !== 50) {
    throw new Error(`Expected 50 state configs, found ${states.length}.`);
  }
  for (const city of includeAllScopes ? cities : []) {
    if (!keys.has(`state:${city.parentState}`)) {
      throw new Error(`city:${city.slug} references missing state:${city.parentState}.`);
    }
  }

  return scopes;
}

function supabaseHeaders(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Accept-Profile': 'public',
    'Content-Profile': 'public',
    ...extra,
  };
}

async function refreshSnapshot({ supabaseUrl, supabaseKey, scopes, cutoff }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/refresh_directory_location_stats`,
      {
        method: 'POST',
        headers: supabaseHeaders(supabaseKey, {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          p_scopes: scopes,
          p_cutoff: cutoff,
          p_methodology_version: METHODOLOGY_VERSION,
          p_freshness_window_days: FRESHNESS_WINDOW_DAYS,
        }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Snapshot RPC exceeded the 15-minute client timeout. The transaction was not published.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.text();
  if (!response.ok) {
    const migrationHint = response.status === 404
      ? ' Apply migration 005 and, if needed, reload the PostgREST schema cache.'
      : '';
    throw new Error(`Snapshot RPC failed (${response.status}): ${body.slice(0, 1000)}${migrationHint}`);
  }

  const snapshotId = Number(JSON.parse(body));
  if (!Number.isSafeInteger(snapshotId) || snapshotId < 1) {
    throw new Error(`Snapshot RPC returned an invalid id: ${body.slice(0, 200)}`);
  }
  return snapshotId;
}

async function fetchPublishedSummary({ supabaseUrl, supabaseKey, snapshotId }) {
  const query = new URLSearchParams({
    select: [
      'snapshot_id',
      'cutoff_at',
      'completed_at',
      'content_changed_at',
      'scope_type',
      'scope_slug',
      'active_count',
      'verified_count',
      'free_count',
      'price_known_count',
      'median_paid_price',
    ].join(','),
    snapshot_id: `eq.${snapshotId}`,
    order: 'scope_type.asc,scope_slug.asc',
  });
  const response = await fetch(
    `${supabaseUrl}/rest/v1/directory_location_stats_current?${query.toString()}`,
    { headers: supabaseHeaders(supabaseKey, { Accept: 'application/json' }) },
  );
  if (!response.ok) {
    throw new Error(`Snapshot published but summary read failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

async function fetchClassificationAudit({ supabaseUrl, supabaseKey }) {
  const query = new URLSearchParams({
    select: 'scope_type,total_matches,ambiguous_matches,broad_term_matches',
  });
  const response = await fetch(
    `${supabaseUrl}/rest/v1/directory_location_classification_audit?${query.toString()}`,
    { headers: supabaseHeaders(supabaseKey, { Accept: 'application/json' }) },
  );
  if (!response.ok) {
    throw new Error(`Snapshot published but location audit read failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const scopes = buildScopes(options.includeAllScopes);
  const counts = Object.groupBy(scopes, (scope) => scope.scope_type);

  console.log('Location-stat input validated:');
  console.log(`  national: ${counts.national?.length ?? 0}`);
  console.log(`  states:   ${counts.state?.length ?? 0}`);
  console.log(`  regions:  ${counts.region?.length ?? 0}`);
  console.log(`  cities:   ${counts.city?.length ?? 0}`);
  console.log(`  cutoff:   ${options.cutoff}`);
  console.log(`  method:   ${METHODOLOGY_VERSION}`);
  console.log(`  coverage: ${options.includeAllScopes ? 'national, states, regions, and cities' : 'national and 50 states'}`);

  if (options.dryRun) {
    console.log('Dry run complete; no request was sent and no data changed.');
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY are required.');
  }

  console.log('Building the atomic snapshot; the previous snapshot remains published until completion...');
  const snapshotId = await refreshSnapshot({
    supabaseUrl,
    supabaseKey,
    scopes,
    cutoff: options.cutoff,
  });
  const [rows, locationAudit] = await Promise.all([
    fetchPublishedSummary({ supabaseUrl, supabaseKey, snapshotId }),
    fetchClassificationAudit({ supabaseUrl, supabaseKey }),
  ]);
  const national = rows.find((row) => row.scope_type === 'national');
  const emptyScopes = rows.filter((row) => Number(row.active_count) === 0).length;
  const classificationTotals = locationAudit.reduce((totals, row) => ({
    matches: totals.matches + Number(row.total_matches ?? 0),
    ambiguous: totals.ambiguous + Number(row.ambiguous_matches ?? 0),
    broad: totals.broad + Number(row.broad_term_matches ?? 0),
  }), { matches: 0, ambiguous: 0, broad: 0 });

  console.log(`Published snapshot ${snapshotId} with ${rows.length} scope rows.`);
  console.log(`  completed:       ${national?.completed_at ?? 'unknown'}`);
  console.log(`  content changed: ${national?.content_changed_at ?? 'unknown'}`);
  console.log(`  US active:       ${Number(national?.active_count ?? 0).toLocaleString('en-US')}`);
  console.log(`  US verified:     ${Number(national?.verified_count ?? 0).toLocaleString('en-US')}`);
  console.log(`  US free:         ${Number(national?.free_count ?? 0).toLocaleString('en-US')}`);
  console.log(`  zero-match scopes (shown honestly as zero): ${emptyScopes}`);
  console.log(`  normalized state/city match rows: ${classificationTotals.matches.toLocaleString('en-US')}`);
  console.log(`  ambiguous match rows to review:   ${classificationTotals.ambiguous.toLocaleString('en-US')}`);
  console.log(`  broad-term match rows to review:  ${classificationTotals.broad.toLocaleString('en-US')}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

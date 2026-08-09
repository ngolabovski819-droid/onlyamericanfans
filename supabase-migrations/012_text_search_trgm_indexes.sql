-- Migration 012: Add GIN trigram indexes on username, name, and about
-- Run in Supabase Dashboard -> SQL Editor -> New query
-- IMPORTANT: run each CREATE INDEX statement below ONE AT A TIME, as its own separate query (see
-- the note in 007_stat_leaderboard_indexes.sql -- CONCURRENTLY cannot run inside a transaction
-- block, which is what happens if you paste the whole file and hit Run).
--
-- Why: src/lib/supabase.ts's buildScopeAndClauses() builds `username.ilike.*term*`,
-- `name.ilike.*term*` and `about.ilike.*term*` OR-chains for THREE call sites: the free-text
-- search box (?q=), category pages (categoryTerms), and filter-group checkboxes (filterGroups,
-- about.ilike only). None of those three columns have a supporting index -- only `location` does
-- (migration 002). Confirmed by direct timing against production on 2026-08-09: unfiltered/
-- location-filtered Load More pages consistently return in under ~1s, while free-text search
-- pages (?q=...) ranged from ~0.9s up to 8.4s uncached -- Postgres has no way to satisfy a
-- leading-wildcard ilike on these columns except a full sequential scan of all ~500k rows, and
-- an unindexed ORDER BY favoritedcount DESC after that scan means it can't even stop early. That
-- 8.4s is right at the 8s statement_timeout already documented elsewhere in this codebase, so
-- some fraction of these were likely timing out outright, not just feeling slow.
--
-- This is the same fix already applied to `location` in migration 002, extended to the other
-- three ilike-searched columns so every query shape the app actually issues has index support.
--
-- NOTE: migration 001 added a combined `search_text` generated column + GIN index, but
-- buildScopeAndClauses() has never actually queried `search_text` -- it filters the individual
-- columns directly, so that index has been dead weight (paying write-amplification cost on every
-- insert/update for zero read benefit). These three new indexes are what the code actually needs.
-- Once this migration is confirmed fixing Load More, consider dropping the unused search_text
-- column/index in a follow-up migration -- left alone here to keep this change purely additive.
--
-- CONCURRENTLY means no table lock; each index builds in the background (several minutes each on
-- ~500k rows -- larger than the 70k the location index was originally sized for in migration
-- 002's comment, so budget more time here).

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_username_trgm
  ON onlyfans_profiles
  USING GIN (username gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_name_trgm
  ON onlyfans_profiles
  USING GIN (name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_about_trgm
  ON onlyfans_profiles
  USING GIN (about gin_trgm_ops);

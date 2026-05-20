-- Migration 002: Add GIN trigram index on the location column
-- Run in Supabase Dashboard → SQL Editor → New query
--
-- Why: State-page queries filter by location.ilike.*term* with an OR expression
-- (e.g. OR(location.ilike.*florida*, location.ilike.*miami*, ...)).
-- Without an index, Postgres performs sequential scans and sometimes chooses
-- a slow plan on cold cache, hitting the 8s statement timeout and causing ISR
-- to cache pages with zero creators.
--
-- With this GIN trigram index, all location OR-chains complete in < 500ms
-- regardless of cache temperature.
--
-- pg_trgm is already enabled in every Supabase project.
-- CONCURRENTLY means no table lock; it runs in the background (~1-2 min on 70k rows).

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_trgm
  ON onlyfans_profiles
  USING GIN (location gin_trgm_ops);

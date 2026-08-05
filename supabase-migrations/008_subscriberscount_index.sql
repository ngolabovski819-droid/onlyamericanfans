-- Migration 008: Add a partial btree index for the "Current Subscribed Fans" stat leaderboard
-- Run in Supabase Dashboard → SQL Editor → New query, as its OWN separate query (see the note
-- in 007_stat_leaderboard_indexes.sql — CONCURRENTLY cannot run inside a transaction block, so
-- don't paste this alongside other statements in the same Run).
--
-- Why: fetchCreatorStatLeaders() replaced the favoritescount leaderboard with one based on
-- subscriberscount, always filtered to showsubscriberscount = true (a creator's own choice to
-- make that number public — see the comment in src/lib/supabase.ts). Same timeout risk as
-- migration 007: ordering ~500k rows by an unindexed column times out (57014) once combined with
-- a location/category filter.
--
-- This is a PARTIAL index (WHERE showsubscriberscount = true) rather than a plain one, because
-- every query against this column already carries that exact filter — a partial index matching
-- the query's WHERE clause is both smaller and a better match for the planner than indexing rows
-- that this feature will never read.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onlyfans_profiles_subscriberscount_public
  ON onlyfans_profiles (subscriberscount DESC NULLS LAST)
  WHERE showsubscriberscount = true;

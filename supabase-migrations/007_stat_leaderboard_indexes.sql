-- Migration 007: Add btree indexes for the programmatic "About" SEO stat leaderboards
-- Run in Supabase Dashboard → SQL Editor → New query
--
-- Why: src/lib/supabase.ts's fetchCreatorStatLeaders() orders by favoritedcount,
-- favoritescount, finishedstreamscount, photoscount, postscount, videoscount,
-- audioscount and archivedpostscount (ORDER BY ... DESC LIMIT 5), combined with the
-- same location/category OR-chain filter every scoped page already uses.
--
-- favoritedcount is already fast (~500ms) because it's the column every other query
-- on this site already sorts by. The other seven have no index, so Postgres falls
-- back to a full sequential scan + sort of the whole table before applying LIMIT —
-- confirmed hitting the 8s statement timeout (error 57014) in testing.
--
-- A plain DESC btree index lets Postgres walk rows in already-sorted order and stop
-- as soon as it finds enough rows matching the location/category filter, the same
-- way favoritedcount already does — no full-table sort needed.
--
-- CONCURRENTLY means no table lock; each index builds in the background
-- (a few minutes each on ~500k rows). Safe to run before or after this feature
-- ships — fetchCreatorStatLeaders() already degrades gracefully (returns an empty
-- list, and that stat's section is simply omitted) if a query times out.
--
-- IMPORTANT: run each CREATE INDEX statement below ONE AT A TIME, as its own
-- separate query in the SQL Editor (select just one line, or clear the editor
-- between runs). Pasting the whole file and hitting Run sends all seven as a
-- single multi-statement request, which Supabase/postgREST wraps in an implicit
-- transaction — and CONCURRENTLY errors with "cannot run inside a transaction
-- block" (25001) in that context. Run one, wait for it to finish, then the next.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onlyfans_profiles_favoritescount
  ON onlyfans_profiles (favoritescount DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onlyfans_profiles_finishedstreamscount
  ON onlyfans_profiles (finishedstreamscount DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onlyfans_profiles_photoscount
  ON onlyfans_profiles (photoscount DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onlyfans_profiles_postscount
  ON onlyfans_profiles (postscount DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onlyfans_profiles_videoscount
  ON onlyfans_profiles (videoscount DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onlyfans_profiles_audioscount
  ON onlyfans_profiles (audioscount DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onlyfans_profiles_archivedpostscount
  ON onlyfans_profiles (archivedpostscount DESC NULLS LAST);

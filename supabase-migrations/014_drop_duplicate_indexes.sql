-- Migration 014: Drop exact-duplicate indexes on onlyfans_profiles
-- Run in Supabase Dashboard -> SQL Editor -> New query
-- IMPORTANT: run each DROP INDEX statement below ONE AT A TIME, as its own separate query (see
-- the note in 007_stat_leaderboard_indexes.sql -- CONCURRENTLY cannot run inside a transaction
-- block, which is what happens if you paste the whole file and hit Run).
--
-- Why: direct inspection via SOURCE_SUPABASE_POOLER_URL (2026-08-11) found 50 indexes on
-- onlyfans_profiles totaling 6.97GB -- larger than the 5.06GB table itself. Several past sessions
-- (and possibly other tooling) each independently created "the" trigram/btree index for a column
-- without checking whether one already existed under a different name. Every DROP below was
-- verified via pg_get_indexdef() to be a byte-for-byte identical definition to the twin being
-- kept (same column, same index type/opclass, same predicate) -- these are not judgment calls,
-- they're provable duplicates. Also verified: no foreign key anywhere references
-- onlyfans_profiles, and onlyfans_profiles_id_uniq is a bare index (not backing any constraint),
-- so dropping it is safe.
--
-- Deliberately NOT touched: anything without an exact duplicate, including indexes that look
-- like they belong to a separate scraper/enrichment pipeline sharing this table (face_embedding,
-- raw_json_pending, next_refresh_at, account_status, last_checked_at, active_performers -- none
-- of these columns are referenced anywhere in this app's code) and idx_search_text_trgm (single
-- copy, no duplicate, and confirmed via live Supabase logs on 2026-08-11 to still be serving real
-- query traffic from something -- just not from this app's current code, which never queries
-- search_text -- so it is not this app's call to drop).
--
-- CONCURRENTLY means no table lock; each drop runs in the background (fast -- dropping an index
-- is far cheaper than building one).

DROP INDEX CONCURRENTLY IF EXISTS onlyfans_profiles_id_uniq;       -- dup of onlyfans_profiles_pkey

DROP INDEX CONCURRENTLY IF EXISTS idx_profiles_about_trgm;         -- dup of idx_about_trgm (migration 012)
DROP INDEX CONCURRENTLY IF EXISTS idx_trgm_about;                  -- dup of idx_about_trgm (migration 012)

DROP INDEX CONCURRENTLY IF EXISTS idx_profiles_name_trgm;          -- dup of idx_name_trgm (migration 012)
DROP INDEX CONCURRENTLY IF EXISTS idx_trgm_name;                   -- dup of idx_name_trgm (migration 012)

DROP INDEX CONCURRENTLY IF EXISTS idx_trgm_username;               -- dup of idx_username_trgm (migration 012)
DROP INDEX CONCURRENTLY IF EXISTS idx_profiles_username_trgm;      -- dup of idx_username_trgm (migration 012)

DROP INDEX CONCURRENTLY IF EXISTS idx_location_trgm;               -- dup of idx_trgm_location (the actively-used twin)

DROP INDEX CONCURRENTLY IF EXISTS idx_onlyfans_favoritedcount;     -- dup of idx_favoritedcount_desc
DROP INDEX CONCURRENTLY IF EXISTS idx_profiles_favorited;          -- dup of idx_favoritedcount_desc

DROP INDEX CONCURRENTLY IF EXISTS idx_ofp_isverified;              -- dup of idx_profiles_isverified

DROP INDEX CONCURRENTLY IF EXISTS idx_profiles_subscribeprice;     -- dup of idx_ofp_subscribeprice

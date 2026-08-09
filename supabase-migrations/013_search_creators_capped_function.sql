-- Migration 013: search_creators_capped() -- bounded-candidate-pool search function
-- Run in Supabase Dashboard -> SQL Editor -> New query (this one is fast to create, just a
-- function definition -- no table scan, no CONCURRENTLY, safe to paste and run normally).
--
-- Why: migration 012 fixed the "every search scans the whole table" problem by adding trigram
-- indexes, but for a broad/generic term (e.g. "alt", matching tens of thousands of the ~2M rows)
-- Postgres still has to examine every match to rank them by popularity -- the index makes
-- *finding* matches fast, it can't make *ranking thousands of matches* fast. Confirmed by direct
-- timing on 2026-08-10: narrow terms (chubby, redhead) run in ~0.5-2s post-012, but broad terms
-- (alt, punk, sweet) still range 5-8s+.
--
-- This function bounds the problem: it finds at most `p_candidate_limit` matching rows (default
-- 1000) and ONLY ranks/paginates within that pool, instead of ranking every match in the table.
-- Concretely, `LIMIT p_candidate_limit` with no ORDER BY on the inner query lets Postgres stop
-- scanning as soon as it has enough candidates, so cost stays roughly flat regardless of how many
-- rows a broad term matches overall (thousands or hundreds of thousands, same cost either way).
--
-- Trade-off, stated plainly: for a term matching more than p_candidate_limit rows, ranking happens
-- within whichever candidates Postgres happened to scan first (not guaranteed to be a random or
-- representative sample -- realistically skews toward the table's physical row order), not
-- against every possible match. A search matching fewer than p_candidate_limit rows (the vast
-- majority of real searches) is completely unaffected -- same results as before, just faster.
-- The app is expected to stop offering "Load More" once page_offset + page_size reaches
-- p_candidate_limit, rather than claim there's nothing beyond that boundary is guaranteed missing.
--
-- Every user-supplied value below goes through format(..., %L) (safe literal quoting) -- never
-- raw string concatenation -- so this is not a SQL-injection risk despite building the WHERE
-- clause dynamically. Dynamic SQL (not a plain parameterized query) is required here specifically
-- to preserve the exact `column ILIKE '%term%' OR column ILIKE '%term%'` shape that migration
-- 012's trigram indexes can actually accelerate -- wrapping the same conditions in an
-- array/unnest-based EXISTS check (the "cleaner"-looking alternative) prevents Postgres from
-- pushing the pattern match down into the GIN index at all, silently defeating migration 012.
--
-- RETURNS SETOF onlyfans_profiles (the real row type) rather than a hand-declared column list, so
-- this can't drift out of sync with the table's actual column types.

CREATE OR REPLACE FUNCTION search_creators_capped(
  p_text_terms text[] DEFAULT NULL,        -- free-text (?q=) terms: OR'd across username/name/about
  p_category_terms text[] DEFAULT NULL,    -- category terms: OR'd across username/name/about, ANDed against p_text_terms
  p_location_terms text[] DEFAULT NULL,    -- OR'd against location
  p_filter_groups jsonb DEFAULT NULL,      -- {"groupId": ["term1","term2"], ...} -- each group OR'd on about, groups ANDed
  p_verified boolean DEFAULT NULL,
  p_price_filter text DEFAULT NULL,        -- 'free' | 'under5' | 'under10' | NULL
  p_sort text DEFAULT 'popular',           -- 'popular' | 'newest'
  p_exclude_usernames text[] DEFAULT NULL, -- sponsor-placement pins/exclusions, dropped at the DB level like every other query here
  p_candidate_limit int DEFAULT 1000,
  p_page_size int DEFAULT 24,
  p_offset int DEFAULT 0
)
RETURNS SETOF onlyfans_profiles
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  where_sql text := 'isperformer = true';
  term text;
  or_parts text[];
  grp record;
  order_sql text;
  sql text;
BEGIN
  -- p_text_terms (?q=) and p_category_terms are deliberately two SEPARATE AND'd groups, not
  -- merged into one OR-list — matches buildScopeAndClauses()'s existing semantics in
  -- src/lib/supabase.ts, where a request combining both (free-text search on a category page)
  -- requires a match on EACH independently, not either one.
  IF p_text_terms IS NOT NULL AND array_length(p_text_terms, 1) > 0 THEN
    or_parts := ARRAY[]::text[];
    FOREACH term IN ARRAY p_text_terms LOOP
      or_parts := or_parts || format('username ILIKE %L', '%' || term || '%');
      or_parts := or_parts || format('name ILIKE %L', '%' || term || '%');
      or_parts := or_parts || format('about ILIKE %L', '%' || term || '%');
    END LOOP;
    where_sql := where_sql || ' AND (' || array_to_string(or_parts, ' OR ') || ')';
  END IF;

  IF p_category_terms IS NOT NULL AND array_length(p_category_terms, 1) > 0 THEN
    or_parts := ARRAY[]::text[];
    FOREACH term IN ARRAY p_category_terms LOOP
      or_parts := or_parts || format('username ILIKE %L', '%' || term || '%');
      or_parts := or_parts || format('name ILIKE %L', '%' || term || '%');
      or_parts := or_parts || format('about ILIKE %L', '%' || term || '%');
    END LOOP;
    where_sql := where_sql || ' AND (' || array_to_string(or_parts, ' OR ') || ')';
  END IF;

  IF p_location_terms IS NOT NULL AND array_length(p_location_terms, 1) > 0 THEN
    or_parts := ARRAY[]::text[];
    FOREACH term IN ARRAY p_location_terms LOOP
      or_parts := or_parts || format('location ILIKE %L', '%' || term || '%');
    END LOOP;
    where_sql := where_sql || ' AND (' || array_to_string(or_parts, ' OR ') || ')';
  END IF;

  IF p_filter_groups IS NOT NULL THEN
    FOR grp IN SELECT * FROM jsonb_each(p_filter_groups) LOOP
      SELECT array_agg(format('about ILIKE %L', '%' || t || '%'))
        INTO or_parts
        FROM jsonb_array_elements_text(grp.value) AS t;
      IF or_parts IS NOT NULL AND array_length(or_parts, 1) > 0 THEN
        where_sql := where_sql || ' AND (' || array_to_string(or_parts, ' OR ') || ')';
      END IF;
    END LOOP;
  END IF;

  IF p_exclude_usernames IS NOT NULL AND array_length(p_exclude_usernames, 1) > 0 THEN
    where_sql := where_sql || format(' AND username <> ALL(%L::text[])', p_exclude_usernames);
  END IF;

  IF p_verified IS TRUE THEN
    where_sql := where_sql || ' AND isverified = true';
  END IF;

  IF p_price_filter = 'free' THEN
    where_sql := where_sql || ' AND subscribeprice = 0';
  ELSIF p_price_filter = 'under5' THEN
    where_sql := where_sql || ' AND subscribeprice <= 5';
  ELSIF p_price_filter = 'under10' THEN
    where_sql := where_sql || ' AND subscribeprice <= 10';
  END IF;

  IF p_sort = 'newest' THEN
    order_sql := 'first_seen_at DESC NULLS LAST, favoritedcount DESC';
  ELSE
    order_sql := 'favoritedcount DESC, subscribeprice ASC NULLS LAST';
  END IF;

  sql := format(
    'SELECT * FROM (SELECT * FROM onlyfans_profiles WHERE %s LIMIT %L) capped ORDER BY %s LIMIT %L OFFSET %L',
    where_sql, p_candidate_limit, order_sql, p_page_size, p_offset
  );

  RETURN QUERY EXECUTE sql;
END;
$$;

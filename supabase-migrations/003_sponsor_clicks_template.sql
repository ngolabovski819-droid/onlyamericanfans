-- Template: per-sponsor click-log table.
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query), ONCE per new paid placement
-- that has click tracking enabled.
--
-- Usage: copy this file, replace every `REPLACE_ME` with the sponsor's username (lowercase,
-- [a-z0-9_] only), and run it. The resulting table name MUST exactly match the `clickTable`
-- value you set in src/config/sponsor-overrides.ts for that creator, e.g.:
--   clickTable: 'sponsor_clicks_janedoe'
--
-- The app writes rows through the SUPABASE_KEY service_role key (bypasses RLS), so no INSERT
-- policy is needed for the app itself. RLS stays enabled with no public policies so the table
-- is not readable/writable via the anon key from the browser.
--
-- If this table doesn't exist yet, src/app/go/[username]/route.ts still redirects correctly —
-- the insert just fails silently (logged server-side) and nothing is recorded. Create the table
-- BEFORE going live with a clickTable entry, or you'll lose data for that window.

CREATE TABLE IF NOT EXISTS sponsor_clicks_REPLACE_ME (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  -- Which SITE logged this click — matters the moment the same clickTable is ever shared with
  -- another property's own redirect (see the emilylopz campaign: sponsor_clicks_emilylopz
  -- predates this app and is also written to by fanspedia.net's own /go/ route). Always filter/
  -- group by this column once more than one site can write here.
  site text,
  user_agent text,
  referrer text,
  placement text
);

ALTER TABLE sponsor_clicks_REPLACE_ME ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_REPLACE_ME_clicked_at
  ON sponsor_clicks_REPLACE_ME (clicked_at DESC);

-- Handy reporting query once the table has data:
-- SELECT date_trunc('day', clicked_at) AS day, site, placement, count(*) AS clicks
-- FROM sponsor_clicks_REPLACE_ME
-- GROUP BY 1, 2, 3
-- ORDER BY 1 DESC, 4 DESC;

-- Click-log table for onlyamericanfans.com's own /go/cosplaytsumiko redirect (added 2026-08-27).
-- Isolated `_oaf` table, same convention as the rinayanami / emilylopz / rocketreynaxo /
-- hannazuki tables. This one matters more than usual: `sponsor_clicks_cosplaytsumiko` (no
-- suffix) ALREADY EXISTS and is live (another property's own /go/ redirect writes to it), and so
-- do `sponsor_clicks_cosplaytsumiko_fbf` and `sponsor_clicks_oaussief_cosplaytsumiko`. Never
-- point this app's clickTable at any of those. Verified 2026-08-27 that the `_oaf` name was free
-- (404 via the REST API).
--
-- Full current column set up front, same reasoning as 015: the per-column migrations
-- (009/010/011) only ALTER a hard-coded list of older tables, so a new table must carry every
-- column src/app/go/[username]/route.ts inserts or PostgREST rejects the whole row and every
-- click is silently dropped while the redirect keeps working.

CREATE TABLE IF NOT EXISTS sponsor_clicks_cosplaytsumiko_oaf (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  site text,
  user_agent text,
  referrer text,
  placement text,
  ip_hash text,
  is_datacenter_ip boolean,
  link_verified boolean,
  ip_address text,
  country text,
  city text,
  botid_flagged boolean
);

ALTER TABLE sponsor_clicks_cosplaytsumiko_oaf ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_cosplaytsumiko_oaf_clicked_at
  ON sponsor_clicks_cosplaytsumiko_oaf (clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_cosplaytsumiko_oaf_ip_hash
  ON sponsor_clicks_cosplaytsumiko_oaf (ip_hash);

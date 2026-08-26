-- Click-log table for onlyamericanfans.com's own /go/rinayanami redirect (added 2026-08-26).
-- Isolated `_oaf` table, same convention as the emilylopz / rocketreynaxo / hannazuki tables,
-- so another property's own /go/ redirect for the same creator can never collide with it.
-- Verified before writing this that neither sponsor_clicks_rinayanami nor
-- sponsor_clicks_rinayanami_oaf existed yet (both 404 via the REST API).
--
-- Created with the FULL current column set up front. The later per-column migrations
-- (009 ip_hash/is_datacenter_ip, 010 link_verified, 011 ip_address/country/city) only ALTER a
-- hard-coded list of the tables that existed at the time, so a brand-new table has to carry
-- every column src/app/go/[username]/route.ts inserts from day one — otherwise PostgREST
-- rejects the insert on the first unknown column and every click is silently dropped (the
-- redirect still works, so nothing visibly breaks). botid_flagged mirrors a column present on
-- the live _oaf tables that was added outside this repo's migrations.

CREATE TABLE IF NOT EXISTS sponsor_clicks_rinayanami_oaf (
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

ALTER TABLE sponsor_clicks_rinayanami_oaf ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_rinayanami_oaf_clicked_at
  ON sponsor_clicks_rinayanami_oaf (clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_rinayanami_oaf_ip_hash
  ON sponsor_clicks_rinayanami_oaf (ip_hash);

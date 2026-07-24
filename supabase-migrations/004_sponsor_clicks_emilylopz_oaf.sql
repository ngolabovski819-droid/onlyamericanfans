-- Click-log table for onlyamericanfans.com's own /go/emilylopz redirect.
--
-- NOT the same table as `sponsor_clicks_emilylopz` — that one already existed before this app's
-- paid-placement system was built and is actively written to by a DIFFERENT site's own
-- /go/emilylopz redirect (fanspedia.net). Rather than ALTERing a live table owned by code we
-- don't control, this creator's onlyamericanfans-specific clicks get their own table — isolated,
-- easy to report on independently, and zero risk to the other site's existing data or schema.
-- If the same creator is ever run as a campaign on more than one of OUR OWN sites at once, follow
-- this `sponsor_clicks_<username>_<site>` naming pattern rather than sharing one table.
--
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query).

CREATE TABLE IF NOT EXISTS sponsor_clicks_emilylopz_oaf (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  site text,
  user_agent text,
  referrer text,
  placement text
);

ALTER TABLE sponsor_clicks_emilylopz_oaf ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_emilylopz_oaf_clicked_at
  ON sponsor_clicks_emilylopz_oaf (clicked_at DESC);

-- Handy reporting query once the table has data:
-- SELECT date_trunc('day', clicked_at) AS day, placement, count(*) AS clicks
-- FROM sponsor_clicks_emilylopz_oaf
-- GROUP BY 1, 2
-- ORDER BY 1 DESC, 3 DESC;

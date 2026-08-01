-- Click-log table for onlyamericanfans.com's own /go/rocketreynaxo redirect.
-- Kept separate from FansPedia's campaign analytics.

CREATE TABLE IF NOT EXISTS sponsor_clicks_rocketreynaxo_oaf (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  site text,
  user_agent text,
  referrer text,
  placement text
);

ALTER TABLE sponsor_clicks_rocketreynaxo_oaf ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_rocketreynaxo_oaf_clicked_at
  ON sponsor_clicks_rocketreynaxo_oaf (clicked_at DESC);

-- OnlyAmericanFans campaigns added 2026-10-26. Run in the Supabase SQL Editor.
-- All nine non-suffixed names already belong to FansPedia (REST 200 with rows).
-- All nine _oaf names were absent (REST 404) before preparing this migration.
-- Uses the full schema from 015, including site and every current /go insert column.
-- This creates isolated tables only; it does not publish the website.

BEGIN;

DO $$
DECLARE
  creator text;
  table_name text;
BEGIN
  FOREACH creator IN ARRAY ARRAY[
    'lucierain', 'eviecarrol', 'amymyohmy', 'lillyylou', 'aprilcollinsss',
    'itsgiastar', 'ellaajanee', 'emillyybrown', 'gracieharper'
  ] LOOP
    table_name := 'sponsor_clicks_' || creator || '_oaf';
    EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I (
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
    )', table_name);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (clicked_at DESC)',
      'idx_' || table_name || '_clicked_at', table_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (ip_hash)',
      'idx_' || table_name || '_ip_hash', table_name);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;

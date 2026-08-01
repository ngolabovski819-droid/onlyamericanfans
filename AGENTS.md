<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Paid-placement / sponsored-creator system

This site is a Next.js App Router site over a Supabase Postgres table (`onlyfans_profiles`),
queried via raw PostgREST `fetch()` calls in `src/lib/supabase.ts` (not the `supabase-js`
client). `SUPABASE_KEY` in `.env.local` is a `service_role` key — it bypasses RLS, so the app
can read AND write directly through the REST API without a separate key. There are no
individual creator profile pages on this site; every card links straight out.

There are two SEPARATE config files, and they answer two different questions:

- **`src/config/sponsor-placements.ts`** — WHERE a creator appears. Maps a "scope" (`'home'`,
  `` `category:<slug>` ``, `` `state:<slug>` ``, `` `city:<slug>` ``, `` `region:<slug>` ``,
  `'search'` — this site is US-only, so there's no `country:<slug>` scope) to a rule of
  `pinned: [{ username, position }]` (exact 1-based global position, across the FULL paginated
  list) and `excluded: [username]`. Build campaigns with the `pin()` / `pinAllCategories()` /
  `pinAllStates()` / `pinAllCities()` / `pinAllRegions()` / `pinStates()` / `exclude()` helpers
  inside `buildPlacements()` — never hand-list scopes one by one.
- **`src/config/sponsor-overrides.ts`** — what a creator's card LINKS TO and SHOWS once placed,
  keyed by lowercase username only (no scope). `linkOverride` (custom tracking URL) and
  `imageOverride` (custom card image, deliberately kept OUT of the `onlyfans_profiles` table so
  it survives the next scrape/sync and is trivial to remove) apply **everywhere that creator's
  card renders** — organic results, their pinned slot if any, any future "similar creators"
  surface — not just a pinned scope. `clickTable` opts them into click logging.

## How a request actually gets a sponsored card on screen

`src/lib/sponsorship.ts` → `fetchScopedCreators({ scope, ...searchParams })` is the orchestrator.
Every page that renders `<CreatorGrid>` calls this (never `fetchCreators` directly) and passes
the SAME `scope` string to `<CreatorGrid scope={...}>` so client-side "Load More" (which hits
`/api/search?scope=...`) stays consistent with the SSR page. It:

1. Reads the scope's `ScopeRule` from `sponsor-placements.ts`.
2. Fetches the organic page with pinned+excluded usernames excluded at the DB level
   (`username=not.in.(...)`) at a hand-computed offset that already accounts for how many pins
   land on earlier pages — this is what keeps pagination from skipping or duplicating a row.
3. Fetches any pins landing on THIS page by exact username (`fetchCreatorsByUsernames`).
4. Slots pins into their exact index, fills every other slot with organic results in order.
5. Runs EVERY creator in the result (pinned or not) through `sponsor-overrides.ts` — this is
   what makes `linkOverride`/`imageOverride` follow a creator into organic results too.

**Position is relative to that scope's real pageSize** (20 on home, 24 everywhere else). If you
ever change a page's `pageSize`, every pin position for that scope shifts — update
`sponsor-placements.ts` in the same change.

`CreatorCard.tsx` sets `creator.sponsored` → renders the "Ad · Sponsored" disclosure badge
(required whenever that flag is set — legal disclosure, not optional styling) and routes the
card's outbound link through `/go/[username]` whenever `sponsored` OR `sponsorTracked` is set;
everyone else still links straight to `onlyfans.com` as before (no redirect hop added for the
~500k non-sponsored creators).

## `/go/[username]` redirect (`src/app/go/[username]/route.ts`)

Looks up the sponsor override, logs a click row (if `clickTable` is set and the User-Agent isn't
a bot — see `src/lib/bot-detection.ts`) with a `placement` label derived server-side from the
`Referer` header (`src/lib/placement.ts` — internal paths map to short labels like `home` /
`` category:<slug> ``; other hosts become `` external:<hostname> ``; a missing referrer is
legitimate — pasted links, in-app browsers, messaging apps strip it — and logs as `null`, not a
bug), THEN redirects (307, `Cache-Control: no-store`) to `linkOverride` or the default OnlyFans
URL.

**Two gotchas that will silently corrupt click data if you touch this code:**

1. **Never add `rel="noreferrer"`** to a link pointing at `/go/...`. It stops the browser
   sending a Referer to the redirect route itself, zeroing out placement attribution for the
   site's own internal traffic. Use `noopener`/`nofollow` (+`sponsored` where relevant) instead
   — `CreatorCard.tsx` already does this correctly; don't "fix" it back to `noreferrer`.
2. **Never wrap a `/go/` link in `<Link prefetch>` without `prefetch={false}`.** Next.js
   prefetches same-origin `<Link>`s as they scroll into the viewport, which would fire the
   redirect (and therefore the click-log insert) on page load, before any real click happens —
   invisible to curl/server-log testing, only visible with a real browser. `CreatorCard.tsx`
   deliberately uses a plain `<a>`, not `<Link>`, specifically to sidestep this — Next.js only
   prefetches its own `<Link>` component, so a raw anchor has nothing to disable. If this is
   ever ported to `<Link>`, `prefetch={false}` is mandatory and must be verified with an actual
   browser (Playwright: load + scroll a page with a sponsored card, assert zero requests to
   `/go/`, then click and assert exactly one).

## Click-log tables

One Supabase table per paying client (`sponsor_clicks_<username>`), created by running
`supabase-migrations/003_sponsor_clicks_template.sql` (copy it, replace `REPLACE_ME`, run in
the Supabase SQL Editor) — the app talks to Supabase only through the REST API and can't run
arbitrary DDL, so table creation is always a migration file you run by hand, matching
`001_search_text_gin_index.sql` / `002_location_gin_index.sql`. Create the table BEFORE setting
`clickTable` in `sponsor-overrides.ts`, or clicks in that window are silently dropped (the
redirect still works — it just skips logging when the insert fails).

## Resilience (category/location pages under load)

`fetchCreators()` (`src/lib/supabase.ts`) accepts `fallbackToPopularIfEmpty`, which
`fetchScopedCreators` enables by default: if a query filtered by `locationTerms`/`categoryTerms`/
`filterGroups` comes back with zero rows (a curated term list can legitimately match nothing,
or a filtered query can time out and get swallowed as empty — indistinguishable from the
caller's side, and the right product answer is the same either way), it retries once with those
filters stripped to a plain "popular" list, and caps the displayed `total` at 96 so a category
page never shows an absurd unfiltered site-wide count under its heading. This deliberately does
**not** trigger on the free-text `q` search box — a genuine zero-match search should show "no
results," not paper over it with unrelated popular creators.

## Adding a new paid order

1. Get the creator into `onlyfans_profiles` if they aren't already indexed — if this needs a
   one-off fetch, do it from an isolated working directory/context. Never touch the running
   scraper/import process or its state files.
2. **Before assuming a `sponsor_clicks_<username>` name is free: `SELECT * FROM` it first.** A
   table can already exist and be actively written to by a DIFFERENT site's own redirect for the
   same creator — the emilylopz table (below) was live with 69+ rows from fanspedia.net before
   this system ever touched it, with a different schema (`clicked_at` not `timestamp`) than
   assumed. If a name collides with something already live and owned by other code, use an
   isolated `sponsor_clicks_<username>_<site>` name instead of reusing/ALTERing theirs.
3. **Don't assume what a "tracking link" points to — confirm the literal final destination.**
   A link that itself looks like a redirect (e.g. `https://otherproperty.com/go/<username>`) may
   or may not be intentional multi-hop routing through a shared tracking hub; ask rather than
   chain through it silently. `linkOverride` should be exactly the URL the order specifies as the
   actual destination.
4. Add pin(s) in `src/config/sponsor-placements.ts` (use the bulk helpers for multi-scope buys).
5. Add the entry in `src/config/sponsor-overrides.ts` (`linkOverride` / `imageOverride` /
   `clickTable` as purchased).
6. If tracking, run the click-table migration (`003_sponsor_clicks_template.sql` copied to a
   real filename, per step 2's naming) against Supabase BEFORE going live.
7. Verify locally in a real browser: pin lands at the right position, badge shows, link goes
   through `/go/`, a real click logs a row, scrolling past the card does NOT log a row.
   **When curl-testing location/category pages, follow redirects (`curl -L`)** so a redirect can
   never be mistaken for a missing pin.
8. Update the "Active campaigns" log below with what was added.
9. Report back before pushing — never deploy without explicit sign-off, even after local
   verification passes.

## Active campaigns

**Keep this section current — update it in the same change whenever a campaign is added,
changed, or ended.** This is the fast answer to "what's live right now" without having to
re-derive it by reading every config file and Supabase table by hand.

- **emilylopz** — added 2026-07-24.
  - Placements: #1 position on `home`, `search`, every category, every state, every city (not
    regions — wasn't part of the order).
  - Destination: `https://onlyfans.com/emilylopz/c545` (direct — NOT routed through
    fanspedia.net; that was considered and explicitly rejected, see git history).
  - Image: default synced avatar, no override.
  - Card carousel: synced avatar, synced header, then 24 campaign gallery images imported from
    `emily photos.zip` (26 total slides; 29 originals minus 5 SHA-256 duplicates).
  - Card tags: `GFE`, `Feet fetish`, `Squirting`, and `+9` (do not add `Sex toys`).
  - Search bars: sponsored suggestion at the top of focused, empty homepage, search-page, and
    responsive header inputs, configured through `src/config/search-sponsor.ts`.
  - Click tracking: `sponsor_clicks_emilylopz_oaf` — an isolated table, deliberately separate
    from `sponsor_clicks_emilylopz` (no `_oaf` suffix), which is a DIFFERENT, live table that
    fanspedia.net's own `/go/emilylopz` redirect already writes to. Do not point this app's
    `clickTable` at the non-`_oaf` table.
  - Status: migration `004_sponsor_clicks_emilylopz_oaf.sql` is live and click logging was
    verified end-to-end on 2026-08-01.
- **rocketreynaxo** — added 2026-08-01.
  - Placements: #2 position after Emily on `home`, `search`, every category, every state, and
    every city (not regions).
  - Destination: `https://onlyfans.com/rocketreynaxo/c58`.
  - Images: 10 campaign images in supplied order; `rocket-01.jpg` is the lead image.
  - Card tags: `Asian MILF`, `Busty`, `Curvy`.
  - Search bars: second sponsored suggestion after Emily.
  - Click tracking: `sponsor_clicks_rocketreynaxo_oaf`, isolated from FansPedia.
  - Status: migration `005_sponsor_clicks_rocketreynaxo_oaf.sql` is live and click logging was
    verified end-to-end on 2026-08-01.
- **hannazuki** — added 2026-08-01.
  - Placements: #3 position after Emily and Rocket Reyna on `home`, `search`, every category,
    every state, and every city (not regions).
  - Destination: `https://onlyfans.com/hannazuki/c1043`.
  - Images: 7 campaign images in supplied numeric order; `hanna-01.jpg` is the lead image.
  - Card tags: `asian`, `cosplay`, `egirl`, `GFE`.
  - Search bars: third sponsored suggestion after Emily and Rocket Reyna.
  - Click tracking: `sponsor_clicks_hannazuki_oaf`, isolated from FansPedia.
  - Status: migration `006_sponsor_clicks_hannazuki_oaf.sql` is live and click logging was
    verified end-to-end on 2026-08-01.
<!-- END:nextjs-agent-rules -->

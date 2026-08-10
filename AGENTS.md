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

## Static browsing pages (states/cities/regions/categories)

As of 2026-08-10, every state/city/region/category page — plus their pagination — is **fully
static**, pre-built at deploy time via `generateStaticParams()`, with zero live database calls
per visitor. This replaced the original live "Load More" pattern for these surfaces because (a)
this project's `onlyfans_profiles` no longer gets fresh rows from the scraper on this app's
behalf — per the project owner, only sponsored creators get added going forward, always via a
config change + redeploy, never a bulk data refresh — and (b) sponsor changes already require a
redeploy regardless, so ISR's background auto-refresh wasn't buying anything a redeploy doesn't
already cover.

- **Routes**: `src/app/[locationSlug]/page.tsx` (page 1 of every state/city/region) +
  `src/app/[locationSlug]/[page]/page.tsx` (page 2+), and the identical pair under
  `src/app/categories/[slug]/`. All four render `StaticCreatorGrid`
  (`src/components/StaticCreatorGrid.tsx` — real `<Link>` Prev/Next, no client-side fetch)
  instead of `CreatorGrid` (client-side "Load More" — still used by the homepage and search).
- **Pagination is capped at 1000 results (~42 pages) per scope** — `src/lib/pagination.ts`'s
  `cappedPageCount()`. Nobody scrolls 42 pages deep; this bounds how many pages get pre-built for
  a large state/category instead of potentially thousands.
- **`export const revalidate = false`** on all four route files — pages are cached indefinitely,
  no background auto-refresh, ever. **Setting this alone does NOT freeze a route** — per
  `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`, Next.js
  takes the LOWEST revalidate value found anywhere in the route (segment config + every
  individual `fetch()` call) to determine the whole route's real refresh behavior. Every fetch
  these pages can reach — `fetchCreatorsInner`, `fetchCreatorsCappedInner`,
  `fetchCreatorsByUsernames`, `fetchCreatorStatLeaders` (all in `src/lib/supabase.ts`) — accepts
  an optional `revalidate` param for exactly this reason, and the frozen route files explicitly
  pass `revalidate: false` through `fetchScopedCreators`/`CreatorStatsSection` at every call
  site. Adding a new fetch reachable from one of these pages without the same explicit
  `revalidate: false` will silently drag the whole route back onto a timer.
- **Gotcha**: sizing each scope's pagination is a `pageSize: 1` count-only lookup inside
  `generateStaticParams()`. This MUST call `fetchCreators()` directly (`src/lib/supabase.ts`),
  never `fetchScopedCreators()` (`src/lib/sponsorship.ts`) — the latter slots sponsor pins into
  the requested page before deciding how many organic rows to fetch, and every scope has a pin
  at position 1, so with `pageSize: 1` the single pinned slot fills the whole "page," the real
  count query never runs, and `total` collapses to just the pinned count (3). This silently
  generated ZERO page-2+ routes for every state/category the first time it shipped — the build
  succeeded either way, just with far fewer pages than it should have; only caught by inspecting
  actual build output, not by the build passing.
- **Not yet static**: the homepage (`/`) still uses live `CreatorGrid`/"Load More" for its
  Trending section — same live-per-click-query pattern as before, on the site's highest-traffic
  page. Known follow-up, intentionally not yet fixed (as of 2026-08-10). Likely fix: drop its
  Load More entirely and let the existing "See all trending →" link send overflow traffic to the
  always-live `/onlyfans-search` page instead, rather than building homepage-specific
  pagination.
- **`/onlyfans-search` and `/api/search` remain live/dynamic on purpose** — free-text search
  can't be pre-built. This is the only surface on the site that still queries the database on
  every visitor request.
- **Deploy cost — don't redeploy casually.** Every deploy rebuilds all ~6,450 static pages, each
  one querying the database at build time (capped at 2 concurrent workers via `next.config.ts`'s
  `experimental.cpus: 2`, specifically so a deploy's build-time query burst can't repeat the
  lean-project outage below). Locally this takes ~7 minutes. Because pages are frozen rather than
  on a timer, there's no freshness reason to ever redeploy — only deploy for an actual code
  change, and batch multiple small changes into one deploy instead of shipping them one at a
  time.

## Abandoned: dedicated "lean" Supabase project

Tried and fully reverted on 2026-08-10 — noted here so a future session doesn't rediscover and
retry the same dead end. The idea: move the ~214k US-matching rows (and only the ~31 columns the
app actually uses) to a separate, dedicated free-tier Supabase project, to get off the original
shared project's contended compute. It was built, tested, and cut over to production — and
immediately failed under real visitor load: the free tier's PostgREST layer (not Postgres
itself) couldn't keep up, causing timeouts and a real production outage. A paid compute upgrade
was considered and rejected once the fully-static approach above made the original performance
problem moot anyway — a static page never queries any database on a visitor request, lean
project or not.

**Fully reverted** — if you find references to any of this, they're stale:
- `SUPABASE_URL`/`SUPABASE_KEY` point at the original project again (both local `.env.local` and
  Vercel production).
- `LEAN_SUPABASE_POOLER_URL`, `SOURCE_SUPABASE_POOLER_URL`, and `CRON_SECRET` env vars were
  deleted from Vercel — they only existed to support the sync job below.
- `src/app/api/cron/sync-creators/route.ts` and `vercel.json` (the 6-hourly cron that kept the
  lean project's data fresh) were deleted entirely.
- `scripts/sync-lean-creators.mjs` (the one-off manual backfill script) still exists but is now
  orphaned dead code — nothing calls it anymore. Safe to delete whenever; left in place since
  removing it wasn't blocking anything.

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

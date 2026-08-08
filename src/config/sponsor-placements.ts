/* eslint-disable @typescript-eslint/no-unused-vars -- these are authoring helpers for
   buildPlacements(); which ones are "used" changes with every paid order, so unused-at-any-
   given-moment is expected here, not a bug. */
/**
 * Paid PLACEMENT config — controls WHERE a sponsored creator appears.
 *
 * Separate from src/config/sponsor-overrides.ts, which controls what the card LINKS TO and
 * SHOWS once it's placed (tracking link, custom image). A creator can have an override without
 * a placement (organic-only, click-tracked) and vice versa, but in practice a paid pin almost
 * always comes with an override too.
 *
 * A "scope" is one rendering context: 'home', `category:<slug>`, `state:<slug>`, `city:<slug>`,
 * `region:<slug>`, or `nearby:<citySlug>` (this site is US-only — there's no country dimension,
 * unlike sites that pin per-country). Every scope maps to a ScopeRule:
 *
 * `nearby:<citySlug>` is the "Showing creators near <city>" strip (src/components/
 * NearbyCreatorsStrip.tsx, fetched via src/app/api/nearby/route.ts) that renders above the
 * CreatorGrid on every page, site-wide. Its `citySlug` is whichever src/config/cities.ts entry
 * is geographically nearest to the VISITOR (by IP geo, or precise browser geolocation once they
 * click "Use precise location") — NOT the page's own scope. It is deliberately independent of
 * that city's own `city:<slug>` page scope: pinning a creator on the Miami city page does NOT
 * automatically pin them into the Miami nearby-widget, and vice versa. Use pinAllNearbyCities()
 * below to pin across every nearby-widget scope at once, same pattern as pinAllCities().
 *
 * IMPORTANT: this scope's pageSize is always 5 (see NearbyCreatorsStrip) — never reuse a
 * `nearby:<slug>` position number copied from a `city:<slug>` pin, they are different pagesizes
 * on different pagination math.
 *
 * `nearby:fallback` is the ONE extra scope in this family: when a visitor has no location signal
 * at all (no IP geo, geolocation denied/unavailable — always true in local dev), the widget shows
 * a plain "Popular creators" list instead of a city-based one, so it's never a dead end. Pin here
 * with `pin('nearby:fallback', username, position)` if a campaign should also show up for those
 * visitors specifically.
 *   - pinned: creators forced to an exact 1-based GLOBAL position in that scope's paginated
 *     list, fetched even if they wouldn't naturally rank there.
 *   - excluded: creators hidden entirely from that scope.
 *
 * fetchScopedCreators() (src/lib/sponsorship.ts) is what actually reads this at request time —
 * this file only declares the rules.
 *
 * DO NOT hand-list dozens of near-identical entries to pin one creator across many scopes
 * (e.g. "every category"). Use the pin*() helpers below inside buildPlacements(), which
 * generate the scope keys from the live category/state/city/region config so new
 * categories/cities automatically inherit correct behavior.
 */

import { categories } from './categories';
import { states } from './states';
import { cities } from './cities';
import { regions } from './regions';

export interface PinnedEntry {
  /** OnlyFans username — matched case-insensitively. */
  username: string;
  /** 1-based position in the GLOBAL paginated list for this scope (relative to that page's real pageSize — 20 on home, 24 on category/location/search pages). */
  position: number;
}

export interface ScopeRule {
  pinned: PinnedEntry[];
  excluded: string[];
}

/** 'home' | `category:${slug}` | `state:${slug}` | `city:${slug}` | `region:${slug}` | 'search' */
export type ScopeId = string;

type PlacementMap = Record<ScopeId, ScopeRule>;

function getOrCreate(rules: PlacementMap, scope: ScopeId): ScopeRule {
  return (rules[scope] ??= { pinned: [], excluded: [] });
}

function buildPlacements(): PlacementMap {
  const rules: PlacementMap = {};

  /** Pin one creator at `position` in a single scope. */
  function pin(scope: ScopeId, username: string, position: number): void {
    getOrCreate(rules, scope).pinned.push({ username, position });
  }

  /** Hide one creator entirely from a single scope. */
  function exclude(scope: ScopeId, username: string): void {
    getOrCreate(rules, scope).excluded.push(username);
  }

  /** Pin a creator at `position` across every category page at once. */
  function pinAllCategories(username: string, position: number, except: string[] = []): void {
    for (const c of categories) if (!except.includes(c.slug)) pin(`category:${c.slug}`, username, position);
  }

  /** Pin a creator at `position` across every state page at once. */
  function pinAllStates(username: string, position: number, except: string[] = []): void {
    for (const s of states) if (!except.includes(s.slug)) pin(`state:${s.slug}`, username, position);
  }

  /** Pin a creator at `position` across every city page at once. */
  function pinAllCities(username: string, position: number, except: string[] = []): void {
    for (const c of cities) if (!except.includes(c.slug)) pin(`city:${c.slug}`, username, position);
  }

  /** Pin a creator at `position` across every region page at once. */
  function pinAllRegions(username: string, position: number, except: string[] = []): void {
    for (const r of regions) if (!except.includes(r.slug)) pin(`region:${r.slug}`, username, position);
  }

  /** Pin a creator at `position` across every city's "Showing creators near <city>" widget scope at once (pageSize 5 — see the nearby:<citySlug> note above). */
  function pinAllNearbyCities(username: string, position: number, except: string[] = []): void {
    for (const c of cities) if (!except.includes(c.slug)) pin(`nearby:${c.slug}`, username, position);
  }

  /** Pin a creator at `position` across a hand-picked list of state slugs (e.g. a "Tier 1" bundle you define per order). */
  function pinStates(username: string, position: number, stateSlugs: string[]): void {
    for (const slug of stateSlugs) pin(`state:${slug}`, username, position);
  }

  // ===================================================================
  // ACTIVE CAMPAIGNS — add one block per paid order. Example (inactive):
  //
  // pin('home', 'exampleuser', 1);
  // pinAllCategories('exampleuser', 1, ['free']); // skip the Free category
  // pinStates('exampleuser', 2, ['california', 'texas', 'florida', 'new-york']);
  // exclude('category:teen', 'someunrelateduser');
  // ===================================================================

  // emilylopz — #1 position on home, every category, every state and every city.
  // (Regions — northeast-onlyfans etc. — intentionally NOT included; wasn't part of the ask.)
  pin('home', 'emilylopz', 1);
  pinAllCategories('emilylopz', 1);
  pinAllStates('emilylopz', 1);
  pinAllCities('emilylopz', 1);
  pin('search', 'emilylopz', 1);

  // rocketreynaxo — #2 position after Emily on home, every category, every
  // state, every city, and search results.
  pin('home', 'rocketreynaxo', 2);
  pinAllCategories('rocketreynaxo', 2);
  pinAllStates('rocketreynaxo', 2);
  pinAllCities('rocketreynaxo', 2);
  pin('search', 'rocketreynaxo', 2);

  // hannazuki — #3 position after Emily and Rocket Reyna on the same scopes.
  pin('home', 'hannazuki', 3);
  pinAllCategories('hannazuki', 3);
  pinAllStates('hannazuki', 3);
  pinAllCities('hannazuki', 3);
  pin('search', 'hannazuki', 3);

  return rules;
}

const placements: PlacementMap = buildPlacements();

export function getScopeRule(scope: ScopeId): ScopeRule {
  return placements[scope] ?? { pinned: [], excluded: [] };
}

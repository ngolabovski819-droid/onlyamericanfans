export interface Creator {
  id: number;
  username: string;
  name: string | null;
  about: string | null;
  location: string | null;
  avatar: string | null;
  avatarC144: string | null;
  header: string | null;
  isVerified: boolean;
  subscribePrice: number | null;
  favoritedCount: number;
  subscribersCount: number | null;
  postsCount: number | null;
  photosCount: number | null;
  videosCount: number | null;
  bundle1Price: number | null;
  bundle1Duration: number | null;
  bundle1Discount: number | null;
  bundle2Price: number | null;
  bundle2Duration: number | null;
  bundle2Discount: number | null;
  bundle3Price: number | null;
  bundle3Duration: number | null;
  bundle3Discount: number | null;
  promotion1Price: number | null;
  promotion1Discount: number | null;

  // --- Sponsor-placement fields ---
  // Populated by fetchScopedCreators() from src/config/sponsor-placements.ts and
  // src/config/sponsor-overrides.ts — never persisted in the database.
  /** True only when this exact card render is a paid PINNED placement. Drives the "Ad" disclosure. */
  sponsored?: boolean;
  /** Custom tracking/referral URL from sponsor-overrides.ts, applied wherever this creator's card renders. */
  linkOverride?: string;
  /** Custom card image from sponsor-overrides.ts, applied wherever this creator's card renders. */
  imageOverride?: string;
  /** Extra campaign images appended after the override, avatar, and header images. */
  sponsorGalleryImages?: string[];
  /** Compact descriptive tags shown only on sponsored placements. */
  sponsorTags?: string[];
  /** Number rendered as a final "+N" sponsored tag. */
  sponsorAdditionalTagCount?: number;
  /** True whenever this creator has ANY sponsor-overrides.ts entry (pinned or not) — routes the card link through /go/[username] so clicks can be logged/redirected. */
  sponsorTracked?: boolean;
}

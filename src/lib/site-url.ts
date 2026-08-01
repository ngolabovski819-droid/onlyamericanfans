const DEFAULT_SITE_URL = 'https://www.onlyamericanfans.com';

/** Canonical production origin, always without a trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL)
  .trim()
  .replace(/\/+$/, '');
